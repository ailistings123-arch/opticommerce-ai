'use client';

import { getAnalytics, logEvent, setUserId, setUserProperties, Analytics } from 'firebase/analytics';
import { app } from './config';

let analytics: Analytics | null = null;

// Initialize analytics only on client side
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.error('❌ Firebase Analytics initialization failed:', error);
  }
}

// Event types for type safety
export type AnalyticsEvent = 
  | 'page_view'
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'optimization_started'
  | 'optimization_completed'
  | 'optimization_failed'
  | 'url_analysis_started'
  | 'url_analysis_completed'
  | 'listing_generated'
  | 'export_clicked'
  | 'platform_selected'
  | 'mode_selected'
  | 'tier_upgraded'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'admin_login'
  | 'admin_action'
  | 'error_occurred'
  | 'feature_used';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (!analytics) return;
  
  try {
    logEvent(analytics, 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track custom events
export const trackEvent = (eventName: AnalyticsEvent, params?: EventParams) => {
  if (!analytics) return;
  
  try {
    logEvent(analytics, eventName as string, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track user authentication
export const trackUserAuth = (userId: string, email?: string, tier?: string) => {
  if (!analytics) return;
  
  try {
    setUserId(analytics, userId);
    if (email || tier) {
      setUserProperties(analytics, {
        email: email || '',
        tier: tier || 'free',
      });
    }
  } catch (error) {
    console.error('Analytics user tracking error:', error);
  }
};

// Track optimization events
export const trackOptimization = (
  status: 'started' | 'completed' | 'failed',
  platform: string,
  mode: string,
  userId?: string,
  error?: string
) => {
  if (!analytics) return;
  
  const eventName = `optimization_${status}` as AnalyticsEvent;
  trackEvent(eventName, {
    platform,
    mode,
    user_id: userId,
    error: error || '',
  });
};

// Track URL analysis
export const trackUrlAnalysis = (
  status: 'started' | 'completed',
  url: string,
  userId?: string
) => {
  if (!analytics) return;
  
  const eventName = `url_analysis_${status}` as AnalyticsEvent;
  trackEvent(eventName, {
    url,
    user_id: userId,
  });
};

// Track platform selection
export const trackPlatformSelection = (platform: string, userId?: string) => {
  trackEvent('platform_selected', {
    platform,
    user_id: userId,
  });
};

// Track mode selection
export const trackModeSelection = (mode: string, userId?: string) => {
  trackEvent('mode_selected', {
    mode,
    user_id: userId,
  });
};

// Track exports
export const trackExport = (format: string, platform: string, userId?: string) => {
  trackEvent('export_clicked', {
    format,
    platform,
    user_id: userId,
  });
};

// Track payments
export const trackPayment = (
  status: 'initiated' | 'completed' | 'failed',
  tier: string,
  amount?: number,
  userId?: string
) => {
  const eventName = `payment_${status}` as AnalyticsEvent;
  trackEvent(eventName, {
    tier,
    amount: amount || 0,
    user_id: userId,
  });
};

// Track admin actions
export const trackAdminAction = (
  action: string,
  target?: string,
  adminEmail?: string
) => {
  trackEvent('admin_action', {
    action,
    target: target || '',
    admin_email: adminEmail || '',
  });
};

// Track errors
export const trackError = (
  errorType: string,
  errorMessage: string,
  page?: string,
  userId?: string
) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    page: page || window.location.pathname,
    user_id: userId,
  });
};

// Track feature usage
export const trackFeatureUsage = (
  featureName: string,
  action: string,
  userId?: string
) => {
  trackEvent('feature_used', {
    feature_name: featureName,
    action,
    user_id: userId,
  });
};

export { analytics };
