import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin is not configured',
      }, { status: 500 });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - No token provided',
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: true,
        message: 'User document does not exist in Firestore',
        userId,
        userExists: false,
        decodedToken: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
        }
      });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      success: true,
      message: 'User data retrieved successfully',
      userId,
      userExists: true,
      userData: {
        email: userData?.email,
        displayName: userData?.displayName,
        tier: userData?.tier,
        usageCount: userData?.usageCount,
        usageLimit: userData?.usageLimit,
        createdAt: userData?.createdAt?.toDate?.() || userData?.createdAt,
        updatedAt: userData?.updatedAt?.toDate?.() || userData?.updatedAt,
      }
    });
  } catch (error: any) {
    console.error('Debug user error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}