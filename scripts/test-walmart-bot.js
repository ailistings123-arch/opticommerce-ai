// Test different UA strategies for Walmart
const url = 'https://www.walmart.com/ip/16681615086';

const agents = [
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Googlebot/2.1 (+http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'curl/7.68.0',
];

async function tryAgent(ua) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': ua, 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9' }
    });
    const html = await r.text();
    const hasData = html.includes('__NEXT_DATA__');
    const hasBot = html.toLowerCase().includes('robot or human');
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] || '';
    console.log(`[${r.status}] ${hasBot ? '🤖BOT' : hasData ? '✅DATA' : '❓'} | og:title: ${ogTitle.substring(0,60)} | UA: ${ua.substring(0,40)}`);
  } catch(e) {
    console.log(`ERROR: ${e.message} | UA: ${ua.substring(0,40)}`);
  }
}

(async () => {
  for (const ua of agents) await tryAgent(ua);
})();
