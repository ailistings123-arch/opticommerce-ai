import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAIL = 'your-admin-email@example.com'; // TODO: Change this to your email

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

    // Get recent optimizations
    const optimizationsSnapshot = await adminDb
      .collection('optimizations')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const urlAnalysesSnapshot = await adminDb
      .collection('urlAnalyses')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    // Get user emails
    const usersSnapshot = await adminDb.collection('users').get();
    const userEmails: Record<string, string> = {};
    usersSnapshot.docs.forEach(doc => {
      userEmails[doc.id] = doc.data().email;
    });

    const optimizations = optimizationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      userEmail: userEmails[doc.data().userId] || 'Unknown',
      createdAt: doc.data().createdAt
    }));

    const urlAnalyses = urlAnalysesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      userEmail: userEmails[doc.data().userId] || 'Unknown',
      mode: 'analyze-url',
      optimized: doc.data().analysis,
      createdAt: doc.data().createdAt
    }));

    // Merge and sort
    const allOptimizations = [...optimizations, ...urlAnalyses].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: allOptimizations
    });

  } catch (error: any) {
    console.error('Admin optimizations error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
