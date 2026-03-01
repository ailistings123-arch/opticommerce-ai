# Admin Account Setup Instructions

## Overview
You now have a dedicated admin login at `/admin/login` that works independently from the main user signup flow. This allows you to access the admin panel from anywhere.

## Admin Emails
- **ailistings123@gmail.com**
- **mechannel805@gmail.com**

## Setup Steps

### Option 1: Create Accounts via Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

3. **Add First Admin User**
   - Click "Add user" button
   - Email: `ailistings123@gmail.com`
   - Password: Choose a strong password (save it securely!)
   - Click "Add user"

4. **Add Second Admin User**
   - Click "Add user" button again
   - Email: `mechannel805@gmail.com`
   - Password: Choose a strong password (save it securely!)
   - Click "Add user"

5. **Create User Documents in Firestore**
   - Go to "Firestore Database" in left sidebar
   - Navigate to `users` collection
   - Click "Add document"
   - Document ID: Use the UID from Authentication (copy from Users tab)
   - Add fields:
     ```
     email: "ailistings123@gmail.com"
     displayName: "Admin User"
     tier: "enterprise"
     usageCount: 0
     usageLimit: 999999
     createdAt: (current timestamp)
     ```
   - Repeat for second admin

### Option 2: Create Accounts via Admin Login Page

1. **First, manually create in Firebase Console** (see Option 1, steps 1-4)
2. **Then login via the app**:
   - Go to: `https://listingoptimizer.site/admin/login`
   - Enter email and password
   - System will auto-create Firestore document on first login

### Option 3: Use Firebase CLI (Advanced)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create admin users (requires custom script)
# See scripts/create-admin-users.js
```

## Access the Admin Panel

### Development
1. Go to: `http://localhost:3000/admin/login`
2. Enter admin email and password
3. Click "Sign In to Admin Panel"
4. You'll be redirected to `/admin`

### Production
1. Go to: `https://listingoptimizer.site/admin/login`
2. Enter admin email and password
3. Click "Sign In to Admin Panel"
4. You'll be redirected to `/admin`

## Password Requirements

For security, use strong passwords:
- Minimum 8 characters
- Mix of uppercase and lowercase
- Include numbers
- Include special characters
- Example: `Admin@2024!Secure`

## Security Best Practices

### 1. Strong Passwords
- Use unique passwords for each admin account
- Store passwords in a secure password manager
- Never share passwords via email or chat

### 2. Two-Factor Authentication (Recommended)
Enable 2FA in Firebase Console:
1. Go to Authentication > Sign-in method
2. Click "Advanced" section
3. Enable "Email enumeration protection"
4. Consider enabling 2FA for admin accounts

### 3. Access Logging
Monitor admin access:
- Check Firebase Authentication logs
- Review Vercel deployment logs
- Monitor unusual activity

### 4. Regular Password Changes
- Change passwords every 90 days
- Change immediately if compromised
- Use different passwords for each admin

## Troubleshooting

### "No account found with this email"
**Solution**: Create the account in Firebase Console first (see Option 1)

### "Incorrect password"
**Solution**: 
1. Reset password in Firebase Console
2. Or use "Forgot Password" (if implemented)
3. Check for typos

### "Access denied. This email is not authorized"
**Solution**: 
1. Verify email is exactly: `ailistings123@gmail.com` or `mechannel805@gmail.com`
2. Check for extra spaces or typos
3. Email is case-sensitive

### "Too many failed attempts"
**Solution**:
1. Wait 15-30 minutes
2. Try from different browser/device
3. Clear browser cache

### Can't access admin panel after login
**Solution**:
1. Check browser console for errors
2. Verify Firestore user document exists
3. Check that tier is set correctly
4. Try clearing cookies and logging in again

## Testing the Setup

### Test Checklist
- [ ] Admin accounts created in Firebase Authentication
- [ ] User documents created in Firestore
- [ ] Can login at `/admin/login`
- [ ] Redirected to `/admin` after login
- [ ] All admin features work
- [ ] Non-admin emails are blocked
- [ ] Wrong password shows error
- [ ] Can logout and login again

### Test Commands
```bash
# Start development server
npm run dev

# Open admin login
# http://localhost:3000/admin/login

# Try logging in with admin email
# Should redirect to /admin

# Try logging in with non-admin email
# Should show "Access denied" error
```

## Quick Reference

### Admin Login URL
- **Development**: `http://localhost:3000/admin/login`
- **Production**: `https://listingoptimizer.site/admin/login`

### Admin Panel URL
- **Development**: `http://localhost:3000/admin`
- **Production**: `https://listingoptimizer.site/admin`

### Admin Emails
```
ailistings123@gmail.com
mechannel805@gmail.com
```

### Firebase Console
- **URL**: https://console.firebase.google.com
- **Project**: Your project name
- **Authentication**: Left sidebar > Authentication
- **Firestore**: Left sidebar > Firestore Database

## Password Reset (If Needed)

### Via Firebase Console
1. Go to Authentication > Users
2. Find the admin user
3. Click "..." menu
4. Click "Reset password"
5. Firebase sends reset email
6. Follow link in email to set new password

### Via Code (Future Enhancement)
Can add "Forgot Password" link to admin login page that uses:
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';
await sendPasswordResetEmail(auth, email);
```

## Adding More Admins (Future)

To add more admin emails:

1. **Update ADMIN_EMAILS array** in these files:
   ```
   src/app/admin/page.tsx (line 18)
   src/app/admin/login/page.tsx (line 9)
   src/app/api/admin/stats/route.ts (line 4)
   src/app/api/admin/users/route.ts (line 4)
   src/app/api/admin/optimizations/route.ts (line 4)
   src/app/api/admin/revenue/route.ts (line 4)
   src/app/api/admin/update-user/route.ts (line 4)
   src/app/api/admin/reset-credits/route.ts (line 4)
   src/app/api/admin/email-users/route.ts (line 4)
   ```

2. **Create account in Firebase** (see Option 1)

3. **Deploy updated code** to Vercel

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit passwords** to Git
2. **Use environment variables** for sensitive data
3. **Enable Firebase security rules** to protect data
4. **Monitor access logs** regularly
5. **Use HTTPS only** (enforced in production)
6. **Keep Firebase SDK updated**
7. **Review Firebase security checklist** periodically

## Support

If you have issues setting up admin accounts:

1. Check Firebase Console for errors
2. Review browser console logs
3. Check Vercel deployment logs
4. Verify email spelling exactly matches
5. Ensure Firebase Authentication is enabled

---

**Next Steps**:
1. ✅ Create admin accounts in Firebase Console
2. ✅ Test login at `/admin/login`
3. ✅ Access admin panel
4. ✅ Save passwords securely
5. ✅ Deploy to production
