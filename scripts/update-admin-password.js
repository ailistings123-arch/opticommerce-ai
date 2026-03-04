/**
 * Update Admin Password Script
 * Run this to update the password for admin accounts
 * 
 * Usage: node scripts/update-admin-password.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Admin accounts with new password
const ADMIN_ACCOUNTS = [
  {
    email: 'ailistings123@gmail.com',
    password: 'pak@123$'
  },
  {
    email: 'mechannel805@gmail.com',
    password: 'pak@123$'
  }
];

async function updateAdminPasswords() {
  console.log('🔐 Updating admin passwords...\n');

  for (const account of ADMIN_ACCOUNTS) {
    try {
      console.log(`📧 Updating password for: ${account.email}`);

      // Get user by email
      const userRecord = await auth.getUserByEmail(account.email);
      
      // Update password
      await auth.updateUser(userRecord.uid, {
        password: account.password,
        emailVerified: true
      });

      console.log(`   ✅ Password updated successfully`);
      console.log(`   UID: ${userRecord.uid}`);
      console.log('');

    } catch (error) {
      console.error(`   ❌ Error updating ${account.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✅ Password update complete!\n');
  console.log('📝 You can now login with:');
  console.log('   Email: ailistings123@gmail.com OR mechannel805@gmail.com');
  console.log('   Password: pak@123$');
  console.log('   URL: https://listingoptimizer.site/admin/login\n');

  process.exit(0);
}

// Run the update
updateAdminPasswords().catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
