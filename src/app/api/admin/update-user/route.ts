import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  starter: 25,
  professional: 50,
  enterprise: 999999
};

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
    const decodedToken = await adminAuth!.verifyIdToken(token);
    
    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decodedToken.email || '')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access only' },
        { status: 403 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { userId, tier } = await request.json();

    if (!userId || !tier) {
      return NextResponse.json(
        { success: false, error: 'userId and tier are required' },
        { status: 400 }
      );
    }

    // Update user tier and limit
    await adminDb.collection('users').doc(userId).update({
      tier,
      usageLimit: TIER_LIMITS[tier] || 5,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
