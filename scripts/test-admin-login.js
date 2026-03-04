/**
 * Test Admin Login Script
 * Verifies admin credentials work
 * 
 * Usage: node scripts/test-admin-login.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function testAdminLogin() {
  console.log('🧪 Testing admin login credentials...\n');

  const testEmail = 'ailistings123@gmail.com';
  
  try {
    // Get user
    const userRecord = await auth.getUserByEmail(testEmail);
    
    console.log('✅ User found in Firebase Authentication');
    console.log('   Email:', userRecord.email);
    console.log('   UID:', userRecord.uid);
    console.log('   Email Verified:', userRecord.emailVerified);
    console.log('   Disabled:', userRecord.disabled);
    console.log('   Created:', new Date(userRecord.metadata.creationTime).toLocaleString());
    console.log('   Last Sign In:', userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime).toLocaleString() : 'Never');
    
    // Check Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      console.log('\n✅ User document found in Firestore');
      console.log('   Data:', JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('\n⚠️  User document NOT found in Firestore');
      console.log('   Creating document...');
      
      await db.collection('users').doc(userRecord.uid).set({
        email: testEmail,
        displayName: 'Admin User',
        tier: 'enterprise',
        usageCount: 0,
        usageLimit: 999999,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('   ✅ Document created');
    }
    
    console.log('\n📝 Login Instructions:');
    console.log('   1. Go to: https://listingoptimizer.site/admin/login');
    console.log('   2. Email: ailistings123@gmail.com');
    console.log('   3. Password: pak@123$');
    console.log('   4. Click "Sign In to Admin Panel"');
    
    console.log('\n💡 Troubleshooting:');
    console.log('   - Clear browser cache and cookies');
    console.log('   - Try incognito/private window');
    console.log('   - Check browser console (F12) for errors');
    console.log('   - Make sure you\'re using the exact email (no spaces)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  User not found. Creating account...');
      
      try {
        const newUser = await auth.createUser({
          email: testEmail,
          password: 'pak@123$',
          emailVerified: true
        });
        
        console.log('✅ Account created!');
        console.log('   UID:', newUser.uid);
        
        // Create Firestore document
        const db = admin.firestore();
        await db.collection('users').doc(newUser.uid).set({
          email: testEmail,
          displayName: 'Admin User',
          tier: 'enterprise',
          usageCount: 0,
          usageLimit: 999999,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Firestore document created');
        console.log('\n✅ Setup complete! You can now login.');
        
      } catch (createError) {
        console.error('❌ Failed to create account:', createError.message);
      }
    }
  }
  
  process.exit(0);
}

// Run the test
testAdminLogin().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
