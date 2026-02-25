/**
 * Deep URL Analysis API Endpoint
 * POST /api/analyze-url-deep
 * 
 * Analyzes product URL deeply and generates optimized listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { UrlAnalyzerService } from '@/lib/services/UrlAnalyzerService';
import { ImageAnalysisService } from '@/lib/services/ImageAnalysisService';
import { AIService } from '@/lib/ai/aiService';
import { AIGenerationRequest } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes for deep analysis

interface RequestBody {
  url: string;
  targetPlatform: string;
  analyzeImages?: boolean;
}

/**
 * Extract keywords from URL data
 */
function extractKeywordsFromData(urlData: any): string[] {
  const keywords: Set<string> = new Set();

  // Extract from title
  if (urlData.title) {
    const titleWords = urlData.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !isCommonWord(w));
    titleWords.forEach((w: string) => keywords.add(w));
  }

  // Extract from bullets
  if (urlData.bullets) {
    urlData.bullets.forEach((bullet: string) => {
      const words = bullet
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 4 && !isCommonWord(w));
      words.slice(0, 2).forEach((w: string) => keywords.add(w));
    });
  }

  // Extract from brand
  if (urlData.brand) {
    keywords.add(urlData.brand.toLowerCase());
  }

  return Array.from(keywords).slice(0, 10);
}

/**
 * Check if word is common/stop word
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been',
    'your', 'their', 'what', 'which', 'when', 'where', 'who', 'how', 'will',
    'about', 'into', 'than', 'them', 'these', 'those', 'such', 'only', 'also'
  ];
  return commonWords.includes(word.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Received analyze-url-deep request');

    const body: RequestBody = await request.json();

    // Validate request
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!body.targetPlatform) {
      return NextResponse.json(
        { error: 'Target platform is required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['amazon', 'ebay', 'etsy', 'shopify', 'walmart'];
    if (!validPlatforms.includes(body.targetPlatform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('[API] Step 1: Analyzing URL...');
    console.log('[API] URL:', body.url);
    console.log('[API] Target Platform:', body.targetPlatform);

    // Step 1: Analyze URL to extract product data
    let urlData;
    try {
      urlData = await UrlAnalyzerService.analyzeUrl(body.url);
      console.log('[API] URL analysis complete');
      console.log('[API] Extracted title:', urlData.title);
      console.log('[API] Extracted bullets:', urlData.bullets?.length || 0);
      console.log('[API] Extracted images:', urlData.images?.length || 0);
    } catch (error: any) {
      console.error('[API] URL analysis failed:', error.message);
      return NextResponse.json(
        { error: `Failed to analyze URL: ${error.message}` },
        { status: 422 }
      );
    }

    // Step 2: Analyze images if available and requested
    let imageAnalysis;
    if (body.analyzeImages !== false && urlData.images && urlData.images.length > 0) {
      try {
        console.log('[API] Step 2: Analyzing product images...');
        imageAnalysis = await ImageAnalysisService.analyzeMultipleImages(urlData.images);
        console.log('[API] Image analysis complete');
        console.log('[API] Detected features:', imageAnalysis.mainFeatures);
        console.log('[API] Detected colors:', imageAnalysis.colors);
        console.log('[API] Detected style:', imageAnalysis.style);
      } catch (error: any) {
        console.warn('[API] Image analysis failed (continuing without it):', error.message);
        // Continue without image analysis
      }
    }

    // Step 3: Build comprehensive AI request
    console.log('[API] Step 3: Building AI generation request...');
    
    const aiRequest: AIGenerationRequest = {
      platform: body.targetPlatform,
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

    console.log('[API] Step 4: Generating optimized listing with AI...');
    
    // Step 4: Generate optimized listing
    const optimizedListing = await AIService.generateListing(aiRequest, {
      maxRetries: 2,
      validateResponse: true,
      sanitizeInput: true
    });

    console.log('[API] Listing generated successfully');

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      data: {
        // Original data from URL
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
        // Image analysis results
        imageAnalysis: imageAnalysis || null,
        // Optimized listing
        optimized: optimizedListing,
        // Metadata
        metadata: {
          analyzedAt: new Date().toISOString(),
          sourceUrl: body.url,
          targetPlatform: body.targetPlatform,
          imagesAnalyzed: urlData.images?.length || 0
        }
      }
    });

  } catch (error: any) {
    console.error('[API] Error in deep URL analysis:', error);

    if (error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'AI service authentication failed' },
        { status: 500 }
      );
    }

    if (error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to analyze URL and generate listing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
