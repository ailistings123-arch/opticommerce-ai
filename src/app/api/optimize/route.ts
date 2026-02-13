import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateOptimizedContent, generateEnhancedOptimizedContent } from '@/lib/gemini/client';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { OptimizationInput, ApiResponse, OptimizedContent, Platform } from '@/types';

// Helper function to build comprehensive prompt for new product creation
function buildNewProductPrompt(productData: any): string {
  let prompt = `${productData.whatIsIt}\n\n`;
  
  if (productData.problemSolved) {
    prompt += `Problem Solved: ${productData.problemSolved}\n\n`;
  }
  
  if (productData.keyFeatures && productData.keyFeatures.length > 0) {
    prompt += `Key Features:\n${productData.keyFeatures.filter((f: string) => f).map((f: string) => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (productData.mainBenefits && productData.mainBenefits.length > 0) {
    prompt += `Main Benefits:\n${productData.mainBenefits.filter((b: string) => b).map((b: string) => `- ${b}`).join('\n')}\n\n`;
  }
  
  if (productData.primaryMaterial) {
    prompt += `Material: ${productData.primaryMaterial}\n`;
  }
  
  if (productData.idealCustomer) {
    prompt += `Target Customer: ${productData.idealCustomer}\n\n`;
  }
  
  if (productData.useCases && productData.useCases.length > 0) {
    prompt += `Use Cases:\n${productData.useCases.filter((u: string) => u).map((u: string) => `- ${u}`).join('\n')}\n\n`;
  }
  
  if (productData.uniqueAdvantage) {
    prompt += `Unique Advantage: ${productData.uniqueAdvantage}\n\n`;
  }
  
  return prompt;
}

// Helper function to enhance description with additional data
function buildEnhancedDescription(baseDescription: string, additionalData: any): string {
  let enhanced = baseDescription + '\n\n';
  
  if (additionalData.category) {
    enhanced += `Category: ${additionalData.category}\n`;
  }
  
  if (additionalData.brand) {
    enhanced += `Brand: ${additionalData.brand}\n`;
  }
  
  if (additionalData.materials && additionalData.materials.length > 0) {
    enhanced += `Materials: ${additionalData.materials.join(', ')}\n`;
  }
  
  if (additionalData.uniqueBenefits) {
    enhanced += `\nUnique Benefits: ${additionalData.uniqueBenefits}\n`;
  }
  
  if (additionalData.useCases && additionalData.useCases.length > 0) {
    enhanced += `\nUse Cases:\n${additionalData.useCases.filter((u: string) => u).map((u: string) => `- ${u}`).join('\n')}\n`;
  }
  
  return enhanced;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
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

    // Try to get user data from Firestore
    let userData: any = null;
    let usageCount = 0;
    let usageLimit = 5; // 5 credits for free users

    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
        usageCount = userData.usageCount || 0;
        usageLimit = userData.usageLimit || 5;
      } else {
        // User document doesn't exist yet, create it
        console.log('Creating new user document');
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const newUserData = {
          email: decodedToken.email || '',
          displayName: decodedToken.name || 'User',
          photoURL: decodedToken.picture || null,
          tier: 'free',
          usageCount: 0,
          usageLimit: 5,
          createdAt: now,
          updatedAt: now,
          resetDate: nextMonth,
        };
        
        await adminDb.collection('users').doc(userId).set(newUserData);
        userData = newUserData;
        usageCount = 0;
        usageLimit = 5;
      }
    } catch (firestoreError: any) {
      // Firestore not available, use defaults
      console.warn('Firestore not available:', firestoreError.message);
      usageCount = 0;
      usageLimit = 5;
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
    const body: any = await request.json();
    const { mode, title, description, platform, keywords, productData, additionalData } = body;

    // Validate based on mode
    if (mode === 'create-new') {
      // Mode 2: Create New Product
      if (!productData || !productData.platform || !productData.productName) {
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: 'Missing required fields for new product creation',
          code: 'INVALID_INPUT',
        }, { status: 400 });
      }
    } else {
      // Mode 1: Optimize Existing (default)
      if (!title || !description || !platform) {
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: 'Missing required fields',
          code: 'INVALID_INPUT',
        }, { status: 400 });
      }
    }

    // Generate optimized content based on mode
    let aiResponse;
    try {
      if (mode === 'create-new') {
        // Mode 2: Create complete new product listing
        console.log(`🎯 Creating new product listing for ${productData.platform}`);
        
        // Build comprehensive prompt for new product
        const productPrompt = buildNewProductPrompt(productData);
        aiResponse = await generateOptimizedContent(
          productData.productName,
          productPrompt,
          productData.platform,
          productData.keyFeatures?.join(', ')
        );
      } else {
        // Mode 1: Optimize existing listing (enhanced with additional data)
        console.log(`🎯 Using enhanced optimization for ${platform}`);
        
        // If we have additional data, incorporate it
        let enhancedDescription = description;
        if (additionalData) {
          enhancedDescription = buildEnhancedDescription(description, additionalData);
        }
        
        aiResponse = await generateEnhancedOptimizedContent(
          title, 
          enhancedDescription, 
          platform as Platform, 
          keywords
        );
      }
    } catch (error: any) {
      console.error('Enhanced optimization error, trying fallback:', error);
      
      // Fallback to original Gemini optimization
      try {
        const fallbackTitle = mode === 'create-new' ? productData.productName : title;
        const fallbackDesc = mode === 'create-new' ? productData.whatIsIt : description;
        const fallbackPlatform = mode === 'create-new' ? productData.platform : platform;
        const fallbackKeywords = mode === 'create-new' ? productData.keyFeatures?.join(', ') : keywords;
        
        aiResponse = await generateOptimizedContent(
          fallbackTitle, 
          fallbackDesc, 
          fallbackPlatform, 
          fallbackKeywords
        );
      } catch (fallbackError: any) {
        console.error('Gemini API error:', fallbackError);
        
        // Provide specific error messages
        let errorMessage = 'AI optimization failed. ';
        
        if (fallbackError.message?.includes('API key')) {
          errorMessage += 'Invalid API key configuration.';
        } else if (fallbackError.message?.includes('quota')) {
          errorMessage += 'API quota exceeded. Please try again later.';
        } else if (fallbackError.message?.includes('network') || fallbackError.message?.includes('fetch')) {
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
    }

    // Calculate SEO score and prepare response
    const optimized = {
      title: aiResponse.title,
      description: aiResponse.description,
      tags: aiResponse.tags || [],
      seoScore: aiResponse.seo_score_new || calculateSEOScore({
        title: aiResponse.title,
        description: aiResponse.description,
        tags: aiResponse.tags || [],
        keywords: keywords?.split(',').map(k => k.trim()) || [],
        category: '',
        specifications: []
      } as any, platform),
      improvements: aiResponse.improvements || [],
      bulletPoints: aiResponse.bulletPoints,
      backendSearchTerms: aiResponse.backendSearchTerms,
      compliance: aiResponse.compliance,
      seoMetrics: aiResponse.seoMetrics
    };

    // Try to save optimization to Firestore and increment usage count
    try {
      const optimizationData: any = {
        userId,
        platform: mode === 'create-new' ? productData.platform : platform,
        mode: mode || 'optimize-existing',
        createdAt: new Date(),
      };
      
      if (mode === 'create-new') {
        optimizationData.productData = {
          productName: productData.productName,
          category: productData.category,
          tone: productData.tone,
        };
        optimizationData.optimized = optimized;
      } else {
        optimizationData.original = { 
          title, 
          description, 
          keywords: keywords || null
        };
        optimizationData.optimized = optimized;
      }
      
      await adminDb.collection('optimizations').add(optimizationData);

      // Increment usage count - this is critical for credit tracking
      await adminDb.collection('users').doc(userId).update({
        usageCount: usageCount + 1,
        updatedAt: new Date(),
      });
      
      console.log(`User ${userId} usage count incremented to ${usageCount + 1}`);
    } catch (firestoreError: any) {
      // Firestore save failed, but optimization succeeded
      console.warn('Failed to save to Firestore:', firestoreError.message);
      // Continue anyway - the optimization result is still valid
    }

    return NextResponse.json<ApiResponse<{ optimized: any; usageRemaining: number }>>({
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
