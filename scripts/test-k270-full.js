/**
 * Full end-to-end test: Logitech K270 → AI optimization
 * Tests the generate-listing API with real scraped data
 */

const LOGITECH_DATA = {
  platform: 'amazon',
  mode: 'analyze',
  productData: {
    title: 'Logitech K270 Wireless Keyboard for Windows, 2.4 GHz Wireless, Full-Size, Number Pad, 8 Multimedia Keys, 2-Year Battery Life, Compatible with PC, Laptop, Black',
    description: 'Logitech Wireless Keyboard K270. Reliable wireless-wherever you use your keyboard. The tiny Logitech Unifying receiver is small enough to stay in your laptop. Plus, you can easily add another compatible mouse or keyboard-without the hassle of multiple USB receivers. With Logitech Advanced 2.4 GHz wireless technology, you get a strong, reliable connection up to 33 feet away.',
    category: 'Electronics',
    price: 24.99,
    keywords: [
      'All-day Comfort',
      'Built to Last',
      'Long-lasting Battery Life',
      'Easy to Set-up',
      'Simply Wireless'
    ],
    specifications: [
      { name: 'Brand', value: 'Logitech' },
      { name: 'Connectivity', value: '2.4 GHz Wireless' },
      { name: 'Battery Life', value: '24 months' },
      { name: 'Range', value: '33 feet' },
      { name: 'Keys', value: 'Full-size with Number Pad' },
      { name: 'Multimedia Keys', value: '8' },
      { name: 'Color', value: 'Black' },
      { name: 'Compatible With', value: 'PC, Laptop, Windows' }
    ]
  }
};

async function testFullFlow() {
  console.log('🧪 Testing Logitech K270 Full Optimization Flow\n');
  console.log('Platform: AMAZON');
  console.log('Mode: ANALYZE (competitor analysis)\n');
  console.log('Input title:', LOGITECH_DATA.productData.title.substring(0, 80) + '...');
  console.log('Sending to /api/generate-listing...\n');

  const start = Date.now();

  try {
    const response = await fetch('http://localhost:3000/api/generate-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LOGITECH_DATA)
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`Response received in ${elapsed}s — Status: ${response.status}\n`);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ FAILED:', data.error);
      if (data.details) console.error('Details:', data.details);
      return;
    }

    const listing = data.data;
    const score = listing.qualityScore;

    console.log('═'.repeat(80));
    console.log('OPTIMIZED OUTPUT');
    console.log('═'.repeat(80));

    // Title analysis
    const titleLen = listing.title.length;
    const titleUtil = Math.round((titleLen / 200) * 100);
    console.log(`\n📌 TITLE (${titleLen}/200 chars = ${titleUtil}% utilization):`);
    console.log(listing.title);

    // Check prohibited words
    const prohibited = ['best', 'premium', 'professional', 'ultimate', 'perfect', 'amazing', 'quality grade', 'high quality', 'top quality'];
    const titleLower = listing.title.toLowerCase();
    const found = prohibited.filter(w => titleLower.includes(w));
    console.log(found.length === 0 ? '✅ No prohibited words' : '❌ Prohibited words: ' + found.join(', '));
    console.log(titleUtil >= 90 ? '✅ Title utilization excellent (90%+)' : titleUtil >= 80 ? '⚠️  Title utilization ok (80%+)' : '❌ Title too short (<80%)');

    // Bullets
    console.log(`\n📌 BULLETS (${listing.bullets.length}):`);
    listing.bullets.forEach((b, i) => {
      const benefitFirst = /^[A-Z\s]{3,}[\s—\-:]/.test(b);
      console.log(`  ${i+1}. [${benefitFirst ? '✅' : '⚠️ '}] ${b.substring(0, 100)}`);
    });

    // Description
    const descLen = listing.description.length;
    console.log(`\n📌 DESCRIPTION (${descLen} chars):`);
    console.log(listing.description.substring(0, 400) + (descLen > 400 ? '...' : ''));
    console.log(descLen >= 1000 ? '✅ Description length good (1000+)' : descLen >= 500 ? '⚠️  Description ok (500+)' : '❌ Description too short');

    // Keywords
    console.log(`\n📌 KEYWORDS (${listing.keywords.length}):`);
    console.log(listing.keywords.join(' | '));

    // Platform notes
    if (listing.platform_notes) {
      console.log('\n📌 PLATFORM NOTES:');
      console.log(listing.platform_notes);
    }

    // Quality score
    if (score) {
      console.log('\n📌 QUALITY SCORE:');
      console.log(`  Overall: ${score.score}% — ${score.grade}`);
      if (score.breakdown) {
        const b = score.breakdown;
        console.log(`  Title: ${b.title?.score}/${b.title?.maxScore}`);
        console.log(`  Bullets: ${b.bullets?.score}/${b.bullets?.maxScore}`);
        console.log(`  Description: ${b.description?.score}/${b.description?.maxScore}`);
        console.log(`  Compliance: ${b.compliance?.score}/${b.compliance?.maxScore}`);
      }
    }

    // Warnings
    if (data.warnings && data.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      data.warnings.slice(0, 5).forEach(w => console.log('  -', w));
    }

    console.log('\n' + '═'.repeat(80));
    const pass = titleUtil >= 90 && found.length === 0 && descLen >= 500 && listing.bullets.length >= 5;
    console.log(pass ? '🎉 ALL CHECKS PASSED' : '⚠️  SOME CHECKS NEED ATTENTION');
    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testFullFlow();
