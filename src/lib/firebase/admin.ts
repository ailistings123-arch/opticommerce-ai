import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    console.log('🔧 Initializing Firebase Admin...');
    
    // Try to use service account JSON file first
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('📄 Using service account JSON file');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      return initializeApp({
        credential: cert(serviceAccount),
      });
    }
    
    // Fallback to environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️ Firebase Admin credentials are not configured.');
      console.warn('💡 Create firebase-service-account.json or set environment variables');
      return null;
    }

    // Clean up the private key
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    privateKey = privateKey.replace(/\\n/g, '\n');
    privateKey = privateKey.trim();

    console.log('🔑 Using environment variables');
    console.log('Project ID:', projectId);
    console.log('Client Email:', clientEmail);

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    
    if (error.message?.includes('DECODER') || error.message?.includes('PEM')) {
      console.error('🔑 Private key format issue!');
      console.error('💡 Solution: Download service account JSON from Firebase Console');
      console.error('   1. Go to: https://console.firebase.google.com/project/ailistings-50933/settings/serviceaccounts/adminsdk');
      console.error('   2. Click "Generate new private key"');
      console.error('   3. Save as firebase-service-account.json in project root');
    }
    
    return null;
  }
}

try {
  const app = initializeFirebaseAdmin();
  if (app) {
    adminApp = app;
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    console.log('✅ Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error);
}

export { adminAuth, adminDb };
