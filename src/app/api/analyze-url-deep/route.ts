/**
 * Deep URL Analysis API Endpoint
 * POST /api/analyze-url-deep
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UrlAnalyzerService } from '@/lib/services/UrlAnalyzerService';
import { ImageAnalysisService } from '@/lib/services/ImageAnalysisService';
import { AIService } from '@/lib/ai/aiService';
import { AIGenerationRequest } from '@/lib/ai/types';
import { Platform } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

const VALID_PLATFORMS = ['amazon', 'ebay', 'etsy', 'shopify', 'walmart', 'woocommerce'];

function extractKeywordsFromData(urlData: any): string[] {
  const keywords: Set<string> = new Set();
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been',
    'your', 'their', 'what', 'which', 'when', 'where', 'who', 'how', 'will',
    'about', 'into', 'than', 'them', 'these', 'those', 'such', 'only', 'also'
  ]);

  if (urlData.title) {
    urlData.title.toLowerCase().split(/\s+/)
      .filter((w: string) => w.length > 3 && !stopWords.has(w))
      .forEach((w: string) => keywords.add(w));
  }

  if (urlData.bullets) {
    urlData.bullets.forEach((bullet: string) => {
      bullet.toLowerCase().split(/\s+/)
        .filter((w: string) => w.length > 4 && !stopWords.has(w))
        .slice(0, 2)
        .forEach((w: string) => keywords.add(w));
    });
  }

  if (urlData.brand) keywords.add(urlData.brand.toLowerCase());

  return Array.from(keywords).slice(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminAuth) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Credit check
    if (adminDb) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const userData = userDoc.data();
      if (userData && userData.usageCount >= userData.usageLimit) {
        return NextResponse.json(
          { success: false, error: 'Usage limit exceeded. Please upgrade your plan.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    if (!body.url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // Determine platform — targetPlatform overrides auto-detection
    let platform: Platform;
    if (body.targetPlatform && VALID_PLATFORMS.includes(body.targetPlatform)) {
      platform = body.targetPlatform as Platform;
    } else {
      const urlLower = (body.url as string).toLowerCase();
      if (urlLower.includes('amazon')) platform = 'amazon';
      else if (urlLower.includes('ebay')) platform = 'ebay';
      else if (urlLower.includes('etsy')) platform = 'etsy';
      else if (urlLower.includes('walmart')) platform = 'walmart';
      else if (urlLower.includes('shopify') || urlLower.includes('.store') || urlLower.includes('.shop')) platform = 'shopify';
      else if (urlLower.includes('/product/') || urlLower.includes('woocommerce')) platform = 'woocommerce';
      else platform = 'shopify'; // safe default for custom domains
    }

    console.log('[API] analyze-url-deep — URL:', body.url, '| Platform:', platform);

    // Step 1: Scrape URL
    let urlData;
    try {
      urlData = await UrlAnalyzerService.analyzeUrl(body.url);
      console.log('[API] Scraped title:', urlData.title);
    } catch (error: any) {
      console.error('[API] URL scrape failed:', error.message);
      return NextResponse.json(
        { success: false, error: `Failed to analyze URL: ${error.message}` },
        { status: 422 }
      );
    }

    // Step 2: Image analysis (optional)
    let imageAnalysis;
    if (body.analyzeImages !== false && urlData.images && urlData.images.length > 0) {
      try {
        imageAnalysis = await ImageAnalysisService.analyzeMultipleImages(urlData.images);
        console.log('[API] Image analysis complete');
      } catch (err: any) {
        console.warn('[API] Image analysis failed (continuing):', err.message);
      }
    }

    // Step 3: AI generation with retry loop
    const aiRequest: AIGenerationRequest = {
      platform,
      productData: {
        title: urlData.title,
        description: urlData.description,
        price: urlData.price,
        specifications: urlData.specifications,
        keywords: extractKeywordsFromData(urlData),
        category: urlData.category
      },
      imageAnalysis: imageAnalysis ? {
        mainFeatures: imageAnalysis.mainFeatures,
        colors: imageAnalysis.colors,
        style: imageAnalysis.style,
        quality: imageAnalysis.quality
      } : undefined,
      mode: 'analyze'
    };

    let optimizedListing: Awaited<ReturnType<typeof AIService.generateListing>> | undefined;
    let attempts = 0;

    while (attempts < 3) {
      attempts++;
      optimizedListing = await AIService.generateListing(aiRequest, {
        maxRetries: 1,
        validateResponse: true,
        sanitizeInput: true
      });

      const score = optimizedListing.qualityScore?.percentage || 0;
      console.log(`[API] Attempt ${attempts} — SEO score: ${score}%`);
      if (score >= 80) break;
    }

    // Step 4: Save usage
    if (adminDb) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const currentUsage = userDoc.data()?.usageCount || 0;
      await adminDb.collection('users').doc(userId).update({
        usageCount: currentUsage + 1,
        lastUsed: new Date().toISOString()
      });

      await adminDb.collection('urlAnalyses').add({
        userId,
        url: body.url,
        platform,
        analysisType: 'deep',
        createdAt: new Date().toISOString(),
        seoScore: optimizedListing!.qualityScore?.percentage || 0
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        original: {
          title: urlData.title,
          description: urlData.description,
          price: urlData.price,
          bullets: urlData.bullets,
          specifications: urlData.specifications,
          brand: urlData.brand,
          rating: urlData.rating,
          reviewCount: urlData.reviewCount,
          images: urlData.images
        },
        imageAnalysis: imageAnalysis || null,
        optimized: optimizedListing,
        metadata: {
          analyzedAt: new Date().toISOString(),
          sourceUrl: body.url,
          targetPlatform: platform,
          imagesAnalyzed: urlData.images?.length || 0
        }
      }
    });

  } catch (error: any) {
    console.error('[API] analyze-url-deep error:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json({ success: false, error: 'AI service authentication failed' }, { status: 500 });
    }
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again.' }, { status: 429 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to analyze URL', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
