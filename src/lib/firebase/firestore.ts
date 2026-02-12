import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Optimization, OptimizedContent } from '@/types';

export async function saveOptimization(
  userId: string,
  platform: string,
  original: { title: string; description: string; keywords?: string },
  optimized: OptimizedContent
) {
  const optimizationData = {
    userId,
    platform,
    original,
    optimized,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'optimizations'), optimizationData);
  return docRef.id;
}

export async function incrementUsageCount(userId: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    usageCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function getOptimizationHistory(userId: string, limitCount: number = 20) {
  const q = query(
    collection(db, 'optimizations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Optimization[];
}
