import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
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

    // Get fresh user data from Firestore
    let userDoc;
    try {
      userDoc = await adminDb.collection('users').doc(userId).get();
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError.message);
      
      // Return default user data if Firestore is not available
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data: {
          email: decodedToken.email || '',
          displayName: decodedToken.name || 'User',
          photoURL: decodedToken.picture || null,
          tier: 'free',
          usageCount: 0,
          usageLimit: 5,
          createdAt: now,
          updatedAt: now,
          resetDate: nextMonth,
        },
      });
    }
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
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
      
      try {
        await adminDb.collection('users').doc(userId).set(newUserData);
      } catch (createError: any) {
        console.warn('Could not create user document:', createError.message);
      }
      
      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data: newUserData,
      });
    }

    const userData = userDoc.data() as User;

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    console.error('User refresh error:', error);
    
    // Return a more helpful error message
    let errorMessage = 'Internal server error';
    if (error.message?.includes('UNAUTHENTICATED')) {
      errorMessage = 'Firebase credentials not configured properly';
    }
    
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: errorMessage,
      code: 'SERVER_ERROR',
    }, { status: 500 });
  }
}