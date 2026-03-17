// Test Walmart's public product API endpoints
const itemId = '16681615086';

const endpoints = [
  `https://www.walmart.com/product/api/products?ids=${itemId}`,
  `https://www.walmart.com/terra-firma/item/${itemId}`,
  `https://www.walmart.com/api/v3/page/product?itemId=${itemId}&pageType=item`,
];

async function tryEndpoint(url) {
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.walmart.com/',
        'WM_QOS.CORRELATION_ID': '1234',
      }
    });
    const text = await r.text();
    console.log(`[${r.status}] ${url.substring(0,60)}`);
    if (r.status === 200 && text.length > 100) {
      try {
        const json = JSON.parse(text);
        console.log('  Keys:', Object.keys(json).slice(0,5).join(', '));
        const name = JSON.stringify(json).match(/"name"\s*:\s*"([^"]{10,100})"/)?.[1];
        if (name) console.log('  Name:', name);
      } catch { console.log('  Not JSON, length:', text.length); }
    }
  } catch(e) {
    console.log(`ERROR: ${e.message}`);
  }
}

(async () => {
  for (const ep of endpoints) await tryEndpoint(ep);
})();
