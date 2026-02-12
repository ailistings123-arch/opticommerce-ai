import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
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
    await adminAuth.verifyIdToken(token);

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'URL is required',
        code: 'INVALID_INPUT',
      }, { status: 400 });
    }

    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product page');
    }

    const html = await response.text();

    // Extract title and description using regex patterns
    let title = '';
    let description = '';

    // Try to extract title from various meta tags and HTML elements
    const titlePatterns = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="title"[^>]*content="([^"]+)"/i,
      /<h1[^>]*id="title"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h1>/i,
    ];

    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // Try to extract description
    const descriptionPatterns = [
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<div[^>]*id="productDescription"[^>]*>([^<]+)<\/div>/i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i,
    ];

    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }

    // Clean up HTML entities
    title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    description = description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    if (!title) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Could not extract product title from URL. Please try manual input.',
        code: 'AI_ERROR',
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<{ title: string; description: string }>>({
      success: true,
      data: {
        title,
        description: description || 'No description found',
      },
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
