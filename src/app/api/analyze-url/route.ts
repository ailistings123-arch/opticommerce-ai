import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { ApiResponse, Platform, OptimizedContent } from '@/types';
import { UrlAnalyzerService } from '@/lib/services/UrlAnalyzerService';
import { AIService } from '@/lib/ai/aiService';

// Helper function to remove undefined values from objects
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    if (!adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { url, analysisType, purpose, productDifferences, yourPricePoint, yourBrandName, additionalFeatures } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check user credits BEFORE processing
    if (adminDb) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData && userData.usageCount >= userData.usageLimit) {
        return NextResponse.json(
          { success: false, error: 'Usage limit exceeded. Please upgrade your plan to continue.' },
          { status: 403 }
        );
      }
    }

    // Extract platform from URL
    let platform: Platform = 'amazon';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon')) platform = 'amazon';
    else if (urlLower.includes('ebay')) platform = 'ebay';
    else if (urlLower.includes('etsy')) platform = 'etsy';
    else if (urlLower.includes('shopify') || urlLower.includes('.store') || urlLower.includes('.shop')) platform = 'shopify';
    else if (urlLower.includes('walmart')) platform = 'walmart';
    else if (urlLower.includes('/product/') || urlLower.includes('/shop/') || urlLower.includes('woocommerce')) platform = 'woocommerce';

    // Scrape the URL to get actual product data
    let scrapedData;
    try {
      scrapedData = await UrlAnalyzerService.analyzeUrl(url);
      console.log('[API] URL scraped successfully:', scrapedData.title);
    } catch (error: any) {
      console.error('[API] URL scraping failed:', error.message);
      return NextResponse.json(
        { success: false, error: `Failed to analyze URL: ${error.message}` },
        { status: 422 }
      );
    }

    // NOW OPTIMIZE WITH AI - WITH BACKEND SEO VERIFICATION
    console.log('[API] Optimizing with AI (with backend SEO verification)...');
    
    try {
      let aiResult: Awaited<ReturnType<typeof AIService.generateListing>> | undefined;
      let attempts = 0;
      const maxAttempts = 3; // Try up to 3 times to get 80+ score
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`[API] Generation attempt ${attempts}/${maxAttempts}...`);
        
        aiResult = await AIService.generateListing({
          platform,
          productData: {
            title: scrapedData.title || 'Product Title',
            description: scrapedData.description || 'Product description',
            keywords: scrapedData.bullets || [],
            category: scrapedData.category,
            price: scrapedData.price,
            specifications: scrapedData.specifications
          },
          mode: 'analyze' // Use analyze mode for URL analysis
        }, {
          maxRetries: 1, // Reduce retries for faster response
          validateResponse: true,
          sanitizeInput: true
        });

        const seoScore = aiResult.qualityScore?.percentage || 0;
        console.log(`[API] Attempt ${attempts} - SEO score: ${seoScore}%`);
        
        // Backend SEO verification - check if score meets quality threshold
        if (seoScore >= 80) {
          console.log('[API] ✅ SEO verification passed - Score meets quality threshold (80+)');
          break;
        } else if (attempts < maxAttempts) {
          console.log(`[API] ⚠️  SEO score below threshold (${seoScore}% < 80%), regenerating...`);
          console.log('[API] Issues:', aiResult.qualityScore?.recommendations.slice(0, 3).join(', '));
        } else {
          console.log(`[API] ⚠️  Final attempt - Score: ${seoScore}% (below 80% threshold)`);
        }
      }

      console.log('[API] AI optimization complete, Final SEO score:', aiResult!.qualityScore?.percentage);

      // Build optimized analysis
      const analysis: any = {
        title: aiResult!.listing.title,
        description: aiResult!.listing.description,
        bullets: aiResult!.listing.bullets || [],
        tags: aiResult!.listing.keywords || [],
        seoScore: aiResult!.qualityScore?.percentage || 85,
        improvements: aiResult!.qualityScore?.recommendations || [],
        platform: platform as Platform,
        analysisType,
        purpose,
        images: scrapedData.images || [],
        platform_notes: aiResult!.listing.platform_notes
      };

      // Add optional fields
      if (scrapedData.price !== undefined && scrapedData.price !== null) {
        analysis.price = scrapedData.price;
      }
      if (scrapedData.specifications && scrapedData.specifications.length > 0) {
        analysis.specifications = scrapedData.specifications;
      }
      if (scrapedData.brand) {
        analysis.brand = scrapedData.brand;
      }
      if (scrapedData.rating !== undefined && scrapedData.rating !== null) {
        analysis.rating = scrapedData.rating;
      }
      if (scrapedData.reviewCount !== undefined && scrapedData.reviewCount !== null) {
        analysis.reviewCount = scrapedData.reviewCount;
      }

      // Add customization for create-similar mode
      if (analysisType === 'create-similar') {
        analysis.customization = {};
        if (productDifferences) analysis.customization.differences = productDifferences;
        if (yourPricePoint !== undefined && yourPricePoint !== null) analysis.customization.pricePoint = yourPricePoint;
        if (yourBrandName) analysis.customization.brandName = yourBrandName;
        if (additionalFeatures) analysis.customization.additionalFeatures = additionalFeatures;
      }

      // Save to Firestore
      if (adminDb) {
        const analysisRef = adminDb.collection('urlAnalyses').doc();
        const cleanedData = removeUndefined({
          userId,
          url,
          platform,
          analysisType,
          purpose,
          analysis,
          createdAt: new Date().toISOString(),
          status: 'completed'
        });
        await analysisRef.set(cleanedData);
        
        // INCREMENT USAGE COUNT
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const currentUsage = userDoc.data()?.usageCount || 0;
        await adminDb.collection('users').doc(userId).update({
          usageCount: currentUsage + 1,
          lastUsed: new Date().toISOString()
        });
        
        console.log(`[API] User ${userId} usage: ${currentUsage} -> ${currentUsage + 1}`);
      }

      const response: ApiResponse<any> = {
        success: true,
        data: {
          analysis,
          optimized: analysis,
          scrapedData: {
            title: scrapedData.title,
            description: scrapedData.description,
            url
          }
        }
      };

      return NextResponse.json(response);

    } catch (aiError: any) {
      console.error('[API] AI optimization failed:', aiError.message);
      
      // Fallback to basic analysis if AI fails
      let analysis: any = {
        title: scrapedData.title || 'Product Title',
        description: scrapedData.description || 'Product description',
        bullets: scrapedData.bullets || [],
        tags: [],
        seoScore: 0,
        improvements: ['AI optimization temporarily unavailable'],
        platform: platform as Platform,
        analysisType,
        purpose,
        images: scrapedData.images || []
      };

      // Extract basic tags
      const words = `${analysis.title} ${analysis.description}`.toLowerCase().split(/\s+/);
      const keywords = words.filter((w: string) => w.length > 4 && !['about', 'their', 'which', 'where', 'these', 'those'].includes(w));
      analysis.tags = [...new Set(keywords)].slice(0, 10);

      if (!analysis.tags || analysis.tags.length === 0) {
        analysis.tags = ['product', 'quality', 'premium'];
      }

      const seoScore = calculateSEOScore(analysis as OptimizedContent, platform);
      analysis.seoScore = seoScore;

      const response: ApiResponse<any> = {
        success: true,
        data: {
          analysis,
          optimized: analysis,
          scrapedData: {
            title: analysis.title,
            description: analysis.description,
            url
          }
        }
      };

      return NextResponse.json(response);
    }

  } catch (error: any) {
    console.error('URL analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze URL'
      },
      { status: 500 }
    );
  }
}
