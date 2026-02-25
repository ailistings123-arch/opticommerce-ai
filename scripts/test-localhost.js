/**
 * Simple Localhost Test
 * Quick test for localhost development
 */

const http = require('http');

console.log('🧪 Testing Localhost API\n');

/**
 * Make HTTP request to localhost
 */
function testEndpoint(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {},
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Test 1: Health Check
 */
async function testHealth() {
  console.log('1️⃣  Testing Health Check...');
  console.log('   GET http://localhost:3000/api/ai-health\n');

  try {
    const result = await testEndpoint('/api/ai-health');
    
    if (result.status === 200 && result.data.status === 'healthy') {
      console.log('   ✅ SUCCESS - AI service is healthy');
      console.log(`   Provider: ${result.data.provider}`);
      console.log(`   Message: ${result.data.message}\n`);
      return true;
    } else {
      console.log('   ❌ FAILED');
      console.log(`   Status: ${result.status}`);
      console.log(`   Response:`, result.data, '\n');
      return false;
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    console.log('   Make sure your dev server is running: npm run dev\n');
    return false;
  }
}

/**
 * Test 2: Generate Listing
 */
async function testGenerate() {
  console.log('2️⃣  Testing Generate Listing...');
  console.log('   POST http://localhost:3000/api/generate-listing\n');

  const testData = {
    platform: 'amazon',
    mode: 'create',
    productData: {
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium audio quality',
      keywords: ['wireless', 'bluetooth', 'headphones']
    }
  };

  try {
    const result = await testEndpoint('/api/generate-listing', testData);
    
    if (result.status === 200 && result.data.success) {
      console.log('   ✅ SUCCESS - Listing generated');
      console.log(`   Title: "${result.data.data.title.substring(0, 60)}..."`);
      console.log(`   Bullets: ${result.data.data.bullets.length}`);
      console.log(`   Description: ${result.data.data.description.length} chars`);
      console.log(`   Keywords: ${result.data.data.keywords.length}\n`);
      return true;
    } else {
      console.log('   ❌ FAILED');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error:`, result.data.error || 'Unknown error', '\n');
      return false;
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message, '\n');
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('═'.repeat(60));
  console.log('Starting Localhost Tests');
  console.log('═'.repeat(60), '\n');

  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('⚠️  Health check failed. Skipping other tests.\n');
    console.log('Troubleshooting:');
    console.log('1. Make sure dev server is running: npm run dev');
    console.log('2. Check GEMINI_API_KEY in .env.local');
    console.log('3. Verify port 3000 is not in use\n');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  const generateOk = await testGenerate();

  console.log('═'.repeat(60));
  console.log('Test Summary');
  console.log('═'.repeat(60));
  console.log(`Health Check:      ${healthOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Generate Listing:  ${generateOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('═'.repeat(60), '\n');

  if (healthOk && generateOk) {
    console.log('🎉 All tests passed! Your system is working.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
