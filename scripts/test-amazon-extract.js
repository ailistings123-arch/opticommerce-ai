/**
 * Extract actual product data from Amazon HTML
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

    // 1. Meta name="title" — this is what we need to use
    const metaTitle = html.match(/<meta name="title" content="([^"]+)"/i);
    console.log('META TITLE:', metaTitle ? metaTitle[1] : 'NOT FOUND');

    // 2. Meta description
    const metaDesc = html.match(/<meta name="description" content="([^"]+)"/i);
    console.log('\nMETA DESC:', metaDesc ? metaDesc[1].substring(0, 200) : 'NOT FOUND');

    // 3. productTitle span — has whitespace inside
    const productTitleIdx = html.indexOf('id="productTitle"');
    if (productTitleIdx > -1) {
      const snippet = html.substring(productTitleIdx, productTitleIdx + 500);
      console.log('\nproductTitle raw snippet:', snippet.substring(0, 300));
      // Try with whitespace-tolerant regex
      const titleMatch = snippet.match(/>[\s\n\r]*([^\n<]{10,}?)[\s\n\r]*</);
      console.log('Extracted from snippet:', titleMatch ? titleMatch[1].trim() : 'NOT FOUND');
    }

    // 4. feature-bullets
    const bulletsIdx = html.indexOf('feature-bullets');
    if (bulletsIdx > -1) {
      const bulletSection = html.substring(bulletsIdx, bulletsIdx + 3000);
      console.log('\nfeature-bullets snippet (first 500 chars):', bulletSection.substring(0, 500));
      
      // Try extracting list items
      const liMatches = bulletSection.match(/<span class="a-list-item">([\s\S]*?)<\/span>/gi);
      if (liMatches) {
        console.log('\nBullets found:', liMatches.length);
        liMatches.slice(0, 5).forEach((m, i) => {
          const text = m.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          if (text.length > 10) console.log(`  ${i+1}. ${text.substring(0, 100)}`);
        });
      }
    }

    // 5. Brand
    const bylineIdx = html.indexOf('bylineInfo');
    if (bylineIdx > -1) {
      const snippet = html.substring(bylineIdx, bylineIdx + 300);
      console.log('\nbylineInfo snippet:', snippet.substring(0, 200));
    }

    // 6. Price
    const priceIdx = html.indexOf('a-price-whole');
    if (priceIdx > -1) {
      const snippet = html.substring(priceIdx, priceIdx + 200);
      console.log('\nprice snippet:', snippet.substring(0, 150));
    }
  });
});

req.on('error', (e) => console.log('Error:', e.message));
req.on('timeout', () => { req.destroy(); console.log('Timeout'); });
req.end();
