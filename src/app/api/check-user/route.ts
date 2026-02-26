import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin not configured',
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter required',
      }, { status: 400 });
    }

    // Find user by email
    const usersSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        tier: userData.tier,
        usageCount: userData.usageCount,
        usageLimit: userData.usageLimit,
        remaining: userData.usageLimit - userData.usageCount,
        percentage: Math.round((userData.usageCount / userData.usageLimit) * 100),
        createdAt: userData.createdAt,
        lastUsed: userData.lastUsed,
      },
    });
  } catch (error: any) {
    console.error('Check user error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
