# Firebase Setup Checklist

Complete these steps to make OptiCommerce AI fully functional.

## ✅ Step-by-Step Firebase Console Setup

### 1. Enable Firestore Database

1. Go to: https://console.firebase.google.com/
2. Select your project and navigate to Firestore
3. Click **"Create Database"**
3. Select **"Start in production mode"**
4. Choose your preferred location (e.g., us-central)
5. Click **"Enable"**

### 2. Apply Firestore Security Rules

1. In Firestore, click the **"Rules"** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /optimizations/{optimizationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

### 3. Create Firestore Composite Index

1. In Firestore, click the **"Indexes"** tab
2. Click **"Create Index"**
3. Configure:
   - **Collection ID**: `optimizations`
   - **Fields to index**:
     - Field: `userId`, Order: Ascending
     - Field: `createdAt`, Order: Descending
   - **Query scope**: Collection
4. Click **"Create"**
5. Wait for index to build (usually 1-2 minutes)

### 4. Enable Authentication Methods

1. Go to: https://console.firebase.google.com/
2. Select your project and navigate to Authentication
3. Click **"Get Started"** (if first time)
3. Click **"Sign-in method"** tab

#### Enable Email/Password:
1. Click **"Email/Password"**
2. Toggle **"Enable"**
3. Click **"Save"**

#### Enable Google Sign-In:
1. Click **"Google"**
2. Toggle **"Enable"**
3. Enter project support email
4. Click **"Save"**

### 5. Verify Configuration

Run these checks:

- [ ] Firestore Database is enabled
- [ ] Security rules are published
- [ ] Composite index is created and active
- [ ] Email/Password authentication is enabled
- [ ] Google authentication is enabled

## 🧪 Test the Application

### Test 1: Sign Up
1. Go to http://localhost:3000
2. Click **"Get Started"** or **"Sign Up"**
3. Create account with email/password
4. Verify you're redirected to dashboard

### Test 2: Optimize a Product
1. Select a platform (e.g., Amazon)
2. Enter a product title: "Wireless Bluetooth Headphones"
3. Enter a description: "High quality headphones with noise cancellation"
4. Click **"Optimize Product"**
5. Verify you see:
   - SEO score
   - Optimized title
   - Optimized description
   - Tags
   - Improvements list

### Test 3: Check Usage Stats
1. Verify usage counter shows "1/3 used" (Free tier)
2. Try optimizing 2 more products
3. Verify you see quota exceeded message on 4th attempt

### Test 4: View History
1. Click **"History"** in navigation
2. Verify you see your past optimizations
3. Check that platform, title, score, and date are displayed

### Test 5: Google Sign-In
1. Sign out
2. Go to login page
3. Click **"Sign in with Google"**
4. Verify Google OAuth flow works

## 🐛 Troubleshooting

### Issue: "Failed to parse private key"
**Solution**: The private key in `.env.local` is already correctly formatted. This should not occur.

### Issue: "Permission denied" in Firestore
**Solution**: 
1. Verify security rules are published
2. Check that user is authenticated
3. Ensure the user document exists in Firestore

### Issue: "Index not found"
**Solution**:
1. Go to Firestore > Indexes
2. Wait for index to finish building (shows green checkmark)
3. If failed, delete and recreate the index

### Issue: "Quota exceeded" immediately
**Solution**:
1. Check user document in Firestore
2. Verify `usageCount` and `usageLimit` fields
3. Reset `usageCount` to 0 if needed

### Issue: Gemini API error
**Solution**:
1. Verify `GEMINI_API_KEY` in `.env.local` is valid
2. Check API quota at https://makersuite.google.com/
3. Ensure API key has Gemini API enabled

## 📊 Expected Firestore Structure

After testing, your Firestore should have:

### Collection: `users`
```
users/
  └── {userId}/
      ├── email: "user@example.com"
      ├── displayName: "John Doe"
      ├── tier: "free"
      ├── usageCount: 1
      ├── usageLimit: 3
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

### Collection: `optimizations`
```
optimizations/
  └── {optimizationId}/
      ├── userId: "{userId}"
      ├── platform: "amazon"
      ├── original: { title, description }
      ├── optimized: { title, description, tags, seoScore, improvements }
      └── createdAt: Timestamp
```

## ✅ Setup Complete!

Once all steps are done and tests pass, your application is fully functional and ready for:
- Development
- User testing
- Production deployment

## 🚀 Next Steps

1. **Customize Branding**: Update colors, logo, and copy
2. **Add Payment Integration**: Implement Stripe for paid tiers
3. **Deploy to Vercel**: Push to GitHub and deploy
4. **Monitor Usage**: Set up Firebase Analytics
5. **Add Features**: Bulk upload, API access, etc.

---

**Need Help?** Check `SETUP.md` for detailed instructions or `PROJECT_SUMMARY.md` for an overview.
