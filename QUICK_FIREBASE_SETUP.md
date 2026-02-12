# Quick Firebase Setup Guide

## ⚠️ Error: "Failed to get document because the client is offline"

This error means Firestore database hasn't been enabled in your Firebase Console yet.

## ✅ Quick Fix (5 minutes)

### Step 1: Enable Firestore Database

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select your project and navigate to Firestore
   - Or click the link in the yellow banner on your dashboard

2. **Create Database:**
   - Click "Create Database" button
   - Select "Start in production mode"
   - Choose your location (e.g., us-central)
   - Click "Enable"
   - Wait 1-2 minutes for setup to complete

### Step 2: Apply Security Rules

1. **Go to Rules tab:**
   - In Firestore, click the "Rules" tab

2. **Paste these rules:**
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

3. **Click "Publish"**

### Step 3: Create Index

1. **Go to Indexes tab:**
   - Click the "Indexes" tab in Firestore

2. **Create Composite Index:**
   - Click "Create Index"
   - Collection ID: `optimizations`
   - Fields to index:
     - Field: `userId`, Order: Ascending
     - Field: `createdAt`, Order: Descending
   - Query scope: Collection
   - Click "Create"
   - Wait for index to build (1-2 minutes)

### Step 4: Enable Authentication

1. **Go to Authentication:**
   - https://console.firebase.google.com/ (select your project, then Authentication)

2. **Enable Sign-in Methods:**
   - Click "Get Started" (if first time)
   - Click "Sign-in method" tab
   - Enable "Email/Password"
   - Enable "Google" (add support email)

## ✅ Done!

After completing these steps:
1. Refresh your application
2. The yellow warning banner will disappear
3. All features will work properly
4. User data will be saved to Firestore

## 🔍 Verify Setup

Test that everything works:
1. Sign up with a new account
2. Try optimizing a product
3. Check that usage count updates
4. View optimization history

## 📝 What Changed

I've updated the code to:
- ✅ Handle Firestore offline errors gracefully
- ✅ Show helpful setup notice when Firestore isn't configured
- ✅ Provide default user data if Firestore is unavailable
- ✅ Allow authentication to work even without Firestore
- ✅ Display clear instructions with direct links

## 🆘 Still Having Issues?

If you still see errors after setup:

1. **Check Firebase Console:**
   - Verify Firestore is enabled (green checkmark)
   - Verify Authentication is enabled
   - Check that rules are published

2. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

3. **Check Console Logs:**
   - Open browser DevTools (F12)
   - Look for specific error messages
   - Share them if you need help

4. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## 📚 Full Documentation

For detailed setup instructions, see:
- `FIREBASE_SETUP_CHECKLIST.md` - Complete step-by-step guide
- `SETUP.md` - Full setup documentation
- `README.md` - Project overview

## 🎯 Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- Navigate to your project to access Firestore, Authentication, and Settings
