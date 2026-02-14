import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';

// Check if we're in demo mode or have proper Firebase config
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
  try {
    if (hasFirebaseConfig && !isDemoMode) {
      // Real Firebase setup
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      
      // Enable offline persistence (optional, helps with offline support)
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support offline persistence');
        }
      });
      
      console.log('✅ Firebase initialized successfully');
    } else {
      // Demo mode - create mock Firebase objects
      console.warn('⚠️ Running in demo mode - Firebase not configured');
      console.warn('Add your Firebase config to .env.local for full functionality');
      
      // Initialize with demo config for basic functionality
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.warn('⚠️ Falling back to demo mode');
    
    // Fallback initialization
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (fallbackError) {
      console.error('❌ Even demo mode failed:', fallbackError);
    }
  }
}

export { app, auth, db, isDemoMode, hasFirebaseConfig };
