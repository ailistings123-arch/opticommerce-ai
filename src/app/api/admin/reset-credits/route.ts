import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAIL = 'your-admin-email@example.com'; // TODO: Change this to your email

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
    if (decodedToken.email !== ADMIN_EMAIL) {
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Reset user credits to 0
    await adminDb.collection('users').doc(userId).update({
      usageCount: 0,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'User credits reset successfully'
    });

  } catch (error: any) {
    console.error('Admin reset credits error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
