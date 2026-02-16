import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { OptimizationInput, ApiResponse, OptimizedContent, Platform } from '@/types';

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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body: OptimizationInput = await request.json();
    const { title, description, platform, mode, keywords, productData } = body;

    // Validate required fields
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform is required' },
        { status: 400 }
      );
    }

    // Return mock optimized content (AI integration removed)
    const optimizedContent: OptimizedContent = {
      title: title || 'Optimized Product Title',
      description: description || 'Optimized product description with enhanced SEO.',
      tags: keywords ? keywords.split(',').map(k => k.trim()) : ['product', 'quality', 'best'],
      seoScore: 85,
      improvements: [
        'Title optimized for search engines',
        'Description enhanced with keywords',
        'Tags added for better discoverability'
      ],
      platform: platform
    };

    // Calculate SEO score
    const seoScore = calculateSEOScore(
      optimizedContent.title,
      optimizedContent.description,
      optimizedContent.tags
    );

    optimizedContent.seoScore = seoScore;

    // Save to Firestore
    const optimizationRef = adminDb.collection('optimizations').doc();
    await optimizationRef.set({
      userId,
      platform,
      mode: mode || 'optimize-existing',
      originalTitle: title,
      originalDescription: description,
      optimizedTitle: optimizedContent.title,
      optimizedDescription: optimizedContent.description,
      optimizedTags: optimizedContent.tags,
      seoScore: optimizedContent.seoScore,
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    const response: ApiResponse<OptimizedContent> = {
      success: true,
      data: optimizedContent
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Optimization error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to optimize content'
      },
      { status: 500 }
    );
  }
}
