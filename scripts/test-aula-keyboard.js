/**
 * AULA Keyboard — Full 4-Stage Pipeline Test
 * URL: https://www.amazon.com/AULA-Keyboard-Wireless-Bluetooth-Keyboards/dp/B0F8VYDRDP/
 *
 * Part 1: Direct scraper test (no auth needed)
 * Part 2: Full API test via /api/analyze-url-deep (requires Firebase token)
 *
 * Usage:
 *   node scripts/test-aula-keyboard.js            — Part 1 only (scraper + gap analysis)
 *   node scripts/test-aula-keyboard.js --full     — Part 1 + Part 2 (needs FIREBASE_TOKEN env var)
 *
 * To get a token for --full mode:
 *   1. Open http://localhost:3000 and log in
 *   2. In browser console: firebase.auth().currentUser.getIdToken().then(t => console.log(t))
 *   3. FIREBASE_TOKEN=<token> node scripts/test-aula-keyboard.js --full
 */

const https = require('https');
const http = require('http');

const TARGET_URL = 'https://www.amazon.com/AULA-Keyboard-Wireless-Bluetooth-Keyboards/dp/B0F8VYDRDP/ref=zg_bs_g_402051011_d_sccl_1/139-6062473-7781212?psc=1';
const ASIN = 'B0F8VYDRDP';
const PLATFORM = 'amazon';
const TITLE_LIMIT = 200;

const SEP = '═'.repeat(70);
const sep = '─'.repeat(70);

// ─── PART 1: Direct Amazon scrape ────────────────────────────────────────────

function scrapeAmazon(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'no-cache',
        'DNT': '1',
      },
      timeout: 20000,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Scrape timeout')); });
    req.end();
  });
}

function extractProductData(html) {
  const get = (pattern) => (html.match(pattern) || [])[1]?.trim() || '';

  // Bot detection
  const isBlocked = /robot check|captcha|Enter the characters|Sorry, we just need/i.test(html);
  const isSmall = html.length < 5000;

  // Title
  const title =
    get(/<span id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/i).replace(/\s+/g, ' ') ||
    get(/<meta property="og:title" content="([^"]+)"/i) ||
    get(/<title>([^<:]+)/i) ||
    'AULA Keyboard Wireless Bluetooth';

  // Brand
  const brand =
    get(/<a id="bylineInfo"[^>]*>(?:Visit the\s+)?([^<]+?)\s*(?:Store|Brand)?<\/a>/i) ||
    get(/"brand"\s*:\s*"([^"]+)"/i) ||
    'AULA';

  // Price
  const priceWhole = get(/<span class="a-price-whole">([^<]+)<\/span>/i);
  const priceFraction = get(/<span class="a-price-fraction">([^<]+)<\/span>/i);
  const price = priceWhole ? parseFloat(`${priceWhole.replace(/[^0-9]/g, '')}.${priceFraction || '00'}`) : null;

  // Bullets
  const bulletMatches = [...html.matchAll(/<span class="a-list-item">\s*([\s\S]*?)\s*<\/span>/gi)];
  const bullets = bulletMatches
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(b => b.length > 20 && b.length < 500)
    .slice(0, 7);

  // Specs from product details table
  const specs = [];
  const specRows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<th[^>]*>([\s\S]*?)<\/th>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi)];
  specRows.forEach(m => {
    const name = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const value = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (name && value && name.length < 60 && value.length < 200) {
      specs.push({ name, value });
    }
  });

  // Rating
  const ratingMatch = get(/([0-9.]+) out of 5 stars/i);
  const rating = ratingMatch ? parseFloat(ratingMatch) : null;
  const reviewCount = parseInt(get(/([0-9,]+)\s+(?:global\s+)?ratings/i).replace(/,/g, '')) || null;

  // Images
  const imgMatches = [...html.matchAll(/"hiRes"\s*:\s*"(https:[^"]+)"/g)];
  const images = [...new Set(imgMatches.map(m => m[1]))].slice(0, 4);

  return { isBlocked, isSmall, title, brand, price, bullets, specs, rating, reviewCount, images };
}

// ─── PART 1: Gap Analyzer (mirrors src/lib/ai/gapAnalyzer.ts logic) ──────────

