# Firebase Setup Guide - Complete Instructions

## Where to Get Firebase Credentials

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Sign in with your Google account
3. Click "Create a project" (or select existing project)

### Step 2: Create a New Project
1. **Project name**: Enter "opticommerce-ai" (or any name)
2. **Google Analytics**: You can disable this for now
3. Click "Create project"
4. Wait for setup to complete, then click "Continue"

### Step 3: Get Client Configuration (Frontend)
1. In your Firebase project dashboard, click the **⚙️ Settings** icon
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click **"Web"** icon `</>`
5. **App nickname**: Enter "OptiCommerce Web"
6. Click **"Register app"**
7. Copy the config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 4: Get Admin Credentials (Backend)
1. Still in **Project Settings**, click **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the popup
4. A JSON file will download - **KEEP THIS SAFE!**

The downloaded JSON file contains:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40your-project.iam.gserviceaccount.com"
}
```

### Step 5: Enable Required Services
1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Go to **"Firestore Database"**
6. Click **"Create database"**
7. Choose **"Start in test mode"** for now
8. Select a location (choose closest to your users)

## How to Fill .env.local

### Client Configuration (from Step 3):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Admin Configuration (from Step 4 JSON file):
```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## Important Notes

### Private Key Formatting
The private key MUST include the quotes and newlines exactly as shown:
```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Security
- **NEVER** commit the service account JSON file to Git
- **NEVER** share your private key publicly
- The .env.local file is already in .gitignore

### Testing
After adding credentials:
1. Restart your development server: `npm run dev`
2. Go to http://localhost:3000
3. Try signing up for an account
4. Check if credits system works

## Alternative: Skip Firebase for Now

If you just want to test the AI optimization:
1. Keep the current .env.local as-is
2. The app will run in "demo mode"
3. You'll get 5 free credits that reset on restart
4. All optimization features work perfectly
5. Add Firebase later when you want user accounts

## Troubleshooting

### "Invalid private key" error:
- Make sure private key is wrapped in quotes
- Include all newlines (\n) exactly as in JSON
- Don't remove any characters from the key

### "Project not found" error:
- Double-check project_id matches exactly
- Make sure you're using the right Firebase project

### "Permission denied" error:
- Verify client_email is correct
- Make sure Firestore is enabled in Firebase Console

## Quick Start (Recommended)

For immediate testing, you can skip Firebase setup:
1. Just add your Gemini API key to .env.local
2. Leave Firebase vars as placeholders
3. App works perfectly in demo mode
4. Add Firebase later for production

The AI optimization works great without Firebase - you only need it for user accounts and persistent credits!