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
  try {
    console.log('💾 Saving optimization to Firestore...', { userId, platform });
    
    const optimizationData = {
      userId,
      platform,
      original,
      optimized,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'optimizations'), optimizationData);
    console.log('✅ Optimization saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Failed to save optimization:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId,
      platform
    });
    throw error;
  }
}

export async function incrementUsageCount(userId: string) {
  try {
    console.log('📊 Incrementing usage count for user:', userId);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      usageCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Usage count incremented successfully');
  } catch (error: any) {
    console.error('❌ Failed to increment usage count:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId
    });
    throw error;
  }
}

export async function getOptimizationHistory(userId: string, limitCount: number = 20) {
  try {
    console.log('📖 Fetching optimization history for user:', userId);
    
    const q = query(
      collection(db, 'optimizations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const optimizations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Optimization[];
    
    console.log(`✅ Found ${optimizations.length} optimizations in history`);
    return optimizations;
  } catch (error: any) {
    console.error('❌ Failed to fetch optimization history:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId
    });
    
    // If it's an index error, provide helpful message
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.error('🔍 Index required! Please create an index in Firebase Console:');
      console.error('Collection: optimizations');
      console.error('Fields: userId (Ascending), createdAt (Descending)');
      console.error('Or click the link in the error message above');
    }
    
    throw error;
  }
}