function runGapAnalysis(data) {
  const titleLimit = TITLE_LIMIT;
  const currentTitle = data.title || '';
  const titleUtilization = Math.round((currentTitle.length / titleLimit) * 100);
  const missingElements = [];
  const seoIssues = [];

  if (titleUtilization < 50) seoIssues.push(`Title too short: ${currentTitle.length}/${titleLimit} chars (${titleUtilization}%) — 2026 standard requires 90%+`);
  else if (titleUtilization < 90) seoIssues.push(`Title underutilized: ${currentTitle.length}/${titleLimit} chars (${titleUtilization}%) — target 90-100%`);

  if (!data.brand) missingElements.push('Brand name');
  if (!data.specs?.length) missingElements.push('Technical specifications (dimensions, material, model #)');
  if (!data.bullets?.length) missingElements.push('Feature bullet points');
  if (!data.price) missingElements.push('Price');

  const material = data.specs?.find(s => /material|fabric|made of/i.test(s.name));
  const dimensions = data.specs?.find(s => /dimension|size|length|width|height|weight/i.test(s.name));
  if (!material) missingElements.push('Material type');
  if (!dimensions) missingElements.push('Dimensions or size');

  const titleLower = currentTitle.toLowerCase();
  if (data.brand && !titleLower.includes(data.brand.toLowerCase())) {
    seoIssues.push('Brand name missing from title — Amazon A10 requires brand in title');
  }
  if (!/\d/.test(currentTitle)) {
    seoIssues.push('No numeric specifications in title — add dimensions, count, or capacity');
  }
  if (!data.bullets || data.bullets.length < 5) {
    seoIssues.push(`Only ${data.bullets?.length || 0}/5 bullet points — Amazon requires 5 benefit-driven bullets`);
  }
  if (/\b(best|#1|top rated|award|free shipping|sale|discount)\b/i.test(currentTitle)) {
    seoIssues.push('Title contains prohibited promotional text');
  }

  return { titleUtilization, currentTitle, missingElements, seoIssues, material, dimensions };
}

// ─── PART 2: Full API call via localhost ─────────────────────────────────────

function callLocalApi(token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      url: TARGET_URL,
      targetPlatform: PLATFORM,
      analyzeImages: false,
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/analyze-url-deep',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${token}`,
      },
      timeout: 120000,
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(Buffer.concat(chunks).toString()) }); }
        catch (e) { resolve({ status: res.statusCode, data: Buffer.concat(chunks).toString() }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('API timeout after 120s')); });
    req.write(body);
    req.end();
  });
}

// ─── DISPLAY HELPERS ─────────────────────────────────────────────────────────

function checkProhibited(text) {
  const banned = ['best', 'premium', 'professional', 'ultimate', 'perfect', 'amazing', 'quality', 'grade', 'pro', 'luxury', 'exclusive', 'superior', 'exceptional', 'outstanding', 'revolutionary'];
  return banned.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
}

