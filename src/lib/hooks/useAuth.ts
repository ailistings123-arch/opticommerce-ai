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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        const data = await getUserData(user.uid);
        
        // If Firestore isn't set up, create a default user object
        if (!data) {
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          
          const defaultUserData: User = {
            email: user.email!,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL,
            tier: 'free',
            usageCount: 0,
            usageLimit: 3,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            resetDate: Timestamp.fromDate(nextMonth),
          };
          
          setUserData(defaultUserData);
        } else {
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user: firebaseUser,
    userData,
    loading,
    isAuthenticated: !!firebaseUser,
  };
}
