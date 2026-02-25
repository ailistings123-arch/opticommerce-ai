/**
 * Generate Listing API Endpoint
 * POST /api/generate-listing
 * 
 * Accepts product data and returns AI-optimized listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/aiService';
import { AIGenerationRequest } from '@/lib/ai/types';
import { ImageAnalysisService } from '@/lib/services/ImageAnalysisService';

// Disable body size limit for image uploads
export const runtime = 'nodejs';
export const maxDuration = 120; // 120 seconds for deep analysis

interface RequestBody {
  platform: string;
  productData: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    specifications?: Array<{ name: string; value: string; unit?: string }>;
    keywords?: string[];
  };
  imageAnalysis?: {
    mainFeatures: string[];
    colors: string[];
    style: string;
    quality: string;
  };
  images?: string[]; // URLs or base64
  mode: 'optimize' | 'create' | 'analyze';
  deepAnalysis?: boolean; // Enable deep analysis mode
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Received generate-listing request');

    // Parse request body
    const body: RequestBody = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('[API] GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    console.log('[API] Generating listing with AI...');
    console.log('[API] Platform:', body.platform);
    console.log('[API] Mode:', body.mode);
    console.log('[API] Deep Analysis:', body.deepAnalysis || false);

    // Deep analysis mode: Analyze images if provided
    let enhancedImageAnalysis = body.imageAnalysis;
    
    if (body.deepAnalysis && body.images && body.images.length > 0) {
      console.log('[API] Deep analysis enabled - analyzing images...');
      try {
        const imageResults = await ImageAnalysisService.analyzeMultipleImages(body.images);
        enhancedImageAnalysis = {
          mainFeatures: imageResults.mainFeatures,
          colors: imageResults.colors,
          style: imageResults.style,
          quality: imageResults.quality
        };
        console.log('[API] Image analysis complete:', enhancedImageAnalysis);
      } catch (error: any) {
        console.warn('[API] Image analysis failed (continuing without it):', error.message);
      }
    }

    // Build AI request with enhanced data
    const aiRequest: AIGenerationRequest = {
      platform: body.platform,
      productData: body.productData,
      imageAnalysis: enhancedImageAnalysis,
      mode: body.mode
    };

    console.log('[API] Sending request to AI service...');

    // Generate listing using AI
    const result = await AIService.generateListing(aiRequest, {
      maxRetries: 2,
      validateResponse: true,
      sanitizeInput: true
    });

    console.log('[API] Listing generated successfully');
    if (result.qualityScore) {
      console.log('[API] Quality Score:', result.qualityScore.percentage + '%', result.qualityScore.grade);
    }

    // Return response with quality metrics
    return NextResponse.json({
      success: true,
      data: {
        ...result.listing,
        qualityScore: result.qualityScore ? {
          score: result.qualityScore.percentage,
          grade: result.qualityScore.grade,
          breakdown: result.qualityScore.breakdown
        } : undefined
      },
      warnings: result.warnings
    });

  } catch (error: any) {
    console.error('[API] Error generating listing:', error);

    // Handle specific errors
    if (error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'AI service authentication failed. Please check API key configuration.' },
        { status: 500 }
      );
    }

    if (error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout. The AI service took too long to respond. Please try again.' },
        { status: 504 }
      );
    }

    if (error.message.includes('Validation failed')) {
      return NextResponse.json(
        { error: `Generated content validation failed: ${error.message}` },
        { status: 422 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Failed to generate listing. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Validate request body
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.platform) {
    return { valid: false, error: 'Platform is required' };
  }

  const validPlatforms = ['amazon', 'ebay', 'etsy', 'shopify', 'walmart'];
  if (!validPlatforms.includes(body.platform)) {
    return { valid: false, error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` };
  }

  if (!body.mode) {
    return { valid: false, error: 'Mode is required' };
  }

  const validModes = ['optimize', 'create', 'analyze'];
  if (!validModes.includes(body.mode)) {
    return { valid: false, error: `Invalid mode. Must be one of: ${validModes.join(', ')}` };
  }

  if (!body.productData) {
    return { valid: false, error: 'Product data is required' };
  }

  // At least one of title or description must be provided
  if (!body.productData.title && !body.productData.description) {
    return { valid: false, error: 'Either title or description must be provided' };
  }

  // Validate payload size
  const bodySize = JSON.stringify(body).length;
  if (bodySize > 100000) { // 100KB limit
    return { valid: false, error: 'Request payload too large (max 100KB)' };
  }

  return { valid: true };
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
