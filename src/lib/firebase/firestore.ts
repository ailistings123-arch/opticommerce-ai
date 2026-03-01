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

export async function getOptimizationHistory(userId: string, limitCount: number = 50) {
  try {
    console.log('📖 Fetching optimization history for user:', userId);
    
    // Query optimizations collection
    const optimizationsQuery = query(
      collection(db, 'optimizations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    // Query urlAnalyses collection
    const urlAnalysesQuery = query(
      collection(db, 'urlAnalyses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    // Fetch both collections in parallel
    const [optimizationsSnapshot, urlAnalysesSnapshot] = await Promise.all([
      getDocs(optimizationsQuery),
      getDocs(urlAnalysesQuery)
    ]);
    
    // Map optimizations
    const optimizations = optimizationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Optimization[];
    
    // Map URL analyses to optimization format
    const urlAnalyses = urlAnalysesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        platform: data.platform,
        mode: 'analyze-url',
        url: data.url,
        original: undefined,
        optimized: data.analysis,
        createdAt: data.createdAt,
      };
    }) as any[];
    
    // Merge and sort by createdAt
    const allHistory = [...optimizations, ...urlAnalyses].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, limitCount);
    
    console.log(`✅ Found ${allHistory.length} items in history (${optimizations.length} optimizations + ${urlAnalyses.length} URL analyses)`);
    return allHistory;
  } catch (error: any) {
    console.error('❌ Failed to fetch optimization history:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId
    });
    
    // If it's an index error, provide helpful message
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.error('🔍 Index required! Please create indexes in Firebase Console:');
      console.error('Collection: optimizations - Fields: userId (Ascending), createdAt (Descending)');
      console.error('Collection: urlAnalyses - Fields: userId (Ascending), createdAt (Descending)');
      console.error('Or click the link in the error message above');
    }
    
    throw error;
  }
}
