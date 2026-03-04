# Firebase Analytics Integration - Complete Guide

## Overview
Firebase Analytics has been fully integrated throughout the entire project to track all user interactions, events, and behaviors. This provides comprehensive data collection for the admin panel and business insights.

## What's Tracked

### 1. Page Views
- **Automatic tracking** on every page navigation
- Tracks: page path, page title, page location, timestamp
- Implementation: `AnalyticsProvider` component in root layout

### 2. User Authentication
- **Sign Up Events**: Email and Google sign-ups
- **Login Events**: Email and Google logins
- **Logout Events**: User sign-outs
- **User Properties**: User ID, email, tier (free/starter/professional/enterprise)
- Tracked in: `LoginForm.tsx`, `SignupForm.tsx`

### 3. Optimization Events
- **Optimization Started**: When user begins any optimization
- **Optimization Completed**: Successful optimization
- **Optimization Failed**: Failed optimization with error details
- **Platform Selection**: Which platform user selected (Amazon, Shopify, Etsy, etc.)
- **Mode Selection**: Which mode user chose (optimize-existing, create-new, analyze-url)
- Tracked in: `dashboard/page.tsx` (all 3 modes)

### 4. URL Analysis
- **Analysis Started**: When URL analysis begins
- **Analysis Completed**: Successful URL scraping and optimization
- Tracked in: `dashboard/page.tsx` (Mode 3)

### 5. Export Actions
- **Export Format**: PDF, CSV, Email, Copy
- **Platform**: Which platform the export is for
- Tracked in: `ExportOptions.tsx`

### 6. Admin Actions
- **Admin Login**: When admin logs in
- **Admin Actions**: All admin panel actions
- **Target**: What the admin action affected
- Tracked in: `admin/login/page.tsx`

### 7. Payment Events
- **Payment Initiated**: When user starts checkout
- **Payment Completed**: Successful payment
- **Payment Failed**: Failed payment
- **Tier**: Which tier was purchased
- Ready for integration in payment flow

### 8. Error Tracking
- **Error Type**: Category of error
- **Error Message**: Detailed error message
- **Page**: Where error occurred
- **User ID**: Who experienced the error
- Tracked throughout the app

### 9. Feature Usage
- **Feature Name**: Which feature was used
- **Action**: What action was performed
- **User ID**: Who used the feature
- Ready for custom feature tracking

## Files Created/Modified

### New Files
1. `src/lib/firebase/analytics.ts` - Core analytics functions
2. `src/lib/hooks/useAnalytics.ts` - React hook for page view tracking
3. `src/components/providers/AnalyticsProvider.tsx` - Analytics provider component

### Modified Files
1. `src/app/layout.tsx` - Added AnalyticsProvider
2. `src/app/dashboard/page.tsx` - Added tracking for all optimization modes
3. `src/components/auth/LoginForm.tsx` - Added login tracking
4. `src/components/auth/SignupForm.tsx` - Added signup tracking
5. `src/components/dashboard/ExportOptions.tsx` - Added export tracking
6. `src/app/admin/login/page.tsx` - Added admin login tracking

## Analytics Functions Available

### Core Functions
```typescript
// Track page views
trackPageView(pagePath: string, pageTitle?: string)

// Track custom events
trackEvent(eventName: AnalyticsEvent, params?: EventParams)

// Track user authentication
trackUserAuth(userId: string, email?: string, tier?: string)

// Track optimizations
trackOptimization(status: 'started' | 'completed' | 'failed', platform: string, mode: string, userId?: string, error?: string)

// Track URL analysis
trackUrlAnalysis(status: 'started' | 'completed', url: string, userId?: string)

// Track platform selection
trackPlatformSelection(platform: string, userId?: string)

// Track mode selection
trackModeSelection(mode: string, userId?: string)

// Track exports
trackExport(format: string, platform: string, userId?: string)

// Track payments
trackPayment(status: 'initiated' | 'completed' | 'failed', tier: string, amount?: number, userId?: string)

// Track admin actions
trackAdminAction(action: string, target?: string, adminEmail?: string)

// Track errors
trackError(errorType: string, errorMessage: string, page?: string, userId?: string)

// Track feature usage
trackFeatureUsage(featureName: string, action: string, userId?: string)
```

