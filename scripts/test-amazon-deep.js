/**
 * Deep inspect Amazon HTML to find where product data actually lives
 */
const https = require('https');

const options = {
  hostname: 'www.amazon.com',
  path: '/Logitech-Wireless-Keyboard-K270-Long-Range/dp/B004N627KS/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const html = Buffer.concat(chunks).toString('utf8');

    // Try JSON-LD structured data
    console.log('=== JSON-LD Structured Data ===');
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      jsonLdMatches.forEach((match, i) => {
        try {
          const json = JSON.parse(match.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
          console.log(`JSON-LD ${i+1}:`, JSON.stringify(json).substring(0, 300));
        } catch(e) {}
      });
    } else {
      console.log('No JSON-LD found');
    }

    // Try window.__INITIAL_STATE__ or similar
    console.log('\n=== JS Data Objects ===');
    const initialState = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
    console.log('__INITIAL_STATE__:', initialState ? 'FOUND (' + initialState[1].length + ' chars)' : 'NOT FOUND');

    const dataLayer = html.match(/"title"\s*:\s*"([^"]{10,200})"/);
    console.log('"title" in JS:', dataLayer ? dataLayer[1] : 'NOT FOUND');

    // Try meta tags more broadly
    console.log('\n=== All Meta Tags ===');
    const metas = html.match(/<meta[^>]+>/gi) || [];
    metas.slice(0, 20).forEach(m => {
      if (m.includes('title') || m.includes('description') || m.includes('product')) {
        console.log(m.substring(0, 150));
      }
    });

    // Try to find product title in any format
    console.log('\n=== Searching for "K270" in HTML ===');
    const idx = html.indexOf('K270');
    if (idx > -1) {
      console.log('Found at index', idx, ':', html.substring(Math.max(0, idx-100), idx+200).replace(/\s+/g, ' '));
    } else {
      console.log('K270 not found in HTML at all');
    }

    // Check if it's encoded differently
    console.log('\n=== Checking for encoded content ===');
    const hasBase64 = html.includes('data-a-expander-collapsed-height');
    console.log('Has expander data:', hasBase64);
    
    // Look for any product name pattern
    const productName = html.match(/"productTitle"\s*:\s*"([^"]+)"/);
    console.log('productTitle in JSON:', productName ? productName[1] : 'NOT FOUND');
    
    const itemName = html.match(/"itemName"\s*:\s*"([^"]+)"/);
    console.log('itemName in JSON:', itemName ? itemName[1] : 'NOT FOUND');

    // Check for anti-bot signals
    console.log('\n=== Anti-bot signals ===');
    console.log('Has "sp-atf":', html.includes('sp-atf'));
    console.log('Has "nav-logo":', html.includes('nav-logo'));
    console.log('Has "dp-container":', html.includes('dp-container'));
    console.log('Has "ppd":', html.includes('ppd'));
    console.log('Has "centerCol":', html.includes('centerCol'));
    console.log('Has "feature-bullets":', html.includes('feature-bullets'));
    console.log('Has "productTitle":', html.includes('productTitle'));
  });
});

req.on('error', (e) => console.log('Error:', e.message));
req.on('timeout', () => { req.destroy(); console.log('Timeout'); });
req.end();
