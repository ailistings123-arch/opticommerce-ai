import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, Tier } from '@/types';

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(userCredential.user, displayName);
  return userCredential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  if (!userDoc.exists()) {
    await createUserDocument(userCredential.user, userCredential.user.displayName || 'User');
  }
  
  return userCredential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

async function createUserDocument(firebaseUser: FirebaseUser, displayName: string) {
  try {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const userData: Omit<User, 'createdAt' | 'updatedAt' | 'resetDate'> & {
      createdAt: any;
      updatedAt: any;
      resetDate: any;
    } = {
      email: firebaseUser.email!,
      displayName,
      photoURL: firebaseUser.photoURL,
      tier: 'free' as Tier,
      usageCount: 0,
      usageLimit: 5, // Changed from 3 to 5 credits
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resetDate: nextMonth,
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  } catch (error: any) {
    console.error('Error creating user document:', error);
    // Don't throw error - allow user to continue even if Firestore isn't set up
    if (error.code === 'unavailable') {
      console.warn('Firestore is not available. Please set up Firestore in Firebase Console.');
    }
  }
}

export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Error getting user data:', error);
    if (error.code === 'unavailable') {
      console.warn('Firestore is not available. Please set up Firestore in Firebase Console.');
    }
    return null;
  }
}
