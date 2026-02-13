import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
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

    // Force create/update user with 5 credits
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const userData = {
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
    
    // Force set the user document
    await adminDb.collection('users').doc(userId).set(userData, { merge: true });
    
    return NextResponse.json({
      success: true,
      message: 'User credits fixed to 5',
      userData,
    });
  } catch (error: any) {
    console.error('Fix credits error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}