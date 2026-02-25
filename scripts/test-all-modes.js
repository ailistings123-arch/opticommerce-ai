/**
 * Test All Optimization Modes
 * Tests: Create, Optimize, and Analyze URL modes
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

console.log('🧪 Testing All Listing Optimizer Modes\n');
console.log('=' .repeat(60));

// Test data
const testData = {
  mode1_create: {
    platform: 'amazon',
    mode: 'create',
    productData: {
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium audio quality with noise cancellation',
      category: 'Electronics',
      price: 79.99,
      keywords: ['wireless', 'bluetooth', 'headphones', 'noise cancelling'],
      specifications: [
        { name: 'Battery Life', value: '30', unit: 'hours' },
        { name: 'Weight', value: '250', unit: 'g' },
        { name: 'Bluetooth', value: '5.3' }
      ]
    },
    deepAnalysis: true
  },
  
  mode2_optimize: {
    platform: 'amazon',
    mode: 'optimize',
    productData: {
      title: 'Bluetooth Earbuds',
      description: 'Good sound quality wireless earbuds for music',
      keywords: ['bluetooth', 'earbuds']
    },
    deepAnalysis: true
  },
  
  mode3_analyze_url: {
    url: 'https://www.amazon.com/dp/B08N5WRWNW',
    targetPlatform: 'ebay',
    analyzeImages: true
  }
};

/**
 * Make HTTP request
 */
function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 120000 // 2 minutes
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

    req.write(postData);
    req.end();
  });
}

/**
 * Test Mode 1: Create New Listing
 */
async function testMode1() {
  console.log('\n📝 MODE 1: CREATE NEW LISTING');
  console.log('-'.repeat(60));
  console.log('Testing: Generate new listing from product data');
  console.log('Platform: Amazon');
  console.log('Deep Analysis: Enabled\n');

  try {
    const result = await makeRequest('/api/generate-listing', testData.mode1_create);
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('Generated Title:');
      console.log(`  "${result.data.data.title}"\n`);
      console.log(`Bullet Points: ${result.data.data.bullets.length}`);
      console.log(`Description Length: ${result.data.data.description.length} chars`);
      console.log(`Keywords: ${result.data.data.keywords.join(', ')}`);
      console.log(`Platform Notes: ${result.data.data.platform_notes}`);
      return true;
    } else {
      console.log('❌ FAILED');
      console.log('Status:', result.status);
      console.log('Error:', result.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

/**
 * Test Mode 2: Optimize Existing Listing
 */
async function testMode2() {
  console.log('\n🔧 MODE 2: OPTIMIZE EXISTING LISTING');
  console.log('-'.repeat(60));
  console.log('Testing: Improve existing product listing');
  console.log('Platform: Amazon');
  console.log('Deep Analysis: Enabled\n');

  try {
    const result = await makeRequest('/api/generate-listing', testData.mode2_optimize);
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('Original Title:');
      console.log(`  "${testData.mode2_optimize.productData.title}"\n`);
      console.log('Optimized Title:');
      console.log(`  "${result.data.data.title}"\n`);
      console.log(`Improvement: ${result.data.data.title.length - testData.mode2_optimize.productData.title.length} chars added`);
      console.log(`Bullet Points Generated: ${result.data.data.bullets.length}`);
      console.log(`Keywords Extracted: ${result.data.data.keywords.length}`);
      return true;
    } else {
      console.log('❌ FAILED');
      console.log('Status:', result.status);
      console.log('Error:', result.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

/**
 * Test Mode 3: Analyze URL
 */
async function testMode3() {
  console.log('\n🔍 MODE 3: ANALYZE URL & GENERATE LISTING');
  console.log('-'.repeat(60));
  console.log('Testing: Deep URL analysis with image processing');
  console.log('Source: Amazon');
  console.log('Target Platform: eBay');
  console.log('Image Analysis: Enabled\n');

  try {
    const result = await makeRequest('/api/analyze-url-deep', testData.mode3_analyze_url);
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ SUCCESS!\n');
      
      console.log('📊 EXTRACTED DATA:');
      console.log(`  Original Title: "${result.data.data.original.title}"`);
      console.log(`  Price: $${result.data.data.original.price}`);
      console.log(`  Images Found: ${result.data.data.original.images?.length || 0}`);
      console.log(`  Specifications: ${result.data.data.original.specifications?.length || 0}`);
      
      if (result.data.data.imageAnalysis) {
        console.log('\n🖼️  IMAGE ANALYSIS:');
        console.log(`  Features: ${result.data.data.imageAnalysis.mainFeatures.join(', ')}`);
        console.log(`  Colors: ${result.data.data.imageAnalysis.colors.join(', ')}`);
        console.log(`  Style: ${result.data.data.imageAnalysis.style}`);
      }
      
      console.log('\n✨ OPTIMIZED LISTING:');
      console.log(`  New Title: "${result.data.data.optimized.title}"`);
      console.log(`  Bullet Points: ${result.data.data.optimized.bullets.length}`);
      console.log(`  Description: ${result.data.data.optimized.description.length} chars`);
      console.log(`  Keywords: ${result.data.data.optimized.keywords.join(', ')}`);
      
      return true;
    } else {
      console.log('❌ FAILED');
      console.log('Status:', result.status);
      console.log('Error:', result.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 Starting comprehensive mode testing...\n');
  
  const results = {
    mode1: false,
    mode2: false,
    mode3: false
  };

  // Test Mode 1
  results.mode1 = await testMode1();
  await sleep(2000); // Wait between tests

  // Test Mode 2
  results.mode2 = await testMode2();
  await sleep(2000);

  // Test Mode 3
  results.mode3 = await testMode3();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Mode 1 (Create):       ${results.mode1 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Mode 2 (Optimize):     ${results.mode2 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Mode 3 (Analyze URL):  ${results.mode3 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(60));

  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    console.log('\n🎉 All modes working perfectly!\n');
  } else {
    console.log('\n⚠️  Some modes need attention.\n');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
