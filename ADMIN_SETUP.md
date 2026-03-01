# Admin Panel Setup Instructions

## Overview
The admin panel is a secure, professional dashboard that allows you to manage all users, view statistics, and control the entire Listing Optimizer platform.

## Features
- 📊 **Dashboard Overview**: Total users, optimizations, revenue metrics
- 👥 **User Management**: View all users, change tiers, reset credits
- 📝 **Optimization History**: See all optimizations across all users
- ⚙️ **Settings**: Admin configuration and data refresh

## Setup Instructions

### Step 1: Set Your Admin Email

You need to update the `ADMIN_EMAIL` constant in multiple files:

1. **src/app/admin/page.tsx** (Line 18)
   ```typescript
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this
   ```

2. **src/app/api/admin/stats/route.ts** (Line 4)
   ```typescript
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this
   ```

3. **src/app/api/admin/users/route.ts** (Line 4)
   ```typescript
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this
   ```

4. **src/app/api/admin/optimizations/route.ts** (Line 4)
   ```typescript
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this
   ```

5. **src/app/api/admin/update-user/route.ts** (Line 4)
   ```typescript
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this
   ```

6. **src/app/api/admin/reset-credits/route.ts** (Line 4)
   ```typescript
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this
   ```

### Step 2: Access the Admin Panel

1. Make sure you're logged in with your admin email
2. Navigate to: `https://listingoptimizer.site/admin`
3. If you're not the admin, you'll be redirected to the dashboard

## Security Features

✅ **Email-based authentication**: Only your specified email can access the admin panel
✅ **Token verification**: All API requests verify Firebase authentication tokens
✅ **Hidden from users**: Regular users cannot see or access the admin panel
✅ **No public routes**: Admin routes are protected at the API level

## Admin Panel Sections

### 1. Overview
- Total users count
- Total optimizations count
- Paid users count
- Active users today
- Recent activity feed

### 2. Users
- View all registered users
- See user tier, usage, and creation date
- Change user tier (Free, Starter, Professional, Enterprise)
- Reset user credits
- Sort and filter users

### 3. Optimizations
- View all optimizations across all users
- See platform, mode, and creation date
- Filter by user or platform
- Export data (coming soon)

### 4. Settings
- View admin email
- Refresh data
- System configuration

## User Tier Management

You can change any user's tier from the admin panel:

- **Free**: 5 credits total
- **Starter**: 25 credits/month ($25)
- **Professional**: 50 credits/month ($49)
- **Enterprise**: Unlimited credits ($150)

## Credit Reset

Use the "Reset Credits" button to set a user's usage count back to 0. This is useful for:
- Testing
- Customer support
- Refunds
- Special promotions

## Important Notes

⚠️ **Keep your admin email secret** - Anyone with access to this email can manage the entire platform

⚠️ **Backup before bulk changes** - Always backup your Firebase data before making bulk user changes

⚠️ **Test in development first** - Test admin features in development before using in production

## Troubleshooting

### "Forbidden - Admin access only"
- Make sure you're logged in with the correct admin email
- Check that ADMIN_EMAIL is set correctly in all files
- Clear your browser cache and try again

### "Database not configured"
- Verify Firebase Admin SDK is properly initialized
- Check your firebase-service-account.json file
- Ensure Firestore is enabled in your Firebase project

### Data not loading
- Check browser console for errors
- Verify Firebase security rules allow admin access
- Click "Refresh Data" button in Settings tab

## Future Enhancements

- 📊 Advanced analytics and charts
- 📧 Email users directly from admin panel
- 💰 Revenue tracking and reports
- 📥 Export data to CSV/Excel
- 🔍 Advanced search and filtering
- 📱 Mobile-responsive admin panel
- 🔔 Real-time notifications
- 📈 Usage trends and predictions

## Support

If you need help with the admin panel, check:
1. Browser console for error messages
2. Firebase console for database issues
3. Vercel logs for API errors
