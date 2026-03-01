import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

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

    const { userIds, subject, message } = await request.json();

    if (!userIds || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'userIds, subject, and message are required' },
        { status: 400 }
      );
    }

    // Get user emails
    const users = await Promise.all(
      userIds.map((id: string) => adminDb!.collection('users').doc(id).get())
    );

    const emails = users
      .filter(doc => doc.exists)
      .map(doc => doc.data()?.email)
      .filter(Boolean);

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log the email details
    console.log('Email to send:', {
      to: emails,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // Store email log in Firestore
    await adminDb.collection('emailLogs').add({
      recipients: emails,
      subject,
      message,
      sentBy: decodedToken.email,
      sentAt: new Date().toISOString(),
      status: 'pending' // In production: 'sent', 'failed', etc.
    });

    return NextResponse.json({
      success: true,
      message: `Email queued for ${emails.length} users`,
      recipients: emails
    });

  } catch (error: any) {
    console.error('Admin email users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
