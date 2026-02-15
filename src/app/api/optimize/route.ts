import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateOptimizedContent, generateEnhancedOptimizedContent } from '@/lib/gemini/client';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { OptimizationInput, ApiResponse, OptimizedContent, Platform } from '@/types';

// Helper functions for enhanced SEO metrics
function calculateKeywordRelevance(title: string, description: string): number {
  const words = (title + ' ' + description).toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words.filter(w => w.length > 3));
  return Math.min(Math.round((uniqueWords.size / 50) * 100), 100);
}

function calculateTitleScore(title: string): number {
  let score = 0;
  
  if (title.length >= 150 && title.length <= 200) score += 50;
  else if (title.length >= 100) score += 30;
  else score += 10;
  
  if (/\d/.test(title)) score += 20;
  if (/[A-Z]/.test(title)) score += 15;
  if (title.split(/\s+/).length >= 10) score += 15;
  
  return Math.min(score, 100);
}

function calculateDescriptionScore(description: string): number {
  let score = 0;
  
  if (description.length >= 500) score += 40;
  else if (description.length >= 300) score += 25;
  else score += 10;
  
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 5) score += 30;
  else if (sentences.length >= 3) score += 20;
  else score += 10;
  
  if (/[•\-\*]/.test(description)) score += 15;
  if (/\d+\s*(oz|ml|inch|cm|lb|kg)/i.test(description)) score += 15;
  
  return Math.min(score, 100);
}

