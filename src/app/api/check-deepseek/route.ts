import { NextResponse } from 'next/server';

/**
 * Check DeepSeek Availability API Route
 * 
 * Returns whether DeepSeek is configured and available for use.
 */
export async function GET() {
  try {
    // Check if DeepSeek API key is configured
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const isAvailable = !!apiKey && apiKey.length >= 10;

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable 
        ? 'DeepSeek is configured and available' 
        : 'DeepSeek API key is not configured'
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      message: 'Error checking DeepSeek availability'
    }, { status: 500 });
  }
}
