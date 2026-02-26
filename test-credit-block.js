// Test script to verify credit blocking works
const testEmail = 'jivefe3315@kaoing.com';
const testPassword = 'test123'; // You'll need the actual password

console.log('Testing credit blocking for user:', testEmail);
console.log('This user should have 5/5 credits used and be blocked from optimizing');
console.log('\nTo test:');
console.log('1. Login with email:', testEmail);
console.log('2. Try to optimize a product');
console.log('3. Should see "Usage limit exceeded" error');
console.log('4. Should see upgrade modal popup');
console.log('\nExpected behavior:');
console.log('✓ API returns 403 error with "Usage limit exceeded"');
console.log('✓ Frontend shows upgrade modal');
console.log('✓ Modal shows correct pricing: Starter $25, Professional $49, Enterprise $150');
console.log('✓ Clicking upgrade redirects to /dashboard/checkout?plan=<tier>');
