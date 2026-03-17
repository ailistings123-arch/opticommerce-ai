/**
 * Test URL scraping across all platforms
 */
const tests = [
  { name: 'Walmart Curling Iron', url: 'https://www.walmart.com/ip/Nicebay-Curling-Iron-Professional-Instant-Heat-Up-Hair-Curling-Wand-Set-Curling-Wand/16681615086' },
  { name: 'Amazon K270', url: 'https://www.amazon.com/Logitech-Wireless-Keyboard-Windows-Multimedia/dp/B003ELVLKU' },
  { name: 'eBay iPhone Case', url: 'https://www.ebay.com/itm/iPhone-14-Pro-Case/123456789' },
  { name: 'Shopify (generic)', url: 'https://allbirds.com/products/mens-tree-runners' },
];

async function testUrl(name, url) {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();
    console.log(`\n[${name}] Testing: ${url.substring(0, 70)}...`);

    // Simulate what the service does
    const res = await fetch(url.split('?')[0], {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    });

    const html = await res.text();
    console.log(`  Status: ${res.status} | HTML length: ${html.length}`);
    console.log(`  Has __NEXT_DATA__: ${html.includes('__NEXT_DATA__')}`);
    console.log(`  Has JSON-LD: ${html.includes('application/ld+json')}`);
    console.log(`  Has og:title: ${html.includes('og:title')}`);
    console.log(`  Bot check: ${html.toLowerCase().includes('robot') || html.toLowerCase().includes('captcha')}`);

    // Extract og:title
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
    if (ogTitle) console.log(`  OG Title: ${ogTitle.substring(0, 80)}`);

    // Extract JSON-LD name
    const ldMatch = html.match(/"@type"\s*:\s*"Product"[\s\S]*?"name"\s*:\s*"([^"]+)"/i);
    if (ldMatch) console.log(`  JSON-LD Name: ${ldMatch[1].substring(0, 80)}`);

  } catch(e) {
    console.log(`  ERROR: ${e.message}`);
  }
}

(async () => {
  for (const t of tests) await testUrl(t.name, t.url);
})();
