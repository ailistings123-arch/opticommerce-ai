/**
 * Test fixed Amazon extraction against Logitech K270
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

function extractTitle(html) {
  const selectors = [
    /<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i,
    /<h1[^>]*id="title"[^>]*>([\s\S]*?)<\/h1>/i,
    /<meta name="title" content="([^"]+)"/i,
    /<meta property="og:title" content="([^"]+)"/i,
    /<title>([^<]+)/i
  ];
  for (const sel of selectors) {
    const m = html.match(sel);
    if (m && m[1]) {
      let t = m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
        .replace(/^Amazon\.com\s*:\s*/i, '');
      if (t.length > 10) return t;
    }
  }
  return 'NOT FOUND';
}

function extractBullets(html) {
  const bullets = [];
  const section = html.match(/id="feature-bullets"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  const searchHtml = section ? section[1] : html;
  const regex = /<span class="a-list-item">([\s\S]*?)<\/span>/gi;
  let m;
  while ((m = regex.exec(searchHtml)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (text.length > 20) bullets.push(text);
  }
  return bullets.slice(0, 5);
}

function extractDescription(html) {
  const descDiv = html.match(/<div id="productDescription"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
  if (descDiv) {
    const t = descDiv[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length > 50) return t.substring(0, 500);
  }
  const metaDesc = html.match(/<meta name="description" content="([^"]+)"/i);
  if (metaDesc) return metaDesc[1].replace(/&amp;/g, '&').substring(0, 500);
  return 'NOT FOUND';
}

function extractBrand(html) {
  const byline = html.match(/<a id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i);
  if (byline) {
    const t = byline[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      .replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '').trim();
    if (t.length > 1) return t;
  }
  return 'NOT FOUND';
}

const req = https.request(options, (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const html = Buffer.concat(chunks).toString('utf8');
    console.log('=== FIXED EXTRACTION RESULTS ===\n');
    
    const title = extractTitle(html);
    console.log('TITLE:', title);
    console.log('Title length:', title.length, 'chars\n');
    
    const bullets = extractBullets(html);
    console.log('BULLETS (' + bullets.length + '):');
    bullets.forEach((b, i) => console.log(`  ${i+1}. ${b.substring(0, 100)}`));
    
    const desc = extractDescription(html);
    console.log('\nDESCRIPTION (first 300 chars):', desc.substring(0, 300));
    
    const brand = extractBrand(html);
    console.log('\nBRAND:', brand);
    
    console.log('\n=== VERDICT ===');
    const ok = title !== 'NOT FOUND' && bullets.length > 0;
    console.log(ok ? '✅ Extraction working correctly' : '❌ Still issues');
  });
});
req.on('error', e => console.log('Error:', e.message));
req.on('timeout', () => { req.destroy(); console.log('Timeout'); });
req.end();
