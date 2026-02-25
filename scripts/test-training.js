/**
 * Test Training Integration
 * Tests Gemini with full training context
 */

const testProduct = {
  platform: 'amazon',
  mode: 'create',
  productData: {
    title: 'Wireless Headphones',
    description: 'Bluetooth headphones with noise cancelling',
    category: 'Electronics',
    price: 49.99,
    keywords: ['wireless', 'bluetooth', 'headphones', 'noise cancelling'],
    specifications: [
      { name: 'Battery Life', value: '40', unit: 'hours' },
      { name: 'Bluetooth Version', value: '5.0' },
      { name: 'Weight', value: '250', unit: 'grams' }
    ]
  }
};

async function testTraining() {
  console.log('🧪 Testing Gemini Training Integration\n');
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
      console.log(`    - Character Utilization: ${Math.round(qs.breakdown.title.characterUtilization)}%`);
      console.log(`    - Keyword Placement: ${qs.breakdown.title.keywordPlacement ? '✓' : '✗'}`);
      console.log(`    - Readability: ${qs.breakdown.title.readability ? '✓' : '✗'}`);
      
      console.log(`  Bullets: ${qs.breakdown.bullets.score}/${qs.breakdown.bullets.maxScore}`);
      console.log(`    - Benefit-First: ${Math.round(qs.breakdown.bullets.benefitFirst * 100)}%`);
      console.log(`    - Specificity: ${Math.round(qs.breakdown.bullets.specificity * 100)}%`);
      console.log(`    - Optimal Length: ${Math.round(qs.breakdown.bullets.optimalLength * 100)}%`);
      
      console.log(`  Description: ${qs.breakdown.description.score}/${qs.breakdown.description.maxScore}`);
      console.log(`    - Meets Min Length: ${qs.breakdown.description.meetsMinLength ? '✓' : '✗'}`);
      console.log(`    - Has Structure: ${qs.breakdown.description.hasStructure ? '✓' : '✗'}`);
      console.log(`    - SEO Optimized: ${qs.breakdown.description.seoOptimized ? '✓' : '✗'}`);
      
      console.log(`  Compliance: ${qs.breakdown.compliance.score}/${qs.breakdown.compliance.maxScore}`);
      console.log(`    - No Prohibited Words: ${qs.breakdown.compliance.noProhibitedWords ? '✓' : '✗'}`);
      console.log(`    - Follows Platform Rules: ${qs.breakdown.compliance.followsPlatformRules ? '✓' : '✗'}`);
      
      if (qs.breakdown.compliance.violations.length > 0) {
        console.log(`    - Violations: ${qs.breakdown.compliance.violations.join(', ')}`);
      }
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
    console.log('✅ Training integration working correctly!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTraining();
