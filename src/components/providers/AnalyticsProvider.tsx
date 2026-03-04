'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { trackUserAuth } from '@/lib/firebase/analytics';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user, userData } = useAuth();
  
  // Track page views automatically
  useAnalytics();

  // Track user authentication
  useEffect(() => {
    if (user && userData) {
      trackUserAuth(user.uid, userData.email, userData.tier);
    }
  }, [user, userData]);

  return <>{children}</>;
}
