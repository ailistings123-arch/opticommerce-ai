// Test more Walmart API endpoints
const itemId = '16681615086';

const endpoints = [
  `https://www.walmart.com/ip/api/products?ids=${itemId}`,
  `https://www.walmart.com/api/v3/page/product?itemId=${itemId}`,
  `https://www.walmart.com/api/v3/product?itemId=${itemId}`,
  `https://www.walmart.com/api/v3/items/${itemId}`,
  `https://api.walmart.com/v3/items/${itemId}`,
  `https://www.walmart.com/search/api/preso?query=${itemId}&cat_id=0`,
];

async function tryEndpoint(url) {
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.walmart.com/',
      }
    });
    const text = await r.text();
    const preview = text.substring(0, 100).replace(/\n/g, ' ');
    console.log(`[${r.status}] ${url.substring(0,65)} | ${preview}`);
  } catch(e) {
    console.log(`ERROR: ${e.message.substring(0,60)}`);
  }
}

(async () => {
  for (const ep of endpoints) await tryEndpoint(ep);
})();
