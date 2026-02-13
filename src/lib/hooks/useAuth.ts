'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserData } from '@/lib/firebase/auth';
import { User } from '@/types';
import { Timestamp } from 'firebase/firestore';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    if (firebaseUser) {
      try {
        console.log('🔄 Refreshing user data from server...');
        const token = await firebaseUser.getIdToken();
        
        const response = await fetch('/api/user-refresh', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('✅ Fresh user data received:', result.data);
          setUserData(result.data);
        } else {
          console.error('❌ Failed to refresh user data:', result.error);
          // Fallback to client-side method
          const data = await getUserData(firebaseUser.uid);
          if (data) {
            setUserData(data);
          }
        }
      } catch (error) {
        console.error('❌ Error refreshing user data:', error);
        // Fallback to client-side method
        try {
          const data = await getUserData(firebaseUser.uid);
          if (data) {
            setUserData(data);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback refresh also failed:', fallbackError);
        }
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        const data = await getUserData(user.uid);
        
        // If Firestore isn't set up, create a default user object
        if (!data) {
          console.log('⚠️ No Firestore data found, creating default user with 5 credits');
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          
          const defaultUserData: User = {
            email: user.email!,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL,
            tier: 'free',
            usageCount: 0,
            usageLimit: 5, // 5 credits for free users
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            resetDate: Timestamp.fromDate(nextMonth),
          };
          
          setUserData(defaultUserData);
          
          // Try to create the user document in Firestore
          try {
            console.log('🔄 Attempting to create user document in Firestore...');
            const token = await user.getIdToken();
            await fetch('/api/user-refresh', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            console.log('✅ User document creation attempted');
          } catch (createError) {
            console.warn('⚠️ Could not create user document:', createError);
          }
        } else {
          console.log('✅ Firestore data loaded:', data);
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Removed firebaseUser dependency

  return {
    user: firebaseUser,
    userData,
    loading,
    isAuthenticated: !!firebaseUser,
    refreshUserData,
  };
}
