import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin is not configured',
        details: {
          adminAuth: !!adminAuth,
          adminDb: !!adminDb,
        }
      }, { status: 500 });
    }

    // Try to access Firestore
    try {
      const testCollection = adminDb.collection('_test_connection');
      const testDoc = await testCollection.doc('test').get();
      
      return NextResponse.json({
        success: true,
        message: 'Firestore connection successful!',
        details: {
          firestoreConnected: true,
          canRead: true,
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        }
      });
    } catch (firestoreError: any) {
      return NextResponse.json({
        success: false,
        error: 'Firestore connection failed',
        details: {
          code: firestoreError.code,
          message: firestoreError.message,
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: {
        message: error.message,
      }
    }, { status: 500 });
  }
}
