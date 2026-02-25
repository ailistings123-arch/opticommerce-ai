import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { AIService } from '@/lib/ai/aiService';
import { calculateSEOScore } from '@/lib/utils/seo-scorer';
import { Platform, OptimizedContent } from '@/types';

export const maxDuration = 120;

// Helper function to remove undefined values from objects
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { mode, platform, title, description, keywords, additionalData, productData } = body;

    if (!mode || !platform) {
      return NextResponse.json(
        { success: false, error: 'Mode and platform are required' },
        { status: 400 }
      );
    }

    // Check user credits
    if (adminDb) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData && userData.usageCount >= userData.usageLimit) {
        return NextResponse.json(
          { success: false, error: 'Usage limit exceeded' },
          { status: 403 }
        );
      }
    }

    let optimized: OptimizedContent;

    if (mode === 'optimize-existing') {
      // Mode 1: Optimize existing listing
      const aiRequest = {
        platform,
        productData: {
          title,
          description,
          keywords: keywords?.split(',').map((k: string) => k.trim()) || [],
          ...additionalData
        },
        mode: 'optimize' as const
      };

      const result = await AIService.generateListing(aiRequest, {
        maxRetries: 2,
        validateResponse: true
      });

      optimized = {
        title: result.listing.title || title,
        description: result.listing.description || description,
        keywords: result.listing.keywords || [],
        category: additionalData?.category || '',
        specifications: additionalData?.specifications || [],
        optimizedTitle: result.listing.title || title,
        optimizedDescription: result.listing.description || description,
        integratedKeywords: {
          primary: result.listing.keywords?.slice(0, 3) || [],
          secondary: result.listing.keywords?.slice(3, 6) || [],
          longTail: [],
          synonyms: [],
          competitors: []
        },
        keywordDensity: {},
        tags: result.listing.keywords || [],
        seoScore: 0,
        improvements: [result.listing.platform_notes || 'Listing optimized successfully'],
        bulletPoints: result.listing.bullets || []
      };

    } else if (mode === 'create-new') {
      // Mode 2: Create new listing
      const aiRequest = {
        platform,
        productData: {
          title: productData.productName,
          description: `${productData.whatIsIt}\n\n${productData.problemSolved}`,
          category: productData.category,
          keywords: productData.keyFeatures || [],
          ...productData
        },
        mode: 'create' as const
      };

      const result = await AIService.generateListing(aiRequest, {
        maxRetries: 2,
        validateResponse: true
      });

      optimized = {
        title: result.listing.title || productData.productName,
        description: result.listing.description || '',
        keywords: result.listing.keywords || [],
        category: productData.category || '',
        specifications: productData.specifications || [],
        optimizedTitle: result.listing.title || productData.productName,
        optimizedDescription: result.listing.description || '',
        integratedKeywords: {
          primary: result.listing.keywords?.slice(0, 3) || [],
          secondary: result.listing.keywords?.slice(3, 6) || [],
          longTail: [],
          synonyms: [],
          competitors: []
        },
        keywordDensity: {},
        tags: result.listing.keywords || [],
        seoScore: 0,
        improvements: [result.listing.platform_notes || 'Listing created successfully'],
        bulletPoints: result.listing.bullets || productData.keyFeatures || []
      };

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid mode' },
        { status: 400 }
      );
    }

    // Calculate SEO score
    optimized.seoScore = calculateSEOScore(optimized, platform as Platform);

    // Update usage count
    if (adminDb) {
      await adminDb.collection('users').doc(userId).update({
        usageCount: (await adminDb.collection('users').doc(userId).get()).data()?.usageCount + 1 || 1,
        lastUsed: new Date().toISOString()
      });

      // Save to history
      await adminDb.collection('optimizations').add(removeUndefined({
        userId,
        mode,
        platform,
        original: mode === 'optimize-existing' ? { title, description } : null,
        optimized,
        createdAt: new Date().toISOString()
      }));
    }

    return NextResponse.json({
      success: true,
      data: { optimized }
    });

  } catch (error: any) {
    console.error('Optimization error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to optimize listing'
      },
      { status: 500 }
    );
  }
}
