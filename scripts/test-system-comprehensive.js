/**
 * Comprehensive System Test
 * Tests the complete AI training system with all components
 */

const testProducts = [
  {
    name: 'Beauty Product (Collagen Cream)',
    platform: 'amazon',
    productData: {
      title: 'Collagen Niacinamide Jelly Cream',
      description: 'Moisturizing face cream with collagen and niacinamide',
      category: 'Beauty & Personal Care',
      keywords: ['face cream', 'moisturizer', 'collagen', 'niacinamide']
    },
    mode: 'create',
    expectedChecks: {
      titleMinLength: 180,
      titleMaxLength: 200,
      shouldContain: ['Collagen', 'Niacinamide'],
      shouldNotContain: ['Premium', 'Professional', 'Best', 'Solve Your Problem', 'Best Value', 'Best For'],
      minBullets: 5,
      minDescriptionLength: 1000
    }
  },
  {
    name: 'Electronics (Wireless Mouse)',
    platform: 'amazon',
    productData: {
      title: 'Wireless Mouse',
      description: 'Bluetooth mouse with silent click and rechargeable battery',
      category: 'Electronics',
      keywords: ['wireless mouse', 'bluetooth', 'silent click']
    },
    mode: 'create',
    expectedChecks: {
      titleMinLength: 180,
      titleMaxLength: 200,
      shouldContain: ['Wireless', 'Bluetooth', 'Mouse'],
      shouldNotContain: ['Premium', 'Professional', 'Best', 'Ultimate', 'Quality'],
      minBullets: 5,
      minDescriptionLength: 1000
    }
  },
  {
    name: 'Etsy Digital Product',
    platform: 'etsy',
    productData: {
      title: 'Wedding Invitation Template',
      description: 'Printable PDF wedding invitation, instant download',
      category: 'Digital',
      keywords: ['wedding invitation', 'printable', 'instant download']
    },
    mode: 'create',
    expectedChecks: {
      titleMinLength: 126,
      titleMaxLength: 140,
      shouldContain: ['Instant Download', 'PDF'],
      shouldNotContain: ['Premium', 'Best', 'Professional'],
      minBullets: 5,
      minDescriptionLength: 400
    }
  }
];

async function testSystem() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE SYSTEM TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  for (const test of testProducts) {
    console.log(`\n📦 Testing: ${test.name}`);
    console.log(`Platform: ${test.platform.toUpperCase()}`);
    console.log('─────────────────────────────────────────────────────────────\n');

    try {
      const response = await fetch('http://localhost:3000/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: test.platform,
          productData: test.productData,
          mode: test.mode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      const listing = data.data;
      const checks = test.expectedChecks;
      let testPassed = true;
      const issues = [];

      // Check title length
      const titleLength = listing.title.length;
      const titleUtilization = (titleLength / checks.titleMaxLength) * 100;
      
      console.log(`✓ Title: "${listing.title}"`);
      console.log(`  Length: ${titleLength}/${checks.titleMaxLength} chars (${Math.round(titleUtilization)}% utilization)`);
      
      if (titleLength < checks.titleMinLength) {
        issues.push(`Title too short: ${titleLength} < ${checks.titleMinLength}`);
        testPassed = false;
      }
      
      if (titleLength > checks.titleMaxLength) {
        issues.push(`Title too long: ${titleLength} > ${checks.titleMaxLength}`);
        testPassed = false;
      }

      // Check required content
      for (const term of checks.shouldContain) {
        if (!listing.title.includes(term)) {
          issues.push(`Title missing required term: "${term}"`);
          testPassed = false;
        }
      }

      // Check prohibited words
      const prohibitedFound = [];
      for (const word of checks.shouldNotContain) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(listing.title) || regex.test(listing.description) || listing.bullets.some(b => regex.test(b))) {
          prohibitedFound.push(word);
          testPassed = false;
        }
      }

      if (prohibitedFound.length > 0) {
        issues.push(`Prohibited words found: ${prohibitedFound.join(', ')}`);
        console.log(`  ❌ PROHIBITED WORDS: ${prohibitedFound.join(', ')}`);
      } else {
        console.log(`  ✓ No prohibited words found`);
      }

      // Check bullets
      console.log(`\n✓ Bullets (${listing.bullets.length}):`);
      listing.bullets.forEach((bullet, i) => {
        console.log(`  ${i + 1}. ${bullet.substring(0, 80)}...`);
      });

      if (listing.bullets.length < checks.minBullets) {
        issues.push(`Not enough bullets: ${listing.bullets.length} < ${checks.minBullets}`);
        testPassed = false;
      }

      // Check description
      const descLength = listing.description.length;
      console.log(`\n✓ Description: ${descLength} characters`);
      console.log(`  ${listing.description.substring(0, 150)}...`);

      if (descLength < checks.minDescriptionLength) {
        issues.push(`Description too short: ${descLength} < ${checks.minDescriptionLength}`);
        testPassed = false;
      }

      // Check keywords
      console.log(`\n✓ Keywords (${listing.keywords.length}):`);
      console.log(`  ${listing.keywords.join(', ')}`);

      // Check for meta keywords
      const metaKeywords = ['productdescription', 'features', 'description', 'quality', 'premium'];
      const badKeywords = listing.keywords.filter(k => metaKeywords.includes(k.toLowerCase()));
      if (badKeywords.length > 0) {
        issues.push(`Meta keywords found: ${badKeywords.join(', ')}`);
        testPassed = false;
      }

      // Quality score
      if (data.data.qualityScore) {
        console.log(`\n✓ Quality Score: ${data.data.qualityScore.score}% (${data.data.qualityScore.grade})`);
      }

      // Summary
      console.log('\n─────────────────────────────────────────────────────────────');
      if (testPassed) {
        console.log('✅ TEST PASSED');
        results.passed++;
      } else {
        console.log('❌ TEST FAILED');
        console.log('\nIssues:');
        issues.forEach(issue => console.log(`  • ${issue}`));
        results.failed++;
      }

      results.details.push({
        name: test.name,
        passed: testPassed,
        issues: issues,
        titleLength: titleLength,
        titleUtilization: Math.round(titleUtilization),
        prohibitedWords: prohibitedFound,
        qualityScore: data.data.qualityScore?.score
      });

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      results.failed++;
      results.details.push({
        name: test.name,
        passed: false,
        error: error.message
      });
    }
  }

  // Final summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('📊 FINAL RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Total Tests: ${testProducts.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / testProducts.length) * 100)}%`);

  console.log('\n\nDetailed Results:');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  results.details.forEach(detail => {
    console.log(`${detail.passed ? '✅' : '❌'} ${detail.name}`);
    if (detail.error) {
      console.log(`   Error: ${detail.error}`);
    } else {
      console.log(`   Title Utilization: ${detail.titleUtilization}%`);
      console.log(`   Prohibited Words: ${detail.prohibitedWords.length === 0 ? 'None ✓' : detail.prohibitedWords.join(', ')}`);
      if (detail.qualityScore) {
        console.log(`   Quality Score: ${detail.qualityScore}%`);
      }
      if (detail.issues.length > 0) {
        console.log(`   Issues: ${detail.issues.length}`);
        detail.issues.forEach(issue => console.log(`     • ${issue}`));
      }
    }
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════════\n');

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! System is working correctly.\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the issues above.\n');
  }
}

// Run tests
testSystem().catch(console.error);
