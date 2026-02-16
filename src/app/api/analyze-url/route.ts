import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { ApiResponse, Platform } from '@/types';

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
    const body = await request.json();
    const { url, platform } = body;

    // Validate required fields
    if (!url || !platform) {
      return NextResponse.json(
        { success: false, error: 'URL and platform are required' },
        { status: 400 }
      );
    }

    // Return mock analysis (AI integration removed)
    const analysis = {
      title: 'Analyzed Product Title',
      description: 'Analyzed product description from URL.',
      tags: ['analyzed', 'product', 'seo'],
      seoScore: 75,
      improvements: [
        'URL content analyzed',
        'SEO recommendations generated',
        'Keywords extracted'
      ],
      platform: platform as Platform
    };

    // Calculate SEO score
    const seoScore = calculateSEOScore(
      analysis.title,
      analysis.description,
      analysis.tags
    );

    analysis.seoScore = seoScore;

    // Save to Firestore
    const analysisRef = adminDb.collection('urlAnalyses').doc();
    await analysisRef.set({
      userId,
      url,
      platform,
      analysis,
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    const response: ApiResponse<typeof analysis> = {
      success: true,
      data: analysis
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
