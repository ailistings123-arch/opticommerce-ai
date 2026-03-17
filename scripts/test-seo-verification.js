/**
 * Test Backend SEO Verification
 * Tests that the system consistently delivers 80+ SEO scores
 */

const testCases = [
  {
    name: 'Beauty Product - Collagen Cream',
    url: 'https://collaglow.store/products/collagen-niacinamide-jelly-cream-copy',
    platform: 'shopify',
    expectedMinScore: 80
  },
  {
    name: 'Amazon Product Test',
    platform: 'amazon',
    productData: {
      title: 'Wireless Mouse',
      description: 'Bluetooth wireless mouse with silent click',
      category: 'Electronics',
      keywords: ['wireless mouse', 'bluetooth', 'silent click']
    },
    mode: 'create',
    expectedMinScore: 80
  },
  {
    name: 'Etsy Digital Product',
    platform: 'etsy',
    productData: {
      title: 'Wedding Invitation Template',
      description: 'Printable PDF wedding invitation, instant download, editable',
      category: 'Digital',
      keywords: ['wedding invitation', 'printable', 'instant download']
    },
    mode: 'create',
    expectedMinScore: 80
  }
];

async function testSEOVerification() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 BACKEND SEO VERIFICATION TEST');
  console.log('Testing that all outputs achieve 80+ SEO scores');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    scores: []
  };

  for (const test of testCases) {
    console.log(`\n📦 Testing: ${test.name}`);
    console.log('─────────────────────────────────────────────────────────────');

    try {
      let response;
      
      if (test.url) {
        // URL analysis test
        console.log(`URL: ${test.url}`);
        console.log(`Platform: ${test.platform}`);
        
        response = await fetch('http://localhost:3000/api/analyze-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token' // You'll need a real token
          },
          body: JSON.stringify({
            url: test.url,
            analysisType: 'optimize',
            purpose: 'test'
          })
        });
      } else {
        // Direct generation test
        console.log(`Platform: ${test.platform}`);
        console.log(`Mode: ${test.mode}`);
        
        response = await fetch('http://localhost:3000/api/generate-listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: test.platform,
            productData: test.productData,
            mode: test.mode
          })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      // Extract SEO score
      let seoScore;
      if (test.url) {
        seoScore = data.data?.analysis?.seoScore || data.data?.optimized?.seoScore || 0;
      } else {
        seoScore = data.data?.qualityScore?.score || 0;
      }

      console.log(`\n✓ SEO Score: ${seoScore}%`);
      
      // Check if meets threshold
      const meetsThreshold = seoScore >= test.expectedMinScore;
      
      if (meetsThreshold) {
        console.log(`✅ PASSED - Score meets ${test.expectedMinScore}+ threshold`);
        results.passed++;
      } else {
        console.log(`❌ FAILED - Score ${seoScore}% is below ${test.expectedMinScore}% threshold`);
        results.failed++;
      }

      results.scores.push({
        name: test.name,
        score: seoScore,
        passed: meetsThreshold,
        threshold: test.expectedMinScore
      });

      // Show title preview
      const title = test.url 
        ? (data.data?.analysis?.title || data.data?.optimized?.title)
        : data.data?.title;
      
      if (title) {
        console.log(`\nTitle: "${title}"`);
        console.log(`Length: ${title.length} chars`);
      }

    } catch (error) {
      console.log(`\n❌ ERROR: ${error.message}`);
      results.failed++;
      results.scores.push({
        name: test.name,
        score: 0,
        passed: false,
        error: error.message
      });
    }
  }

  // Final summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('📊 FINAL RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`✅ Passed (80+ score): ${results.passed}`);
  console.log(`❌ Failed (below 80): ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / testCases.length) * 100)}%`);

  console.log('\n\nScore Details:');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  results.scores.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.score}% (threshold: ${result.threshold}%)`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const avgScore = results.scores
    .filter(r => !r.error)
    .reduce((sum, r) => sum + r.score, 0) / results.scores.filter(r => !r.error).length;
  
  console.log(`\nAverage Score: ${Math.round(avgScore)}%`);

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Backend SEO verification is working correctly.\n');
    console.log('✓ All outputs achieved 80+ SEO scores');
    console.log('✓ Quality threshold enforcement is active');
    console.log('✓ System is ready for production\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Review the scores above.\n');
    console.log('Possible issues:');
    console.log('- AI model not following training guidelines');
    console.log('- Scoring system too strict');
    console.log('- Input data quality issues\n');
  }
}

// Run tests
console.log('Starting SEO verification tests...\n');
console.log('Note: This test requires the dev server to be running on localhost:3000\n');

testSEOVerification().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
