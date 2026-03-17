/**
 * Test Nicebay Curling Iron — Walmart optimization
 * Simulates what the scraper extracts from the URL slug
 */
async function test() {
  console.log('Testing Nicebay Curling Iron (Walmart)\n');

  const body = {
    platform: 'walmart',
    mode: 'analyze',
    productData: {
      title: 'Nicebay Curling Iron Professional Instant Heat Up Hair Curling Wand Set Curling Wand',
      description: 'Nicebay Curling Iron Professional Instant Heat Up Hair Curling Wand Set Curling Wand. Product available at Walmart (Item #16681615086). Hair Care styling tool.',
      category: 'Hair Care',
      brand: 'Nicebay',
      keywords: ['curling iron', 'hair curling wand', 'instant heat', 'hair styling', 'curling wand set']
    }
  };

  const r = await fetch('http://localhost:3000/api/generate-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  console.log('Status:', r.status);
  const data = await r.json();

  if (!data.success) {
    console.error('Error:', data.error);
    return;
  }

  // Response shape: data.data contains the listing fields directly
  const d = data.data;
  const listing = { title: d.title, bullets: d.bullets, description: d.description, keywords: d.keywords };
  const score = d.qualityScore;

  console.log('\n📌 TITLE (' + listing.title.length + '/75 chars = ' + Math.round(listing.title.length/75*100) + '% utilization):');
  console.log(listing.title);

  console.log('\n📌 BULLETS:');
  listing.bullets?.forEach((b, i) => console.log(`  ${i+1}. ${b.substring(0,100)}`));

  console.log('\n📌 DESCRIPTION (' + listing.description?.length + ' chars):');
  console.log(listing.description?.substring(0, 200) + '...');

  console.log('\n📌 KEYWORDS:', listing.keywords?.join(' | '));

  if (score) {
    console.log('\n📌 QUALITY SCORE:', score.percentage + '%', '—', score.grade);
  }
}

test().catch(console.error);
