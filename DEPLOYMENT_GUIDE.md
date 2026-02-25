# Deployment Guide - Complete Setup

## Pre-Deployment Checklist

### ✅ 1. Environment Variables Ready
Make sure you have all these values:

**Firebase Client (Public)**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase Admin (Server-side)**
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

**Gemini AI**
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to gemini-2.0-flash)

**Other**
- `NEXT_PUBLIC_BASE_URL` (your production URL)

### ✅ 2. Firebase Setup
1. Firestore Database enabled
2. Authentication enabled (Email/Password)
3. Security rules configured
4. Service account key downloaded

### ✅ 3. Code Ready
- All optimizations applied ✅
- Auto-training system active ✅
- All 3 modes working ✅
- No TypeScript errors ✅

---

## Deployment Options

### Option 1: Vercel (Recommended) ⚡

You already have Vercel configured! Here's how to deploy:

#### Step 1: Build Locally (Test)
```bash
npm run build
```

If build succeeds, you're ready to deploy!

#### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy.

#### Step 3: Add Environment Variables in Vercel

Go to: https://vercel.com/your-team/opticommerce-ai/settings/environment-variables

Add all environment variables from `.env.local`:

**Important**: 
- For `FIREBASE_ADMIN_PRIVATE_KEY`, keep the quotes and newlines:
  ```
  "-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
  ```

#### Step 4: Redeploy
After adding env vars:
```bash
vercel --prod
```

---

### Option 2: Manual Deployment

#### Step 1: Build
```bash
npm run build
```

#### Step 2: Test Production Build
```bash
npm run start
```

Visit http://localhost:3000 and test all features.

#### Step 3: Deploy to Your Server
Upload the following:
- `.next/` folder
- `public/` folder
- `package.json`
- `package-lock.json`
- `next.config.ts`

Run on server:
```bash
npm install --production
npm run start
```

---

## Post-Deployment Checklist

### ✅ 1. Test All Features

**Authentication:**
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes work

**Mode 1 (Optimize Existing):**
- [ ] Form accepts input
- [ ] API responds
- [ ] Results display
- [ ] SEO score shows
- [ ] Before/after comparison works

**Mode 2 (Create New):**
- [ ] All sections work
- [ ] Image upload works (if enabled)
- [ ] API responds
- [ ] Complete listing generated
- [ ] Results display

**Mode 3 (Analyze URL):**
- [ ] URL validation works
- [ ] Scraping works (non-Etsy)
- [ ] Etsy shows proper error
- [ ] Results display
- [ ] Analysis shows

**Auto-Training:**
- [ ] High-scoring outputs saved to Firestore
- [ ] Check `trainingExamples` collection
- [ ] No errors in logs

### ✅ 2. Check Firestore

Go to Firebase Console → Firestore Database

**Collections should exist:**
- `users` - User accounts
- `optimizations` - Optimization history
- `urlAnalyses` - URL analysis history
- `trainingExamples` - Auto-training data (NEW!)

### ✅ 3. Monitor Logs

**Vercel:**
- Go to your project → Deployments → Latest → Functions
- Check for errors

**Look for:**
- `[Gemini] Response validated successfully` ✅
- `[AIService] High-scoring output saved to training pool` ✅
- No authentication errors ✅
- No Firestore errors ✅

### ✅ 4. Test Performance

**Expected Response Times:**
- Mode 1: 3-5 seconds
- Mode 2: 4-6 seconds
- Mode 3: 5-8 seconds

**Expected SEO Scores:**
- 90-100/100 for most outputs

### ✅ 5. Verify Auto-Training

After a few successful optimizations:

```typescript
// Check in Firestore Console
// Collection: trainingExamples
// Should see documents with:
{
  platform: "amazon",
  category: "electronics",
  seoScore: 94,
  createdAt: "2024-01-15T10:30:00Z",
  ...
}
```

---

## Environment Variables Setup (Vercel)

### Method 1: Vercel Dashboard

1. Go to: https://vercel.com/your-team/opticommerce-ai/settings/environment-variables

2. Add each variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your_key_here`
   - Environment: Production, Preview, Development

3. Click "Save"

### Method 2: Vercel CLI

```bash
# Set one variable
vercel env add GEMINI_API_KEY production

# Or import from .env.local
vercel env pull .env.production
```

---

## Troubleshooting

### Build Fails

**Error: TypeScript errors**
```bash
# Check for errors
npm run build

# Fix any TypeScript issues
# Then rebuild
```

**Error: Missing dependencies**
```bash
npm install
npm run build
```

### Deployment Succeeds but Site Doesn't Work

**Check 1: Environment Variables**
- Verify all env vars are set in Vercel
- Check for typos
- Ensure `FIREBASE_ADMIN_PRIVATE_KEY` has proper format

**Check 2: Firebase**
- Firestore enabled?
- Authentication enabled?
- Service account has permissions?

**Check 3: Gemini API**
- API key valid?
- API key has quota?
- Model name correct? (gemini-2.0-flash)

### API Routes Return 500

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click latest deployment
5. Click "Functions"
6. Check logs for errors

**Common Issues:**
- Missing environment variables
- Firebase Admin not initialized
- Gemini API key invalid
- Firestore permissions

### Auto-Training Not Working

**Check 1: Firestore Permissions**
- Service account has write access?
- Collection `trainingExamples` exists?

**Check 2: Logs**
```
Look for:
[AIService] High-scoring output (94%) saved to training pool
```

**Check 3: SEO Scores**
- Only saves if score >= 90
- Check if your outputs are scoring high enough

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Site is accessible
- [ ] All 3 modes work
- [ ] No errors in Vercel logs

### Weekly Checks
- [ ] Check Firestore usage
- [ ] Check Gemini API usage
- [ ] Review training examples count
- [ ] Check average SEO scores

### Monthly Checks
- [ ] Review training database growth
- [ ] Analyze most common categories
- [ ] Check for any duplicate examples
- [ ] Review user feedback

---

## Scaling Considerations

### Firestore Limits
- Free tier: 50K reads/day, 20K writes/day
- Paid tier: Unlimited (pay per use)

### Gemini API Limits
- Free tier: 15 requests/minute
- Paid tier: Higher limits

### Vercel Limits
- Hobby: 100GB bandwidth/month
- Pro: 1TB bandwidth/month

---

## Rollback Plan

If something goes wrong:

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Code
```bash
git log --oneline
git revert <commit-hash>
git push
```

---

## Success Metrics

After deployment, track:

✅ **Uptime**: Should be 99.9%+
✅ **Response Time**: 3-8 seconds
✅ **SEO Scores**: 90-100/100
✅ **Error Rate**: <1%
✅ **Training Examples**: Growing daily
✅ **User Satisfaction**: High-quality outputs

---

## Quick Deploy Commands

```bash
# Test build locally
npm run build

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## Support

If you encounter issues:

1. Check Vercel function logs
2. Check Firebase console
3. Check Gemini API status
4. Review error messages
5. Check environment variables

---

## Status

✅ **Code Ready**
✅ **Optimizations Applied**
✅ **Auto-Training Active**
✅ **All 3 Modes Working**
✅ **Documentation Complete**

**Ready to deploy!** 🚀
