import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateOptimizedContent } from '@/lib/gemini/client';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { ApiResponse, Platform } from '@/types';

// Helper function to detect platform from URL
function detectPlatform(url: string): Platform {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('amazon.')) return 'amazon';
  if (urlLower.includes('shopify.') || urlLower.includes('.myshopify.')) return 'shopify';
  if (urlLower.includes('ebay.')) return 'ebay';
  if (urlLower.includes('etsy.')) return 'etsy';
  if (urlLower.includes('walmart.')) return 'walmart';
  return 'amazon'; // default
}

// Helper function to scrape product data
async function scrapeProductData(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product page');
  }

  const html = await response.text();
  
  let title = '';
  let description = '';
  let price = '';
  let images: string[] = [];

  // Extract title
  const titlePatterns = [
    /<title[^>]*>([^<]+)<\/title>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="title"[^>]*content="([^"]+)"/i,
    /<h1[^>]*id="title"[^>]*>([^<]+)<\/h1>/i,
    /<h1[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h1>/i,
    /<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i,
  ];

  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }

  // Extract description
  const descriptionPatterns = [
    /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    /<div[^>]*id="productDescription"[^>]*>([^<]+)<\/div>/i,
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i,
    /<div[^>]*id="feature-bullets"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      // Remove HTML tags
      description = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (description.length > 100) break; // Found a good description
    }
  }

  // Extract price
  const pricePatterns = [
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/i,
    /<meta[^>]*property="og:price:amount"[^>]*content="([^"]+)"/i,
    /\$\s*(\d+\.?\d*)/,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      price = match[1].trim();
      break;
    }
  }

  // Extract main image
  const imagePatterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
    /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i,
    /<img[^>]*class="[^"]*product[^"]*"[^>]*src="([^"]+)"/i,
  ];

  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      images.push(match[1]);
      break;
    }
  }

  // Clean up HTML entities
  title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&ndash;/g, '-').replace(/&mdash;/g, '-');
  description = description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  return {
    title,
    description: description || 'No description found',
    price,
    images,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Firebase Admin is not configured. Please set up Firebase credentials.',
        code: 'CONFIG_ERROR',
      }, { status: 500 });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user data and check quota
    let usageCount = 0;
    let usageLimit = 5;

    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          usageCount = userData?.usageCount || 0;
          usageLimit = userData?.usageLimit || 5;
        }
      } catch (error) {
        console.warn('Firestore not available, using defaults');
      }
    }

    // Check usage quota
    if (usageCount >= usageLimit) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Usage limit exceeded. Please upgrade your plan.',
        code: 'QUOTA_EXCEEDED',
      }, { status: 403 });
    }

    const body = await request.json();
    const { url, analysisType, purpose, productDifferences, yourPricePoint, yourBrandName, additionalFeatures } = body;

    if (!url) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'URL is required',
        code: 'INVALID_INPUT',
      }, { status: 400 });
    }

    // Detect platform
    const platform = detectPlatform(url);
    console.log(`🔍 Analyzing ${platform} URL: ${url}`);

    // Scrape product data
    const scrapedData = await scrapeProductData(url);

    if (!scrapedData.title) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Could not extract product title from URL. Please try manual input.',
        code: 'AI_ERROR',
      }, { status: 400 });
    }

    // Calculate SEO score for scraped data
    const originalSEOScore = calculateSEOScore({
      title: scrapedData.title,
      description: scrapedData.description,
      tags: [],
      keywords: [],
      category: '',
      specifications: []
    } as any, platform);

    // Generate optimized version based on analysis type
    let optimized: any = null;
    
    if (analysisType === 'create-similar' || analysisType === 'full') {
      // Generate improved version
      let enhancedDescription = scrapedData.description;
      
      if (analysisType === 'create-similar' && productDifferences) {
        enhancedDescription += `\n\nProduct Differences: ${productDifferences}`;
        if (additionalFeatures) {
          enhancedDescription += `\nAdditional Features: ${additionalFeatures}`;
        }
      }
      
      const aiResponse = await generateOptimizedContent(
        scrapedData.title,
        enhancedDescription,
        platform,
        undefined
      );
      
      optimized = {
        title: aiResponse.title,
        description: aiResponse.description,
        tags: aiResponse.tags || [],
        seoScore: aiResponse.seo_score_new || 90,
        improvements: aiResponse.improvements || [],
      };
    }

    // Prepare analysis result
    const analysisResult = {
      scrapedData: {
        title: scrapedData.title,
        description: scrapedData.description,
        price: scrapedData.price,
        images: scrapedData.images,
        platform,
        url,
      },
      analysis: {
        originalSEOScore,
        analysisType,
        purpose,
      },
      optimized,
    };

    // Save to Firestore and increment usage
    if (adminDb) {
      try {
        await adminDb.collection('optimizations').add({
          userId,
          platform,
          mode: 'analyze-url',
          analysisType,
          url,
          scrapedData,
          optimized,
          createdAt: new Date(),
        });

        await adminDb.collection('users').doc(userId).update({
          usageCount: usageCount + 1,
          updatedAt: new Date(),
        });
        
        console.log(`User ${userId} usage count incremented to ${usageCount + 1}`);
      } catch (error) {
        console.warn('Failed to save to Firestore:', error);
      }
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: analysisResult,
    });
  } catch (error: any) {
    console.error('URL analysis error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Failed to analyze URL. Please check the URL and try again.',
      code: 'SERVER_ERROR',
    }, { status: 500 });
  }
}
