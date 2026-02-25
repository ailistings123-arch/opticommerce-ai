import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { ApiResponse, Platform, OptimizedContent } from '@/types';
import { UrlAnalyzerService } from '@/lib/services/UrlAnalyzerService';

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

    // Extract platform from URL
    let platform: Platform = 'amazon';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon')) platform = 'amazon';
    else if (urlLower.includes('ebay')) platform = 'ebay';
    else if (urlLower.includes('etsy')) platform = 'etsy';
    else if (urlLower.includes('shopify') || urlLower.includes('.store') || urlLower.includes('.shop')) platform = 'shopify';
    else if (urlLower.includes('walmart')) platform = 'walmart';

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

    // Build analysis from scraped data - filter out undefined values
    let analysis: any = {
      title: scrapedData.title || 'Product Title',
      description: scrapedData.description || 'Product description',
      bullets: scrapedData.bullets || [],
      tags: [],
      seoScore: 0,
      improvements: [],
      platform: platform as Platform,
      analysisType,
      purpose,
      images: scrapedData.images || []
    };

    // Only add optional fields if they have values
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

    // Add specific data for create-similar mode
    if (analysisType === 'create-similar') {
      analysis.customization = {};
      if (productDifferences) analysis.customization.differences = productDifferences;
      if (yourPricePoint !== undefined && yourPricePoint !== null) analysis.customization.pricePoint = yourPricePoint;
      if (yourBrandName) analysis.customization.brandName = yourBrandName;
      if (additionalFeatures) analysis.customization.additionalFeatures = additionalFeatures;
    }

    // Generate improvements based on analysis type
    if (analysisType === 'full' || analysisType === 'seo-audit') {
      analysis.improvements = [
        'Title could be optimized with more keywords',
        'Description could be more detailed',
        'Add more bullet points highlighting key features',
        'Include relevant search terms naturally'
      ];
    } else if (analysisType === 'competitive') {
      analysis.improvements = [
        'Competitor uses strong emotional triggers',
        'Keywords are well-optimized for search',
        'Product positioning is clear',
        'Consider similar pricing strategy'
      ];
    } else if (analysisType === 'create-similar') {
      analysis.improvements = [
        'Leverage similar keyword strategy',
        'Highlight your unique differentiators',
        'Match or improve on description quality',
        'Use similar structure but with your brand voice'
      ];
    }

    // Extract tags/keywords from title and description
    const words = `${analysis.title} ${analysis.description}`.toLowerCase().split(/\s+/);
    const keywords = words.filter((w: string) => w.length > 4 && !['about', 'their', 'which', 'where', 'these', 'those'].includes(w));
    analysis.tags = [...new Set(keywords)].slice(0, 10);

    // Ensure tags array is not empty
    if (!analysis.tags || analysis.tags.length === 0) {
      analysis.tags = ['product', 'quality', 'premium'];
    }

    // Ensure improvements array exists
    if (!analysis.improvements || analysis.improvements.length === 0) {
      analysis.improvements = [
        'Product data extracted successfully',
        'SEO analysis completed',
        'Keywords identified'
      ];
    }

    // Calculate SEO score - cast to OptimizedContent type
    const seoScore = calculateSEOScore(analysis as OptimizedContent, platform);

    analysis.seoScore = seoScore;

    // Save to Firestore - remove undefined values
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
    }

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
