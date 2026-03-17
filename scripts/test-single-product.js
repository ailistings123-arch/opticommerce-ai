/**
 * Single Product Test - Quick validation
 */

const testProduct = {
  platform: 'amazon',
  mode: 'create',
  productData: {
    title: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with silent click and Bluetooth connectivity',
    category: 'Electronics',
    price: 29.99,
    specifications: [
      { name: 'Connectivity', value: 'Bluetooth 5.0' },
      { name: 'DPI', value: '2400' },
      { name: 'Battery', value: 'Rechargeable' },
      { name: 'Color', value: 'Black' }
    ]
  }
};

async function testSingleProduct() {
  console.log('\n🧪 Testing Single Product\n');
  console.log('Product:', testProduct.productData.title);
  console.log('Platform:', testProduct.platform.toUpperCase());
  console.log('\n📡 Sending request...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ FAILED:', data.error);
      process.exit(1);
    }

    console.log('✅ SUCCESS!\n');
    console.log('═'.repeat(80));
    console.log('RESULTS');
    console.log('═'.repeat(80));
    
    console.log(`\n📌 TITLE (${data.data.title.length}/200 chars = ${Math.round((data.data.title.length/200)*100)}%):`);
    console.log(data.data.title);
    
    // Check for prohibited words
    const prohibitedWords = ['best', 'premium', 'professional', 'ultimate', 'perfect', 'amazing', 'quality', 'grade', 'pro'];
    const titleLower = data.data.title.toLowerCase();
    const foundProhibited = prohibitedWords.filter(w => titleLower.includes(w));
    
    if (foundProhibited.length > 0) {
      console.log('\n❌ PROHIBITED WORDS FOUND:', foundProhibited.join(', '));
    } else {
      console.log('\n✅ NO PROHIBITED WORDS');
    }
    
    // Check title utilization
    const utilization = (data.data.title.length / 200) * 100;
    if (utilization >= 90) {
      console.log(`✅ TITLE UTILIZATION: ${Math.round(utilization)}% (EXCELLENT)`);
    } else if (utilization >= 80) {
      console.log(`⚠️  TITLE UTILIZATION: ${Math.round(utilization)}% (GOOD, but should be 90%+)`);
    } else {
      console.log(`❌ TITLE UTILIZATION: ${Math.round(utilization)}% (TOO LOW - must be 90%+)`);
    }
    
    console.log(`\n📌 BULLETS (${data.data.bullets.length}):`);
    data.data.bullets.forEach((b, i) => {
      console.log(`${i+1}. ${b.substring(0, 100)}...`);
    });
    
    console.log(`\n📌 DESCRIPTION (${data.data.description.length} chars):`);
    console.log(data.data.description.substring(0, 300) + '...');
    
    console.log('\n📌 KEYWORDS:');
    console.log(data.data.keywords.join(', '));
    
    console.log('\n' + '═'.repeat(80));
    
    // Final verdict
    const hasProhibited = foundProhibited.length > 0;
    const goodUtilization = utilization >= 90;
    const goodLength = data.data.description.length >= 1000;
    
    if (!hasProhibited && goodUtilization && goodLength) {
      console.log('🎉 PERFECT! All checks passed!');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT:');
      if (hasProhibited) console.log('  - Remove prohibited words');
      if (!goodUtilization) console.log('  - Increase title utilization to 90%+');
      if (!goodLength) console.log('  - Increase description length to 1000+ chars');
    }
    
    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testSingleProduct();
