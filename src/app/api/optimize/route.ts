import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateOptimizedContent } from '@/lib/gemini/client';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { OptimizationInput, ApiResponse, OptimizedContent } from '@/types';

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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Try to get user data from Firestore
    let userData: any = null;
    let usageCount = 0;
    let usageLimit = 3;

    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
        usageCount = userData.usageCount || 0;
        usageLimit = userData.usageLimit || 3;
      } else {
        // User document doesn't exist yet, use defaults
        console.log('User document not found, using defaults');
        usageCount = 0;
        usageLimit = 3;
      }
    } catch (firestoreError: any) {
      // Firestore not available, use defaults
      console.warn('Firestore not available:', firestoreError.message);
      usageCount = 0;
      usageLimit = 3;
    }

    // Check usage quota
    if (usageCount >= usageLimit) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Usage limit exceeded. Please upgrade your plan.',
        code: 'QUOTA_EXCEEDED',
      }, { status: 403 });
    }

    // Parse request body
    const body: OptimizationInput = await request.json();
    const { title, description, platform, keywords } = body;

    // Validate input
    if (!title || !description || !platform) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Missing required fields',
        code: 'INVALID_INPUT',
      }, { status: 400 });
    }

    // Generate optimized content using Gemini
    let aiResponse;
    try {
      aiResponse = await generateOptimizedContent(title, description, platform, keywords);
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Provide specific error messages
      let errorMessage = 'AI optimization failed. ';
      
      if (error.message?.includes('API key')) {
        errorMessage += 'Invalid API key configuration.';
      } else if (error.message?.includes('quota')) {
        errorMessage += 'API quota exceeded. Please try again later.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Network error. Please check your connection.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: errorMessage,
        code: 'AI_ERROR',
      }, { status: 500 });
    }

    // Calculate SEO score
    const optimized: OptimizedContent = {
      title: aiResponse.title,
      description: aiResponse.description,
      tags: aiResponse.tags || [],
      seoScore: 0,
      improvements: aiResponse.improvements || [],
    };
    
    optimized.seoScore = calculateSEOScore(optimized, platform);

    // Try to save optimization to Firestore (optional)
    try {
      await adminDb.collection('optimizations').add({
        userId,
        platform,
        original: { title, description, keywords },
        optimized,
        createdAt: new Date(),
      });

      // Try to increment usage count
      if (userData) {
        await adminDb.collection('users').doc(userId).update({
          usageCount: usageCount + 1,
          updatedAt: new Date(),
        });
      }
    } catch (firestoreError: any) {
      // Firestore save failed, but optimization succeeded
      console.warn('Failed to save to Firestore:', firestoreError.message);
      // Continue anyway - the optimization result is still valid
    }

    return NextResponse.json<ApiResponse<{ optimized: OptimizedContent; usageRemaining: number }>>({
      success: true,
      data: {
        optimized,
        usageRemaining: usageLimit - usageCount - 1,
      },
    });
  } catch (error: any) {
    console.error('Optimization error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    }, { status: 500 });
  }
}
