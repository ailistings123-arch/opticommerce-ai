/**
 * AI Health Check Endpoint
 * GET /api/ai-health
 * 
 * Tests connection to AI service
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/aiService';

export async function GET(request: NextRequest) {
  try {
    console.log('[AI Health] Testing AI service connection...');

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'GEMINI_API_KEY environment variable not configured',
        provider: 'Gemini',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test connection
    const result = await AIService.testConnection();

    if (result.success) {
      return NextResponse.json({
        status: 'healthy',
        message: result.message,
        provider: result.provider,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        message: result.message,
        provider: result.provider,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('[AI Health] Health check failed:', error);

    return NextResponse.json({
      status: 'error',
      message: error.message,
      provider: 'Gemini',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
