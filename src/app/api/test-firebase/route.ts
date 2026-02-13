import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin environment variables are set
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    const status = {
      FIREBASE_ADMIN_PROJECT_ID: projectId ? '✅ Set' : '❌ Missing',
      FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail ? '✅ Set' : '❌ Missing',
      FIREBASE_ADMIN_PRIVATE_KEY: privateKey ? '✅ Set' : '❌ Missing',
      projectIdValue: projectId || 'Not set',
      clientEmailValue: clientEmail || 'Not set',
      privateKeyLength: privateKey ? `${privateKey.length} characters` : 'Not set',
      privateKeyStart: privateKey ? privateKey.substring(0, 50) + '...' : 'Not set',
    };

    // Try to initialize Firebase Admin
    let initializationStatus = 'Not tested';
    try {
      const { adminAuth, adminDb } = await import('@/lib/firebase/admin');
      if (adminAuth && adminDb) {
        initializationStatus = '✅ Firebase Admin initialized successfully';
      } else {
        initializationStatus = '❌ Firebase Admin failed to initialize (null instances)';
      }
    } catch (error: any) {
      initializationStatus = `❌ Firebase Admin initialization error: ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin Environment Variables Check',
      status,
      initialization: initializationStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}