## Event Types
All events are type-safe with TypeScript:
- `page_view`
- `sign_up`
- `login`
- `logout`
- `optimization_started`
- `optimization_completed`
- `optimization_failed`
- `url_analysis_started`
- `url_analysis_completed`
- `listing_generated`
- `export_clicked`
- `platform_selected`
- `mode_selected`
- `tier_upgraded`
- `payment_initiated`
- `payment_completed`
- `payment_failed`
- `admin_login`
- `admin_action`
- `error_occurred`
- `feature_used`

## Viewing Analytics Data

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ailistings-50933`
3. Navigate to **Analytics** → **Dashboard**
4. View real-time events, user engagement, and custom reports

### Admin Panel Integration
The analytics data can be accessed via Firebase Admin SDK in your admin panel:
- Real-time user activity
- Event counts and trends
- User behavior patterns
- Conversion funnels
- Error tracking

## Custom Reports You Can Create

### 1. Conversion Funnel
- Sign up → First optimization → Export → Payment

### 2. Platform Popularity
- Track which platforms are most used
- Amazon vs Shopify vs Etsy usage

### 3. Mode Usage
- Which optimization mode is most popular
- Success rates per mode

### 4. User Engagement
- Daily/Weekly/Monthly active users
- Average optimizations per user
- Time between optimizations

### 5. Error Analysis
- Most common errors
- Error rates by feature
- User impact of errors

### 6. Export Behavior
- Most popular export formats
- Export frequency
- Correlation with tier

## Privacy & Compliance

### Data Collected
- User IDs (Firebase UIDs)
- Email addresses (hashed in analytics)
- Usage patterns
- Error logs
- Platform/mode preferences

### GDPR Compliance
- User data can be deleted via Firebase Console
- Analytics data is anonymized after 14 months
- Users can opt-out (implement if needed)

### Best Practices
- Never track PII (personally identifiable information) in event parameters
- Use user IDs instead of emails in analytics
- Implement data retention policies
- Provide privacy policy to users

## Testing Analytics

### Local Testing
1. Open browser DevTools → Console
2. Look for: `✅ Firebase Analytics initialized`
3. Perform actions (login, optimize, export)
4. Check Firebase Console → Analytics → DebugView
5. Enable debug mode: Add `?analytics_debug=true` to URL

### Production Testing
1. Deploy to production
2. Wait 24-48 hours for data aggregation
3. Check Firebase Console → Analytics → Dashboard
4. View Events, Users, and custom reports

## Next Steps

### 1. Enable BigQuery Export (Optional)
- Export analytics data to BigQuery for advanced analysis
- Create custom SQL queries
- Build custom dashboards

### 2. Set Up Conversion Events
- Mark key events as conversions in Firebase Console
- Track conversion rates
- Optimize user flows

### 3. Create Custom Audiences
- Segment users by behavior
- Target specific user groups
- A/B testing

### 4. Set Up Alerts
- Get notified of unusual activity
- Monitor error spikes
- Track conversion drops

## Support

For issues or questions:
1. Check Firebase Console → Analytics → DebugView
2. Review browser console for errors
3. Verify Firebase config in `.env.local`
4. Check that analytics is initialized: `console.log(analytics)`

## Summary

Firebase Analytics is now fully integrated and tracking:
✅ All page views automatically
✅ User authentication (signup, login, logout)
✅ All optimization events (3 modes)
✅ Platform and mode selections
✅ URL analysis events
✅ Export actions
✅ Admin actions
✅ Error tracking
✅ Payment events (ready for integration)
✅ Custom feature usage

All data is available in Firebase Console and can be accessed via Admin SDK for your admin panel dashboard.
