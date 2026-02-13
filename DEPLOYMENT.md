# Deployment Guide

## Production URL
https://opticommerce-ai.vercel.app

## Quick Deploy

```bash
# Build and test locally
npm run build
npm start

# Deploy to Vercel
vercel deploy --prod
```

## Environment Variables (Vercel)

Set these in your Vercel project settings:

### Firebase Client (Public)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin (Secret)
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

### Google Gemini (Secret)
- `GEMINI_API_KEY`

## Firebase Configuration

### 1. Authentication
- Enable Email/Password authentication
- Add authorized domains:
  - `opticommerce-ai.vercel.app`
  - `*.vercel.app` (for preview deployments)

### 2. Firestore Database
- Create database in production mode
- Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /optimizations/{optimizationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Firestore Indexes
Create composite indexes for:
- Collection: `optimizations`
  - Fields: `userId` (Ascending), `createdAt` (Descending)

## Google Gemini API

1. Get API key: https://aistudio.google.com/app/apikey
2. Add HTTP referrers (if restricted):
   - `https://opticommerce-ai.vercel.app/*`
   - `https://*.vercel.app/*`

## Vercel Settings

### Build Settings
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Environment Variables
Add all variables listed above in Vercel dashboard

### Domains
- Production: `opticommerce-ai.vercel.app`
- Custom domain: (optional) Configure in Vercel

## Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Firebase authorized domains updated
- [ ] Firestore security rules deployed
- [ ] Test user signup/login
- [ ] Test product optimization (all 5 platforms)
- [ ] Verify credit system working
- [ ] Check upgrade modal appears at 5 credits
- [ ] Test on mobile devices
- [ ] Verify all API endpoints responding

## Monitoring

### Vercel Analytics
- Enable in Vercel dashboard for traffic insights

### Firebase Console
- Monitor authentication usage
- Check Firestore read/write operations
- Review error logs

### Error Tracking
Check Vercel deployment logs for errors:
```bash
vercel logs [deployment-url]
```

## Rollback

If issues occur, rollback to previous deployment:
```bash
vercel rollback [deployment-url]
```

Or use Vercel dashboard to promote a previous deployment.

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test Firebase connection
4. Check Gemini API quota

---

Last Updated: February 2026
