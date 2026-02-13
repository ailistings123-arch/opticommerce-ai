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

    // Get user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'User not found',
        code: 'UNAUTHORIZED',
      }, { status: 404 });
    }

    const userData = userDoc.data() as User;

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    console.error('User fetch error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    }, { status: 500 });
  }
}
