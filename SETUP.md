# OptiCommerce AI - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Firebase project created
- Google Gemini API key

## Step 1: Firebase Configuration

### 1.1 Client-Side Configuration (Already Done)
The client-side Firebase config is already in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 1.2 Firebase Admin SDK (Server-Side)

You need to add the Firebase Admin credentials to `.env.local`. Download your service account JSON file from Firebase Console.

Open that JSON file and extract these values:

1. **FIREBASE_ADMIN_PROJECT_ID**: Copy the `project_id` field
2. **FIREBASE_ADMIN_CLIENT_EMAIL**: Copy the `client_email` field
3. **FIREBASE_ADMIN_PRIVATE_KEY**: Copy the entire `private_key` field (including the BEGIN and END lines)

Update `.env.local` with these values:

```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT**: The private key must be wrapped in quotes and keep the `\n` characters as-is.

## Step 2: Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `.env.local`:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Step 3: Firebase Firestore Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Create a database in production mode
5. Set up the following collections (they will be created automatically when first used):
   - `users`
   - `optimizations`

### Firestore Security Rules

Go to **Firestore Database > Rules** and paste:

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

### Firestore Indexes

Create a composite index:
1. Go to **Firestore Database > Indexes**
2. Click **Create Index**
3. Collection: `optimizations`
4. Fields:
   - `userId` (Ascending)
   - `createdAt` (Descending)
5. Click **Create**

## Step 4: Firebase Authentication Setup

1. Go to **Authentication > Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** sign-in provider
4. Add your domain to authorized domains (for production)

## Step 5: Install Dependencies (Already Done)

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Step 6: Run Development Server

Once you've updated `.env.local` with the correct credentials:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 7: Build for Production

```bash
npm run build
npm start
```

## Step 8: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local` to Vercel's environment settings
5. Deploy

## Troubleshooting

### Build Error: "Failed to parse private key"
- Make sure the `FIREBASE_ADMIN_PRIVATE_KEY` is wrapped in quotes
- Ensure `\n` characters are preserved (don't replace them with actual newlines)
- The key should look like: `"-----BEGIN PRIVATE KEY-----\nMIIE....\n-----END PRIVATE KEY-----\n"`

### Authentication Not Working
- Check that Firebase Authentication is enabled in the console
- Verify the API key and auth domain are correct
- Check browser console for errors

### API Errors
- Verify Gemini API key is valid
- Check Firebase Admin credentials are correct
- Look at server logs for detailed error messages

## Quick Start Checklist

- [ ] Update `.env.local` with Firebase Admin credentials from the JSON file
- [ ] Add Gemini API key to `.env.local`
- [ ] Enable Firestore Database in Firebase Console
- [ ] Set up Firestore security rules
- [ ] Enable Email/Password and Google authentication
- [ ] Run `npm run dev` to start development server
- [ ] Test signup and login
- [ ] Test product optimization

## Next Steps

After setup is complete:
1. Create a test account
2. Try optimizing a product listing
3. Check the optimization history
4. Explore the settings page
5. Consider upgrading the tier limits in the code if needed
