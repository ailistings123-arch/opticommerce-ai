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

// Helper function to extract Etsy listing ID from URL
function extractEtsyListingId(url: string): string | null {
  const match = url.match(/\/listing\/(\d+)/);
  return match ? match[1] : null;
}

// Helper function to scrape Etsy with fallback approach
async function scrapeEtsyWithFallback(url: string) {
  console.log('🎨 Using Etsy-specific scraping approach...');
  
  const listingId = extractEtsyListingId(url);
  console.log('📋 Etsy Listing ID:', listingId);
  
  // Try direct fetch with multiple strategies
  const strategies: Array<{ name: string; headers: Record<string, string> }> = [
    {
      name: 'Standard Headers',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.etsy.com/',
        'Cache-Control': 'no-cache',
      }
    },
    {
      name: 'Mobile User-Agent',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    },
    {
      name: 'Simple Fetch',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ListingOptimizer/1.0)',
      }
    }
  ];
  
  for (const strategy of strategies) {
    try {
      console.log(`🔄 Trying ${strategy.name}...`);
      const response = await fetch(url, { headers: strategy.headers });
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Successfully fetched Etsy page with ${strategy.name}`);
        const data = await scrapeEtsyData(url, html);
        
        // Validate we got meaningful data
        if (data.title && data.title.length > 5) {
          return data;
        }
      } else {
        console.log(`❌ ${strategy.name} failed with status: ${response.status}`);
      }
    } catch (err: any) {
      console.log(`❌ ${strategy.name} error:`, err.message);
    }
  }
  
  // All strategies failed - provide helpful error message
  console.log('⚠️ All Etsy scraping strategies failed');
  
  throw new Error(
    `Unable to automatically extract data from Etsy due to anti-bot protection. 

ALTERNATIVE OPTIONS:
1. Use "Create New Product" mode and manually copy/paste your product details
2. Try the "Optimize Existing" mode with your current listing text
3. Copy the title and description from Etsy and paste them directly

Etsy actively blocks automated scraping to protect their sellers. We recommend using manual input for the best results.`
  );
}

// Helper function to scrape Etsy product data
async function scrapeEtsyData(url: string, html: string) {
  let title = '';
  let description = '';
  let price = '';
  let images: string[] = [];
  let tags: string[] = [];

  console.log('🔍 Starting Etsy scraping...');

  // Try to extract JSON-LD structured data first (most reliable for Etsy)
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      
      // Handle array of JSON-LD objects
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      for (const data of dataArray) {
        if (data['@type'] === 'Product' || data['@type'] === 'ItemPage') {
          if (data.name && !title) {
            title = data.name;
            console.log('✅ Found title from JSON-LD:', title.substring(0, 50));
          }
          if (data.description && !description) {
            description = data.description;
            console.log('✅ Found description from JSON-LD');
          }
          if (data.offers && data.offers.price && !price) {
            price = data.offers.price.toString();
            console.log('✅ Found price from JSON-LD:', price);
          }
          if (data.image) {
            const imageUrls = Array.isArray(data.image) ? data.image : [data.image];
            imageUrls.forEach((img: any) => {
              const imgUrl = typeof img === 'string' ? img : img.url;
              if (imgUrl && !images.includes(imgUrl)) {
                images.push(imgUrl);
              }
            });
            console.log(`✅ Found ${images.length} images from JSON-LD`);
          }
        }
      }
    } catch (e) {
      // Invalid JSON, continue to next match
      continue;
    }
  }

  // Etsy-specific title extraction with more patterns
  if (!title) {
    const etsyTitlePatterns = [
      /<h1[^>]*class="[^"]*wt-text-body-01[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*data-buy-box-listing-title[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*class="[^"]*wt-text-heading-01[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i,
      /<title>([^|<]+)/i,
    ];

    for (const pattern of etsyTitlePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        // Remove " - Etsy" or similar suffixes
        title = title.replace(/\s*[-–|]\s*Etsy.*$/i, '').trim();
        title = title.replace(/\s*\|\s*Etsy.*$/i, '').trim();
        if (title.length > 10) {
          console.log('✅ Found title from HTML:', title.substring(0, 50));
          break;
        }
      }
    }
  }

  // Etsy-specific description extraction with more patterns
  if (!description) {
    const etsyDescPatterns = [
      /<div[^>]*class="[^"]*wt-text-body-01[^"]*"[^>]*data-product-details-description[^>]*>([\s\S]{50,2000}?)<\/div>/i,
      /<div[^>]*id="wt-content-toggle-product-details-read-more"[^>]*>([\s\S]{50,2000}?)<\/div>/i,
      /<p[^>]*class="[^"]*wt-text-body-01[^"]*wt-break-word[^"]*"[^>]*>([\s\S]{50,2000}?)<\/p>/i,
      /<meta[^>]*property="og:description"[^>]*content="([^"]{50,}?)"/i,
      /<meta[^>]*name="description"[^>]*content="([^"]{50,}?)"/i,
    ];

    for (const pattern of etsyDescPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        description = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        // Clean up HTML entities
        description = description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        description = description.replace(/&nbsp;/g, ' ').replace(/&ndash;/g, '-').replace(/&mdash;/g, '-');
        if (description.length > 50) {
          console.log('✅ Found description from HTML:', description.substring(0, 100));
          break;
        }
      }
    }
  }

  // Etsy price extraction with more patterns
  if (!price) {
    const etsyPricePatterns = [
      /<p[^>]*class="[^"]*wt-text-title-03[^"]*"[^>]*>\s*<span[^>]*class="[^"]*currency-value[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<span[^>]*class="[^"]*currency-value[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<meta[^>]*property="og:price:amount"[^>]*content="([^"]+)"/i,
      /<meta[^>]*property="product:price:amount"[^>]*content="([^"]+)"/i,
      /data-buy-box-region-price[^>]*>([^<]+)</i,
      /"price":\s*"([^"]+)"/i,
      /"amount":\s*"?(\d+\.?\d*)"?/i,
    ];

    for (const pattern of etsyPricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = match[1].trim();
        console.log('✅ Found price from HTML:', price);
        break;
      }
    }
  }

  // Etsy image extraction with more patterns
  if (images.length === 0) {
    const etsyImagePatterns = [
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/gi,
      /<img[^>]*data-listing-card-listing-image[^>]*src="([^"]+)"/gi,
      /<img[^>]*class="[^"]*wt-max-width-full[^"]*"[^>]*src="([^"]+)"/gi,
      /<img[^>]*data-src="([^"]+)"/gi,
      /"url_fullxfull":"([^"]+)"/gi,
      /"url_570xN":"([^"]+)"/gi,
    ];

    for (const pattern of etsyImagePatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(html)) !== null) {
        if (match[1] && !match[1].includes('placeholder') && !match[1].includes('avatar')) {
          const imageUrl = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
            if (images.length >= 5) break;
          }
        }
      }
      if (images.length > 0) break;
    }
    console.log(`✅ Found ${images.length} images from HTML`);
  }

  // Extract tags from Etsy with multiple methods
  const tagPatterns = [
    /<a[^>]*href="\/search\?q=([^"&]+)"[^>]*>/gi,
    /<a[^>]*href="\/c\/([^"?]+)"[^>]*>/gi,
    /"tags":\s*\[([^\]]+)\]/i,
  ];

  for (const pattern of tagPatterns) {
    let tagMatch;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((tagMatch = regex.exec(html)) !== null && tags.length < 13) {
      let tag = tagMatch[1];
      if (tag) {
        // Handle JSON array format
        if (tag.includes('"')) {
          const jsonTags = tag.match(/"([^"]+)"/g);
          if (jsonTags) {
            jsonTags.forEach(t => {
              const cleanTag = t.replace(/"/g, '');
              if (cleanTag && !tags.includes(cleanTag) && tags.length < 13) {
                tags.push(cleanTag);
              }
            });
          }
        } else {
          // Handle URL encoded format
          tag = decodeURIComponent(tag).replace(/\+/g, ' ').replace(/-/g, ' ');
          if (tag && !tags.includes(tag) && tag.length > 2 && tag.length < 30) {
            tags.push(tag);
          }
        }
      }
    }
    if (tags.length >= 5) break;
  }
  console.log(`✅ Found ${tags.length} tags:`, tags.slice(0, 5));

  // Fallback: If no description found, use title as base
  if (!description && title) {
    description = `${title}. High-quality product available on Etsy.`;
    console.log('⚠️ Using fallback description');
  }

  return { title, description, price, images, tags };
}

// Helper function to scrape product data
async function scrapeProductData(url: string) {
  console.log('🌐 Fetching URL:', url);
  
  const platform = detectPlatform(url);
  console.log('🏪 Detected platform:', platform);
  
  // For Etsy, use a different approach due to anti-bot protection
  if (platform === 'etsy') {
    return await scrapeEtsyWithFallback(url);
  }
  
  // Try multiple user agents for other platforms
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ];
  
  let response;
  let lastError;
  
  for (const userAgent of userAgents) {
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
        },
      });
      
      if (response.ok) {
        console.log('✅ Successfully fetched with User-Agent:', userAgent.substring(0, 50));
        break;
      }
    } catch (err) {
      lastError = err;
      console.log('⚠️ Failed with User-Agent, trying next...');
      continue;
    }
  }

  if (!response || !response.ok) {
    const status = response?.status || 'unknown';
    const statusText = response?.statusText || 'Network error';
    console.error('❌ All fetch attempts failed. Last status:', status, statusText);
    throw new Error(`Failed to fetch product page: ${status} ${statusText}. The website might be blocking automated requests.`);
  }

  const html = await response.text();
  console.log('📄 HTML length:', html.length);
  
  let title = '';
  let description = '';
  let price = '';
  let images: string[] = [];
  let tags: string[] = [];

  // Generic scraping for other platforms (Etsy is handled separately above)
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
        description = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (description.length > 100) break;
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
    ]

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
    tags,
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
    let scrapedData;
    try {
      scrapedData = await scrapeProductData(url);
    } catch (scrapeError: any) {
      console.error('Scraping error:', scrapeError);
      
      // Check if it's an Etsy-specific error
      const detectedPlatform = detectPlatform(url);
      if (detectedPlatform === 'etsy' && scrapeError.message.includes('anti-bot')) {
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: scrapeError.message,
          code: 'INVALID_INPUT',
        }, { status: 400 });
      }
      
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: `Failed to scrape product data: ${scrapeError.message}`,
        code: 'SERVER_ERROR',
      }, { status: 400 });
    }

    if (!scrapedData.title || scrapedData.title.length < 5) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Could not extract product title from URL. The page structure might not be supported. Please try manual input or a different URL.',
        code: 'INVALID_INPUT',
      }, { status: 400 });
    }

    console.log('✅ Successfully scraped:', {
      title: scrapedData.title.substring(0, 50),
      descLength: scrapedData.description.length,
      price: scrapedData.price,
      imageCount: scrapedData.images.length,
      tagCount: scrapedData.tags.length,
    });

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