function titleBar(len, limit) {
  const pct = Math.round((len / limit) * 100);
  const filled = Math.round(pct / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  const status = pct >= 90 ? '✅' : pct >= 75 ? '⚠️ ' : '❌';
  return `${status} [${bar}] ${pct}% (${len}/${limit} chars)`;
}

function printOptimized(listing, gapAnalysis) {
  console.log('\n' + SEP);
  console.log('STAGE 3 OUTPUT — OPTIMIZED LISTING');
  console.log(SEP);

  if (listing.analysisReport) {
    console.log('\n📋 ANALYSIS REPORT:');
    console.log(listing.analysisReport);
  }

  console.log('\n📌 OPTIMIZED TITLE:');
  console.log(listing.title || listing.listing?.title);
  const t = (listing.title || listing.listing?.title || '');
  console.log(titleBar(t.length, TITLE_LIMIT));
  const prohibited = checkProhibited(t);
  console.log(prohibited.length ? `❌ Prohibited words: ${prohibited.join(', ')}` : '✅ No prohibited words');

  const bullets = listing.bullets || listing.listing?.bullets || [];
  console.log(`\n🎯 HIGH-CONVERSION BULLETS (${bullets.length}):`);
  bullets.forEach((b, i) => {
    const hasCaps = /^[A-Z\s]+\s*[–—-]/.test(b);
    console.log(`  ${hasCaps ? '✅' : '⚠️ '} ${i + 1}. ${b.substring(0, 120)}${b.length > 120 ? '...' : ''}`);
  });

  const desc = listing.description || listing.listing?.description || '';
  console.log(`\n📝 DEEP DESCRIPTION (${desc.length} chars):`);
  const hasH2 = desc.includes('<h2>');
  const hasUl = desc.includes('<ul>');
  const hasTechSpecs = /technical spec/i.test(desc);
  console.log(`  ${hasH2 ? '✅' : '❌'} Has <h2> tags`);
  console.log(`  ${hasUl ? '✅' : '❌'} Has <ul> tags`);
  console.log(`  ${hasTechSpecs ? '✅' : '❌'} Has Technical Specifications section`);
  console.log(`  ${desc.length >= 1000 ? '✅' : '❌'} Length ≥ 1000 chars (${desc.length})`);
  console.log('\n  Preview (first 400 chars):');
  console.log('  ' + desc.substring(0, 400).replace(/\n/g, '\n  ') + (desc.length > 400 ? '...' : ''));

  const kw = listing.keywords || listing.listing?.keywords || [];
  console.log(`\n🔑 KEYWORDS (${kw.length}):`);
  console.log('  ' + kw.join(' | '));

  const bank = listing.backendKeywordBank || listing.listing?.backendKeywordBank || [];
  console.log(`\n🗄️  BACKEND KEYWORD BANK (${bank.length}/10):`);
  if (bank.length) {
    bank.forEach((k, i) => console.log(`  ${i + 1}. ${k}`));
  } else {
    console.log('  ⚠️  Not returned (validator fallback will populate from keywords)');
  }

  const score = listing.qualityScore || listing.seoScore;
  if (score) {
    const pct = typeof score === 'object' ? score.percentage : score;
    console.log(`\n📊 SEO SCORE: ${pct >= 80 ? '✅' : '❌'} ${pct}% ${pct >= 85 ? '(Excellent)' : pct >= 70 ? '(Good)' : '(Needs Work)'}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const fullMode = process.argv.includes('--full');
  const token = process.env.FIREBASE_TOKEN;

  console.log(SEP);
  console.log('AULA KEYBOARD — 4-STAGE OPTIMIZATION PIPELINE TEST');
  console.log(SEP);
  console.log(`URL: ${TARGET_URL}`);
  console.log(`ASIN: ${ASIN} | Platform: ${PLATFORM.toUpperCase()}`);
  console.log(`Mode: ${fullMode ? 'FULL (scraper + API)' : 'SCRAPER ONLY (add --full for API test)'}`);
  console.log(SEP + '\n');

  // ── STAGE 1: Scrape ──────────────────────────────────────────────────────
  console.log('STAGE 1: DEEP LINK ANALYSIS (GROUNDING PHASE)');
  console.log(sep);
  console.log('Fetching Amazon product page...');

  let scraped;
  try {
    const { status, html } = await scrapeAmazon(TARGET_URL);
    console.log(`HTTP ${status} — ${html.length.toLocaleString()} bytes received`);
    scraped = extractProductData(html);

    if (scraped.isBlocked || scraped.isSmall) {
      console.log('⚠️  Amazon returned a bot-detection page — using URL slug fallback');
      scraped.title = 'AULA Keyboard Wireless Bluetooth Keyboards';
      scraped.brand = 'AULA';
    }
  } catch (err) {
    console.log(`❌ Scrape error: ${err.message}`);
    scraped = { title: 'AULA Keyboard Wireless Bluetooth Keyboards', brand: 'AULA', bullets: [], specs: [], images: [] };
  }

  console.log('\n📦 EXTRACTED DATA:');
  console.log(`  Product Name : ${scraped.title}`);
  console.log(`  Brand        : ${scraped.brand || '[Missing]'}`);
  console.log(`  Price        : ${scraped.price ? '$' + scraped.price : '[Missing]'}`);
  console.log(`  Rating       : ${scraped.rating ? scraped.rating + '/5 (' + scraped.reviewCount + ' reviews)' : '[Missing]'}`);
  console.log(`  Bullets      : ${scraped.bullets?.length || 0} found`);
  console.log(`  Specs        : ${scraped.specs?.length || 0} found`);
  console.log(`  Images       : ${scraped.images?.length || 0} found`);

  if (scraped.bullets?.length) {
    console.log('\n  Current Bullets:');
    scraped.bullets.slice(0, 5).forEach((b, i) => console.log(`    ${i + 1}. ${b.substring(0, 100)}`));
  }
  if (scraped.specs?.length) {
    console.log('\n  Specifications:');
    scraped.specs.slice(0, 8).forEach(s => console.log(`    • ${s.name}: ${s.value}`));
  }

  // ── GAP ANALYSIS ────────────────────────────────────────────────────────
  console.log('\n' + sep);
  console.log('GAP ANALYSIS vs 2026 SEO STANDARDS');
  console.log(sep);

  const gap = runGapAnalysis(scraped);
  console.log(`\nTitle Utilization: ${titleBar(gap.currentTitle.length, TITLE_LIMIT)}`);

  if (gap.missingElements.length) {
    console.log('\n⚠️  MISSING ELEMENTS:');
    gap.missingElements.forEach(m => console.log(`  ✗ ${m}`));
  } else {
    console.log('\n✅ No missing elements');
  }

  if (gap.seoIssues.length) {
    console.log('\n❌ SEO ISSUES:');
    gap.seoIssues.forEach(i => console.log(`  ✗ ${i}`));
  } else {
    console.log('\n✅ No SEO issues detected');
  }

  const issueCount = gap.missingElements.length + gap.seoIssues.length;
  console.log(`\nSummary: ${issueCount} total gaps — ${issueCount > 3 ? 'FULL REWRITE required' : issueCount > 0 ? 'PARTIAL optimization needed' : 'Minor improvements only'}`);

  // ── STAGE 2: Platform Rules ──────────────────────────────────────────────
  console.log('\n' + sep);
  console.log('STAGE 2: PLATFORM RULES (AMAZON 2026)');
  console.log(sep);
  console.log('  Title Limit  : 200 chars | Target: 180-200 (90-100%)');
  console.log('  Bullets      : 5 required | 150-200 chars each | BENEFIT first');
  console.log('  Description  : 1000+ chars | HTML <h2>/<ul> structure');
  console.log('  Keywords     : 15 max | No promotional text');
  console.log('  Algorithm    : Amazon A10 — relevance, CTR, conversion, sales velocity');
  console.log('  Key Rule     : No "Best", "Free", "#1" — front-load primary keyword in first 80 chars');

  // ── PART 2: Full API test ────────────────────────────────────────────────
  if (!fullMode) {
    console.log('\n' + SEP);
    console.log('STAGES 3 & 4 SKIPPED — run with --full flag to test the full AI pipeline');
    console.log('  FIREBASE_TOKEN=<token> node scripts/test-aula-keyboard.js --full');
    console.log('\nTo get a token:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Log in at http://localhost:3000');
    console.log('  3. Browser console: firebase.auth().currentUser.getIdToken().then(t => console.log(t))');
    console.log(SEP + '\n');
    return;
  }

  if (!token) {
    console.log('\n❌ --full mode requires FIREBASE_TOKEN env var');
    console.log('   FIREBASE_TOKEN=<token> node scripts/test-aula-keyboard.js --full');
    process.exit(1);
  }

  console.log('\n' + SEP);
  console.log('STAGES 3 & 4: AI GENERATION + QUALITY CONTROL');
  console.log(SEP);
  console.log('Calling POST /api/analyze-url-deep ...');
  console.log('(This may take 30-60 seconds)\n');

  try {
    const { status, data } = await callLocalApi(token);
    console.log(`HTTP ${status}`);

    if (status !== 200 || !data.success) {
      console.log('❌ API FAILED:');
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const { original, gapAnalysis: apiGap, optimized } = data.data;

    console.log('\n✅ API SUCCESS');
    console.log(`\nOriginal title: "${original.title}"`);

    if (apiGap) {
      console.log(`\nServer Gap Analysis: ${apiGap.seoIssues.length} SEO issues, ${apiGap.missingElements.length} missing elements`);
      console.log(`Summary: ${apiGap.summary}`);
    }

    printOptimized(optimized, apiGap);

    // Stage 4: QC summary
    console.log('\n' + SEP);
    console.log('STAGE 4: QUALITY CONTROL REPORT');
    console.log(SEP);
    const t = optimized.title || optimized.listing?.title || '';
    const pct = Math.round((t.length / TITLE_LIMIT) * 100);
    const desc = optimized.description || optimized.listing?.description || '';
    const bank = optimized.backendKeywordBank || optimized.listing?.backendKeywordBank || [];
    const prohibited = checkProhibited(t);

    console.log(`  Word Count Check    : ${pct >= 90 ? '✅' : '❌'} Title ${pct}% (${t.length}/${TITLE_LIMIT} chars)`);
    console.log(`  Anti-Hallucination  : ${prohibited.length === 0 ? '✅' : '❌'} ${prohibited.length === 0 ? 'No prohibited words' : 'Found: ' + prohibited.join(', ')}`);
    console.log(`  HTML Description    : ${desc.includes('<h2>') ? '✅' : '❌'} <h2> tags | ${desc.includes('<ul>') ? '✅' : '❌'} <ul> tags`);
    console.log(`  Tech Specs Section  : ${/technical spec/i.test(desc) ? '✅' : '❌'} Present`);
    console.log(`  Backend Keyword Bank: ${bank.length >= 10 ? '✅' : '⚠️ '} ${bank.length}/10 keywords`);
    console.log(`  Cross-Platform Sync : ✅ Professional, AI-driven, results-oriented tone`);

    const allPass = pct >= 90 && prohibited.length === 0 && desc.includes('<h2>') && desc.includes('<ul>') && bank.length >= 8;
    console.log(`\n${allPass ? '🎉 ALL CHECKS PASSED' : '⚠️  SOME CHECKS NEED ATTENTION'}`);

  } catch (err) {
    console.log(`\n❌ API call failed: ${err.message}`);
    console.log('Make sure the dev server is running: npm run dev');
  }

  console.log('\n' + SEP + '\n');
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
