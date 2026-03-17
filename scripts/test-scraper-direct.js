/**
 * Test the new UrlAnalyzerService directly via the analyze-url-deep endpoint
 * (no auth needed for this test — uses generate-listing which has no auth)
 */

const WALMART_URL = 'https://www.walmart.com/ip/Nicebay-Curling-Iron-Professional-Instant-Heat-Up-Hair-Curling-Wand-Set-Curling-Wand/16681615086';

async function testWalmartScrape() {
  console.log('Testing Walmart scrape directly...\n');

  // Simulate what UrlAnalyzerService.analyzeWalmart does
  const cleanUrl = WALMART_URL.split('?')[0];
  const res = await fetch(cleanUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    }
  });

  const html = await res.text();
  console.log(`Status: ${res.status} | Length: ${html.length}`);

  // Check bot detection
  const isBlocked = html.includes('Robot or human?') || html.includes('<title>Robot or human?</title>') || html.length < 5000;
  console.log(`Bot blocked: ${isBlocked}`);

  if (!isBlocked) {
    // Try __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch) {
      try {
        const json = JSON.parse(nextDataMatch[1]);
        const product = json?.props?.pageProps?.initialData?.data?.product;
        if (product) {
          console.log('\n✅ __NEXT_DATA__ product found:');
          console.log('  Name:', product.name);
          console.log('  Brand:', product.brand);
          console.log('  Price:', product.priceInfo?.currentPrice?.price);
          console.log('  Short desc:', (product.shortDescription || '').substring(0, 150));
          console.log('  Long desc:', (product.longDescription || '').substring(0, 150));
          console.log('  Key features:', (product.keyFeatures || []).slice(0, 3));
          console.log('  Specs count:', (product.specifications || []).length);
          console.log('  Images count:', (product.imageInfo?.allImages || []).length);
        } else {
          console.log('No product in __NEXT_DATA__, keys:', Object.keys(json?.props?.pageProps?.initialData?.data || {}));
        }
      } catch(e) {
        console.log('JSON parse error:', e.message);
      }
    }

    // Try JSON-LD
    const ldMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1]);
        const product = Array.isArray(ld) ? ld.find(i => i['@type'] === 'Product') : (ld['@type'] === 'Product' ? ld : null);
        if (product) {
          console.log('\n✅ JSON-LD product found:');
          console.log('  Name:', product.name);
          console.log('  Description:', (product.description || '').substring(0, 150));
        }
      } catch {}
    }

    // OG title
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
    if (ogTitle) console.log('\n✅ OG Title:', ogTitle);
  }
}

async function testGenerateListing() {
  console.log('\n\nTesting generate-listing with Walmart data...\n');
  const body = {
    platform: 'walmart',
    mode: 'analyze',
    productData: {
      title: 'NICEBAY by SKIMI Curling Iron, Professional Instant Heat Up Hair Curling Wand Set, Flat Iron, Curling Wand, Hair Straightener',
      description: 'Professional hair styling tool with instant heat technology. Includes curling wand set with multiple barrel sizes.',
      category: 'Hair Care',
      brand: 'NICEBAY',
      keywords: ['curling iron', 'hair curling wand', 'instant heat', 'hair styling', 'flat iron']
    }
  };

  const r = await fetch('http://localhost:3000/api/generate-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  console.log('Status:', r.status);
  const data = await r.json();
  if (!data.success) { console.error('Error:', data.error); return; }

  const d = data.data;
  const maxLen = 75;
  console.log(`\n📌 TITLE (${d.title?.length}/${maxLen} = ${Math.round(d.title?.length/maxLen*100)}%):`);
  console.log(d.title);
  console.log('\n📌 BULLETS:');
  d.bullets?.forEach((b, i) => console.log(`  ${i+1}. ${b.substring(0, 100)}`));
  console.log(`\n📌 DESCRIPTION (${d.description?.length} chars):`);
  console.log(d.description?.substring(0, 200) + '...');
  console.log('\n📌 KEYWORDS:', d.keywords?.join(' | '));
  if (d.qualityScore) console.log('\n📌 SCORE:', d.qualityScore.score + '%', d.qualityScore.grade);
}

(async () => {
  await testWalmartScrape();
  await testGenerateListing();
})().catch(console.error);
