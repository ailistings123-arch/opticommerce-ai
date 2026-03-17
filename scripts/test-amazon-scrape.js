/**
 * Test Amazon URL scraping for Logitech K270
 */
const https = require('https');

const AMAZON_URL = 'https://www.amazon.com/Logitech-Wireless-Keyboard-K270-Long-Range/dp/B004N627KS/';

console.log('Testing Amazon scrape for Logitech K270...\n');

const options = {
  hostname: 'www.amazon.com',
  path: '/Logitech-Wireless-Keyboard-K270-Long-Range/dp/B004N627KS/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'DNT': '1'
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  console.log('HTTP Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);

  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const html = Buffer.concat(chunks).toString('utf8');
    console.log('HTML length:', html.length, 'bytes\n');

    // Check for bot detection
    const isCaptcha = html.includes('robot check') || html.includes('captcha') || html.includes('Enter the characters you see below');
    const isBlocked = html.includes('Sorry, we just need to make sure') || html.includes('To discuss automated access');
    console.log('CAPTCHA detected:', isCaptcha);
    console.log('Bot blocked:', isBlocked);

    // Try all title extraction methods
    console.log('\n--- Title Extraction ---');
    const t1 = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/i);
    console.log('productTitle span:', t1 ? t1[1].trim().substring(0, 100) : 'NOT FOUND');

    const t2 = html.match(/<h1[^>]*id="title"[^>]*>([^<]+)<\/h1>/i);
    console.log('h1#title:', t2 ? t2[1].trim().substring(0, 100) : 'NOT FOUND');

    const t3 = html.match(/<meta property="og:title" content="([^"]+)"/i);
    console.log('og:title:', t3 ? t3[1].substring(0, 100) : 'NOT FOUND');

    const t4 = html.match(/<title>([^<:]+)/i);
    console.log('page title:', t4 ? t4[1].trim().substring(0, 100) : 'NOT FOUND');

    // Try bullets
    console.log('\n--- Bullet Extraction ---');
    const bulletRegex = /<span class="a-list-item">([^<]+)<\/span>/gi;
    const bullets = [];
    let m;
    while ((m = bulletRegex.exec(html)) !== null) {
      if (m[1].trim().length > 20) bullets.push(m[1].trim());
    }
    console.log('Bullets found:', bullets.length);
    bullets.slice(0, 3).forEach((b, i) => console.log(`  ${i+1}. ${b.substring(0, 80)}`));

    // Try brand
    console.log('\n--- Brand Extraction ---');
    const brand1 = html.match(/<a id="bylineInfo"[^>]*>([^<]+)<\/a>/i);
    console.log('bylineInfo:', brand1 ? brand1[1].trim() : 'NOT FOUND');
    const brand2 = html.match(/<span class="a-size-base po-break-word">([^<]+)<\/span>/i);
    console.log('po-break-word:', brand2 ? brand2[1].trim() : 'NOT FOUND');

    // Try price
    console.log('\n--- Price Extraction ---');
    const price1 = html.match(/<span class="a-price-whole">([^<]+)<\/span>/i);
    console.log('price-whole:', price1 ? price1[1].trim() : 'NOT FOUND');

    // ASIN from URL
    const asin = AMAZON_URL.match(/\/dp\/([A-Z0-9]{10})/i);
    console.log('\nASIN from URL:', asin ? asin[1] : 'NOT FOUND');

    // URL slug title
    const slugMatch = AMAZON_URL.match(/\/([^/]+)\/dp\//);
    if (slugMatch) {
      const slugTitle = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      console.log('URL slug title:', slugTitle);
    }

    console.log('\n--- Summary ---');
    if (isCaptcha || isBlocked || html.length < 5000) {
      console.log('RESULT: Amazon blocked the request — will use URL fallback');
    } else {
      const hasTitle = t1 || t2 || t3;
      console.log('RESULT: Got real HTML —', hasTitle ? 'title extracted successfully' : 'title not found in HTML');
    }
  });
});

req.on('error', (e) => console.log('Request error:', e.message));
req.on('timeout', () => {
  req.destroy();
  console.log('Request timed out');
});
req.end();
