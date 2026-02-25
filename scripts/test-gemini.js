/**
 * Test Gemini AI Integration
 * Tests the Gemini API connection and listing generation
 */

const testProduct = {
  platform: 'amazon',
  mode: 'create',
  productData: {
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise cancelling headphones with 40 hour battery life',
    category: 'Electronics',
    price: 79.99,
    keywords: ['wireless', 'bluetooth', 'headphones', 'noise cancelling', 'premium'],
    specifications: [
      { name: 'Battery Life', value: '40', unit: 'hours' },
      { name: 'Bluetooth Version', value: '5.3' },
      { name: 'Weight', value: '250', unit: 'grams' },
      { name: 'Driver Size', value: '40', unit: 'mm' }
    ]
  }
};

async function testGemini() {
  console.log('🧪 Testing Gemini AI Integration\n');
  console.log('Product:', testProduct.productData.title);
  console.log('Platform:', testProduct.platform);
  console.log('Category:', testProduct.productData.category);
  console.log('\n📡 Sending request to API...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-listing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed:', data.error);
      if (data.details) console.error('Details:', data.details);
      process.exit(1);
    }

    console.log('✅ SUCCESS!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 QUALITY SCORE');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (data.data.qualityScore) {
      const qs = data.data.qualityScore;
      console.log(`Overall: ${qs.score}% (${qs.grade})`);
      console.log(`\nBreakdown:`);
      console.log(`  Title: ${qs.breakdown.title.score}/${qs.breakdown.title.maxScore}`);
      console.log(`  Bullets: ${qs.breakdown.bullets.score}/${qs.breakdown.bullets.maxScore}`);
      console.log(`  Description: ${qs.breakdown.description.score}/${qs.breakdown.description.maxScore}`);
      console.log(`  Compliance: ${qs.breakdown.compliance.score}/${qs.breakdown.compliance.maxScore}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📝 GENERATED LISTING');
    console.log('═══════════════════════════════════════════════════════════');
    
    console.log(`\nTitle (${data.data.title.length} chars):`);
    console.log(data.data.title);
    
    console.log('\nBullets:');
    data.data.bullets.forEach((bullet, i) => {
      console.log(`${i + 1}. ${bullet} (${bullet.length} chars)`);
    });
    
    console.log(`\nDescription (${data.data.description.length} chars):`);
    console.log(data.data.description);
    
    console.log('\nKeywords:');
    console.log(data.data.keywords.join(', '));
    
    console.log('\nPlatform Notes:');
    console.log(data.data.platform_notes);

    if (data.warnings && data.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      data.warnings.forEach(w => console.log(`  - ${w}`));
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Gemini integration working correctly!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testGemini();