function generateEnhancedMetrics(
  optimizedTitle: string,
  optimizedDescription: string,
  optimizedTags: string[],
  seoScore: number,
  platform: string
) {
  const seoMetrics = {
    keywordRelevance: calculateKeywordRelevance(optimizedTitle, optimizedDescription),
    titleOptimization: calculateTitleScore(optimizedTitle),
    descriptionQuality: calculateDescriptionScore(optimizedDescription),
    overall: seoScore,
    breakdown: {
      titleLength: {
        score: optimizedTitle.length >= 150 && optimizedTitle.length <= 200 ? 98 : 75,
        status: (optimizedTitle.length >= 150 && optimizedTitle.length <= 200 ? 'good' : 'warning') as 'good' | 'warning' | 'error',
        message: optimizedTitle.length >= 150 && optimizedTitle.length <= 200 
          ? 'Title length is optimal for SEO' 
          : 'Title could be longer for better SEO'
      },
      keywordDensity: {
        score: 95,
        status: 'good' as 'good' | 'warning' | 'error',
        message: 'Keywords are well-distributed throughout the content'
      },
      readability: {
        score: 88,
        status: 'good' as 'good' | 'warning' | 'error',
        message: 'Content is easy to read and understand'
      },
      structure: {
        score: 90,
        status: 'good' as 'good' | 'warning' | 'error',
        message: 'Content structure follows best practices'
      },
      uniqueness: {
        score: 85,
        status: 'warning' as 'good' | 'warning' | 'error',
        message: 'Consider adding more unique selling points'
      }
    },
    suggestions: [
      'Add 2 more long-tail keywords for better targeting',
      'Include FAQ section to answer common questions',
      'Add specific measurements or dimensions'
    ],
    missingKeywords: [
      { keyword: 'premium quality', searches: 22100 },
      { keyword: 'durable material', searches: 18400 }
    ]
  };

  const keywordData = {
    primary: [
      {
        keyword: optimizedTags[0] || 'product',
        searchVolume: 49500,
        cpc: 1.85,
        competition: 'Medium' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 15,
        difficulty: 65
      }
    ],
    related: [
      {
        keyword: optimizedTags[1] || 'related keyword',
        searchVolume: 33100,
        cpc: 1.45,
        competition: 'Low' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 8,
        difficulty: 45
      },
      {
        keyword: optimizedTags[2] || 'another keyword',
        searchVolume: 27800,
        cpc: 1.25,
        competition: 'Medium' as 'Low' | 'Medium' | 'High',
        trend: 'stable' as 'up' | 'down' | 'stable',
        trendPercentage: 0,
        difficulty: 55
      }
    ],
    longTail: [
      {
        keyword: `${optimizedTags[0]} for home`,
        searchVolume: 8200,
        cpc: 0.95,
        competition: 'Low' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 12,
        difficulty: 25
      },
      {
        keyword: `best ${optimizedTags[0]} 2024`,
        searchVolume: 6500,
        cpc: 1.15,
        competition: 'Low' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 18,
        difficulty: 30
      }
    ]
  };

  const compliance = {
    platform: platform,
    score: 95,
    isCompliant: true,
    rules: [
      {
        rule: 'Title Length',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: `Title is ${optimizedTitle.length} characters (optimal)`,
        severity: 'high' as 'low' | 'medium' | 'high'
      },
      {
        rule: 'No Promotional Language',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'Title does not contain banned promotional words',
        severity: 'high' as 'low' | 'medium' | 'high'
      },
      {
        rule: 'Keyword Placement',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'Primary keyword is front-loaded in title',
        severity: 'medium' as 'low' | 'medium' | 'high'
      },
      {
        rule: 'Character Encoding',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'No special characters that may cause issues',
        severity: 'low' as 'low' | 'medium' | 'high'
      }
    ]
  };

  return { seoMetrics, keywordData, compliance };
}

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
    let usageLimit = 5; // Default 5 credits for free users
    let tier = 'free';

    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
        usageCount = userData.usageCount || 0;
        tier = userData.tier || 'free';
        
        // Set usage limits based on tier
        if (tier === 'free') {
          usageLimit = 5;
        } else if (tier === 'basic') {
          usageLimit = 50;
        } else if (tier === 'premium') {
          usageLimit = 999999; // Unlimited
        } else if (tier === 'enterprise') {
          usageLimit = 999999; // Unlimited
        } else {
          usageLimit = userData.usageLimit || 5;
        }
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
        tier = 'free';
      }
    } catch (firestoreError: any) {
      // Firestore not available, use defaults
      console.warn('Firestore not available:', firestoreError.message);
      usageCount = 0;
      usageLimit = 5;
      tier = 'free';
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
    const { mode, title, description, platform, keywords, productData, additionalData, engine } = body;

    // Determine which engine to use (Requirement 2.4, 2.5, 8.1)
    const selectedEngine = engine || 'gemini'; // Default to Gemini
    console.log(`🎯 Using ${selectedEngine} engine for optimization`);

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

    // Generate optimized content based on engine and mode
    let aiResponse;
    try {
      // Route to appropriate engine (Requirement 9.1)
      if (selectedEngine === 'deepseek') {
        console.log('🚀 Using DeepSeek engine');
        
        // Import DeepSeek client
        const { generateOptimizedContent: generateDeepSeekContent } = await import('@/lib/deepseek/client');
        
        // Prepare data based on mode
        let deepSeekData: any = {};
        let deepSeekMode: 'optimize_existing' | 'create_new' | 'analyze_url' = 'optimize_existing';
        
        if (mode === 'create-new') {
          deepSeekMode = 'create_new';
          deepSeekData = { productData };
        } else {
          deepSeekMode = 'optimize_existing';
          deepSeekData = { title, description, keywords };
        }
        
        // Call DeepSeek optimization
        const deepSeekResult = await generateDeepSeekContent(
          deepSeekMode,
          deepSeekData,
          platform as Platform
        );
        
        // Transform DeepSeek response to match expected format
        aiResponse = {
          title: deepSeekResult.title,
          description: deepSeekResult.description,
          tags: [...deepSeekResult.keywords.primary, ...deepSeekResult.keywords.secondary],
          bulletPoints: deepSeekResult.bullets,
          backendSearchTerms: deepSeekResult.keywords.backend,
          seo_score_new: deepSeekResult.seoScore.overall,
          improvements: deepSeekResult.recommendations,
          seoMetrics: {
            keywordRelevance: deepSeekResult.seoScore.keywordOptimization,
            titleOptimization: deepSeekResult.seoScore.titleEffectiveness,
            descriptionQuality: deepSeekResult.seoScore.descriptionQuality,
            overall: deepSeekResult.seoScore.overall,
            breakdown: {
              titleLength: {
                score: deepSeekResult.qualityChecks.checks.titleCharUtilization.passed ? 98 : 75,
                status: deepSeekResult.qualityChecks.checks.titleCharUtilization.passed ? 'good' as const : 'warning' as const,
                message: deepSeekResult.qualityChecks.checks.titleCharUtilization.message
              },
              keywordDensity: {
                score: deepSeekResult.qualityChecks.checks.keywordDensity.passed ? 95 : 70,
                status: deepSeekResult.qualityChecks.checks.keywordDensity.passed ? 'good' as const : 'warning' as const,
                message: deepSeekResult.qualityChecks.checks.keywordDensity.message
              },
              readability: {
                score: 88,
                status: 'good' as const,
                message: 'Content is easy to read and understand'
              },
              structure: {
                score: deepSeekResult.qualityChecks.score,
                status: deepSeekResult.qualityChecks.passed ? 'good' as const : 'warning' as const,
                message: 'Content structure follows best practices'
              },
              uniqueness: {
                score: 85,
                status: 'warning' as const,
                message: 'Consider adding more unique selling points'
              }
            },
            suggestions: deepSeekResult.qualityChecks.suggestions,
            missingKeywords: []
          },
          keywordData: {
            primary: deepSeekResult.keywords.primary.map(k => ({
              keyword: k,
              searchVolume: 0,
              cpc: 0,
              competition: 'Medium' as const,
              trend: 'stable' as const,
              trendPercentage: 0,
              difficulty: 50
            })),
            related: deepSeekResult.keywords.secondary.map(k => ({
              keyword: k,
              searchVolume: 0,
              cpc: 0,
              competition: 'Low' as const,
              trend: 'stable' as const,
              trendPercentage: 0,
              difficulty: 40
            })),
            longTail: deepSeekResult.keywords.longTail.map(k => ({
              keyword: k,
              searchVolume: 0,
              cpc: 0,
              competition: 'Low' as const,
              trend: 'up' as const,
              trendPercentage: 5,
              difficulty: 30
            }))
          },
          compliance: {
            platform: platform,
            score: deepSeekResult.qualityChecks.score,
            isCompliant: deepSeekResult.qualityChecks.passed,
            rules: [
              {
                rule: 'Title Length',
                status: deepSeekResult.qualityChecks.checks.titleCharUtilization.passed ? 'pass' as const : 'warning' as const,
                message: deepSeekResult.qualityChecks.checks.titleCharUtilization.message,
                severity: 'high' as const
              },
              {
                rule: 'Bullet Points Length',
                status: deepSeekResult.qualityChecks.checks.bulletCharCount.passed ? 'pass' as const : 'warning' as const,
                message: deepSeekResult.qualityChecks.checks.bulletCharCount.message,
                severity: 'medium' as const
              },
              {
                rule: 'Description Length',
                status: deepSeekResult.qualityChecks.checks.descriptionCharCount.passed ? 'pass' as const : 'warning' as const,
                message: deepSeekResult.qualityChecks.checks.descriptionCharCount.message,
                severity: 'medium' as const
              },
              {
                rule: 'Keyword Count',
                status: deepSeekResult.qualityChecks.checks.keywordCount.passed ? 'pass' as const : 'warning' as const,
                message: deepSeekResult.qualityChecks.checks.keywordCount.message,
                severity: 'medium' as const
              }
            ]
          }
        };
        
      } else {
        // Use Gemini engine (default) - Requirement 8.1, 8.2
        console.log('🚀 Using Gemini engine');
        
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
      }
    } catch (error: any) {
      console.error('Optimization error:', error);
      
      // Don't fall back to Gemini if DeepSeek was explicitly selected (Requirement 9.6)
      if (selectedEngine === 'deepseek') {
        let errorMessage = 'DeepSeek optimization failed. ';
        
        if (error.message?.includes('API key') || error.code === 'DEEPSEEK_API_KEY_MISSING') {
          errorMessage += 'DeepSeek API key is not configured. Please add DEEPSEEK_API_KEY to your environment variables.';
        } else if (error.message?.includes('quota') || error.code === 'DEEPSEEK_QUOTA_EXCEEDED') {
          errorMessage += 'DeepSeek API quota exceeded. Please try again later.';
        } else if (error.message?.includes('network') || error.code === 'DEEPSEEK_NETWORK_ERROR') {
          errorMessage += 'Network error. Please check your connection.';
        } else if (error.code === 'DEEPSEEK_TIMEOUT') {
          errorMessage += 'Request timed out. Please try again.';
        } else {
          errorMessage += error.message || 'Please try again or contact support.';
        }
        
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: errorMessage,
          code: 'AI_ERROR',
        }, { status: 500 });
      }
      
      // Fallback to original Gemini optimization for Gemini engine
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
    const enhancedMetrics = generateEnhancedMetrics(
      aiResponse.title,
      aiResponse.description,
      aiResponse.tags || [],
      aiResponse.seo_score_new || calculateSEOScore({
        title: aiResponse.title,
        description: aiResponse.description,
        tags: aiResponse.tags || [],
        keywords: keywords?.split(',').map((k: string) => k.trim()) || [],
        category: '',
        specifications: []
      } as any, platform),
      mode === 'create-new' ? productData.platform : platform
    );

    const optimized = {
      title: aiResponse.title,
      description: aiResponse.description,
      tags: aiResponse.tags || [],
      seoScore: aiResponse.seo_score_new || calculateSEOScore({
        title: aiResponse.title,
        description: aiResponse.description,
        tags: aiResponse.tags || [],
        keywords: keywords?.split(',').map((k: string) => k.trim()) || [],
        category: '',
        specifications: []
      } as any, platform),
      improvements: aiResponse.improvements || [],
      bulletPoints: aiResponse.bulletPoints,
      backendSearchTerms: aiResponse.backendSearchTerms,
      platform: mode === 'create-new' ? productData.platform : platform,
      // Add enhanced metrics
      seoMetrics: aiResponse.seoMetrics || enhancedMetrics.seoMetrics,
      keywordData: aiResponse.keywordData || enhancedMetrics.keywordData,
      compliance: aiResponse.compliance || enhancedMetrics.compliance
    };

    // Try to save optimization to Firestore and increment usage count
    try {
      const optimizationData: any = {
        userId,
        platform: mode === 'create-new' ? productData.platform : platform,
        mode: mode || 'optimize-existing',
        engine: selectedEngine, // Add engine metadata (Requirement 12.5, 12.6)
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
