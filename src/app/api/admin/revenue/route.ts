import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

const TIER_PRICES: Record<string, number> = {
  starter: 25,
  professional: 49,
  enterprise: 150
};

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

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = users.reduce((total, user) => {
      const price = TIER_PRICES[user.tier] || 0;
      return total + price;
    }, 0);

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Revenue by tier
    const revenueByTier = {
      starter: users.filter(u => u.tier === 'starter').length * TIER_PRICES.starter,
      professional: users.filter(u => u.tier === 'professional').length * TIER_PRICES.professional,
      enterprise: users.filter(u => u.tier === 'enterprise').length * TIER_PRICES.enterprise
    };

    // Get payment history from Stripe webhook logs (if available)
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalRevenue = payments.reduce((sum, payment: any) => {
      return sum + (payment.amount || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        mrr,
        arr,
        revenueByTier,
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        payments: payments.slice(0, 20), // Recent 20 payments
        paidUsers: users.filter(u => u.tier !== 'free').length,
        conversionRate: users.length > 0 
          ? ((users.filter(u => u.tier !== 'free').length / users.length) * 100).toFixed(2)
          : 0
      }
    });

  } catch (error: any) {
    console.error('Admin revenue error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
