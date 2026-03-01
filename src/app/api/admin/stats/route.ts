import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

export async function GET(request: NextRequest) {
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

    // Get stats
    const usersSnapshot = await adminDb.collection('users').get();
    const optimizationsSnapshot = await adminDb.collection('optimizations').get();
    const urlAnalysesSnapshot = await adminDb.collection('urlAnalyses').get();

    const users = usersSnapshot.docs.map(doc => doc.data());
    const paidUsers = users.filter(u => u.tier !== 'free').length;
    
    // Get active today (users who used the service today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = users.filter(u => {
      if (!u.lastUsed) return false;
      const lastUsed = new Date(u.lastUsed);
      return lastUsed >= today;
    }).length;

    const stats = {
      totalUsers: usersSnapshot.size,
      totalOptimizations: optimizationsSnapshot.size + urlAnalysesSnapshot.size,
      paidUsers,
      activeToday,
      tierBreakdown: {
        free: users.filter(u => u.tier === 'free').length,
        starter: users.filter(u => u.tier === 'starter').length,
        professional: users.filter(u => u.tier === 'professional').length,
        enterprise: users.filter(u => u.tier === 'enterprise').length,
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
