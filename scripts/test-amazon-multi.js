/**
 * Amazon Multi-Product Pipeline Test
 * Directly calls: Amazon scraper → Gap Analyzer → Gemini AI → QC
 * No auth, no server, no TypeScript — pure Node.js
 *
 * Usage: node scripts/test-amazon-multi.js
 */

'use strict';
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const GEMINI_KEY   = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GROQ_KEY     = process.env.GROQ_API_KEY;
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const TITLE_LIMIT  = 200;
const SEP  = '═'.repeat(72);
const sep  = '─'.repeat(72);

// Pick provider: prefer Gemini, fall back to Groq
const USE_GROQ = !GEMINI_KEY || process.env.USE_GROQ === '1';
if (!GEMINI_KEY && !GROQ_KEY) { console.error('❌  No AI API key found in .env.local'); process.exit(1); }
const PROVIDER = (GROQ_KEY && (!GEMINI_KEY || USE_GROQ)) ? 'groq' : 'gemini';

// ─── TEST PRODUCTS (diverse Amazon categories) ────────────────────────────────
const PRODUCTS = [
  {
    label: 'Gaming Keyboard (Electronics)',
    url: 'https://www.amazon.com/AULA-Keyboard-Wireless-Bluetooth-Keyboards/dp/B0F8VYDRDP/',
  },
  {
    label: 'Skincare Cream (Beauty)',
    url: 'https://www.amazon.com/CeraVe-Moisturizing-Cream-Daily-Moisturizer/dp/B00TTD9BRC/',
  },
  {
    label: 'Coffee Maker (Kitchen)',
    url: 'https://www.amazon.com/Keurig-K-Elite-Temperature-Capability-Programmable/dp/B078NN17K3/',
  },
  {
    label: 'Yoga Mat (Sports & Fitness)',
    url: 'https://www.amazon.com/Gaiam-Yoga-Mat-Thick-Non-Slip/dp/B0000DZFKB/',
  },
  {
    label: 'Dog Food (Pet Supplies)',
    url: 'https://www.amazon.com/Blue-Buffalo-Protection-Natural-Chicken/dp/B001VROVS2/',
  },
];

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function fetchUrl(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const UAS = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    ];
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + (parsed.search || ''),
      method: 'GET',
      headers: {
        'User-Agent': UAS[Math.floor(Math.random() * UAS.length)],
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
        ...extraHeaders,
      },
      timeout: 20000,
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function postJson(hostname, path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...extraHeaders },
      timeout: 90000,
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(Buffer.concat(chunks).toString()) }); }
        catch (e) { reject(new Error('JSON parse failed: ' + Buffer.concat(chunks).toString().substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('AI API timeout')); });
    req.write(payload);
    req.end();
  });
}

// ─── AMAZON SCRAPER ───────────────────────────────────────────────────────────

function clean(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
    .replace(/&ndash;/g,'-').replace(/&mdash;/g,'-').replace(/\s+/g,' ').trim();
}

function detectCategory(text) {
  const t = (text||'').toLowerCase();
  if (/keyboard|mouse|laptop|monitor|headphone|speaker|webcam|usb|bluetooth|gaming/.test(t)) return 'Electronics';
  if (/cream|serum|moisturizer|lotion|cleanser|sunscreen|makeup|skincare/.test(t)) return 'Beauty';
  if (/coffee|blender|air fryer|instant pot|cookware|knife|pan|keurig/.test(t)) return 'Kitchen';
  if (/yoga|gym|dumbbell|resistance|treadmill|bicycle|mat|fitness/.test(t)) return 'Sports & Fitness';
  if (/dog|cat|pet|collar|leash|treat|aquarium|kibble|food/.test(t)) return 'Pet Supplies';
  if (/shirt|pants|dress|jacket|shoes|sneaker|hoodie|jeans/.test(t)) return 'Clothing';
  if (/vitamin|supplement|protein|probiotic|omega/.test(t)) return 'Health';
  if (/book|novel|textbook|guide|manual/.test(t)) return 'Books';
  return 'General';
}

async function scrapeAmazon(url) {
  const asin = (url.match(/\/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i) || [])[1] || null;
  const slugTitle = url.split('/').filter(p => p.length > 5 && !/^\d+$/.test(p) && !/^[A-Z0-9]{10}$/.test(p))
    .sort((a,b) => b.length - a.length)[0]?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) || 'Amazon Product';

  try {
    const { status, html } = await fetchUrl(url.split('?')[0]);
    const isBlocked = html.includes('Enter the characters you see below') ||
      html.includes('<title>Robot Check</title>') || html.length < 5000;

    if (isBlocked) {
      return { title: slugTitle, description: slugTitle + '. Amazon blocked scrape.', category: detectCategory(slugTitle), bullets: [], specs: [], images: [], brand: null, price: null, blocked: true };
    }

    // Title
    const title = clean(
      (html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i)||[])[1] ||
      (html.match(/<meta property="og:title" content="([^"]+)"/i)||[])[1] ||
      (html.match(/<title>([^<:]+)/i)||[])[1] || ''
    ).replace(/^Amazon\.com\s*:\s*/i,'') || slugTitle;

    // Bullets
    const bullets = [];
    const bulletsSection = (html.match(/id="feature-bullets"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)||[])[1] || html;
    const br = /<span class="a-list-item">([\s\S]*?)<\/span>/gi;
    let bm;
    while ((bm = br.exec(bulletsSection)) !== null) {
      const b = clean(bm[1]);
      if (b.length > 20 && b.length < 500) bullets.push(b);
    }

    // Description
    const descDiv = (html.match(/<div id="productDescription"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)||[])[1];
    const description = descDiv ? clean(descDiv).substring(0,2000) : bullets.join(' ').substring(0,2000) || title;

    // Price
    const priceWhole = (html.match(/class="a-price-whole">([\d,]+)</i)||[])[1];
    const price = priceWhole ? parseFloat(priceWhole.replace(/,/g,'')) : null;

    // Specs
    const specs = [];
    const specRe = /<th[^>]*class="[^"]*prodDetSectionEntry[^"]*"[^>]*>([\s\S]*?)<\/th>[\s\S]*?<td[^>]*class="[^"]*prodDetAttrValue[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
    let sm;
    while ((sm = specRe.exec(html)) !== null) {
      const n = clean(sm[1]), v = clean(sm[2]);
      if (n && v && n.length < 60) specs.push({ name: n, value: v });
    }

    // Images
    const images = [];
    const ir = /"hiRes":"([^"]+)"/g; let im;
    while ((im = ir.exec(html)) !== null) images.push(im[1]);

    // Brand
    const brand = clean((html.match(/<a id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i)||[])[1]||'')
      .replace(/^Visit the\s+/i,'').replace(/\s+Store$/i,'') || null;

    // Rating
    const ratingStr = (html.match(/<span class="a-icon-alt">([0-9.]+) out of 5/i)||[])[1];
    const rating = ratingStr ? parseFloat(ratingStr) : null;
    const reviewStr = (html.match(/([0-9,]+)\s+(?:global\s+)?ratings/i)||[])[1];
    const reviewCount = reviewStr ? parseInt(reviewStr.replace(/,/g,'')) : null;

    return { title, description, price, bullets: bullets.slice(0,5), specs: specs.slice(0,10),
      images: [...new Set(images)].slice(0,4), brand, rating, reviewCount,
      category: detectCategory(title), blocked: false };
  } catch (err) {
    return { title: slugTitle, description: slugTitle, category: detectCategory(slugTitle),
      bullets: [], specs: [], images: [], brand: null, price: null, blocked: false, error: err.message };
  }
}

// ─── GAP ANALYZER ────────────────────────────────────────────────────────────

function runGapAnalysis(data) {
  const title = data.title || '';
  const util = Math.round((title.length / TITLE_LIMIT) * 100);
  const missing = [], issues = [];

  if (util < 50)       issues.push(`Title critically short: ${title.length}/${TITLE_LIMIT} chars (${util}%)`);
  else if (util < 90)  issues.push(`Title underutilized: ${title.length}/${TITLE_LIMIT} chars (${util}%) — target 90-100%`);

  if (!data.brand)                issues.push('Brand name missing from title');
  if (!data.specs?.length)        missing.push('Technical specifications');
  if (!data.bullets?.length)      missing.push('Feature bullet points');
  if (!data.price)                missing.push('Price');
  if (data.bullets?.length < 5)   issues.push(`Only ${data.bullets?.length||0}/5 bullets — Amazon requires 5`);

  const hasMaterial = data.specs?.some(s => /material|fabric|made of/i.test(s.name));
  const hasDimensions = data.specs?.some(s => /dimension|size|length|width|height|weight/i.test(s.name));
  if (!hasMaterial)   missing.push('Material type');
  if (!hasDimensions) missing.push('Dimensions/weight');

  if (/\b(best|#1|top rated|award|free shipping|sale|discount)\b/i.test(title))
    issues.push('Prohibited promotional text in title');

  return { util, title, missing, issues };
}

// ─── PROMPT BUILDER (mirrors PromptBuilder logic) ────────────────────────────

function buildPrompt(data, gap) {
  const PROHIBITED = 'Best, Premium, Professional, Ultimate, Perfect, Amazing, Incredible, Quality, Grade, Pro, Luxury, Exclusive, Superior, Exceptional, Outstanding, Revolutionary, Innovative, Cutting-Edge, State-of-the-Art, Next-Generation, Deluxe, Elite, Plus, Max, Ultra, Super, Extra, Special, Unique, Remarkable, Impressive, Stunning, Beautiful, Elegant, Stylish, Modern, Contemporary, Classic, Traditional, Advanced, Enhanced, Improved, Upgraded, Latest, Newest, Brand-New, All-New';

  const systemInstruction = `You are an ELITE e-commerce SEO specialist optimizing Amazon listings for the Amazon A10 algorithm (2026 standards).

CRITICAL RULES — VIOLATION = AUTOMATIC REJECTION:
1. TITLE MUST BE EXACTLY 180-200 CHARACTERS. Count every character including spaces. If your title is under 180 chars, ADD MORE: compatible devices, use cases, color variants, pack size, warranty info, or additional specs. NEVER submit a title under 180 characters.
2. ZERO prohibited words: ${PROHIBITED}
3. NEVER invent specifications not in the input. Write "[Attribute Missing from Link]" if unknown.
4. DESCRIPTION must be HTML-formatted with <h2> and <ul> tags, minimum 1000 characters.
5. Include a "Technical Specifications" <h2> section in the description.
6. BULLETS: exactly 5, each 150-200 chars, starting with CAPITALIZED BENEFIT — detail.
7. BACKEND KEYWORD BANK: exactly 10 unique long-tail keywords NOT duplicated from the title.
8. Return ONLY valid JSON. No markdown, no preamble.

TITLE FORMAT: [Primary Keyword] + [Type/Model] + [Key Specs] + [Use Cases] + [Compatible With] + [Brand]
TITLE PADDING STRATEGY: If title is under 180 chars, append: compatible devices, color options, pack sizes, warranty, certifications, room/use types, age range, or additional features — all from real product data or general product knowledge.
ALGORITHM: Amazon A10 ranks on relevance, CTR, conversion rate, sales velocity.
SPECIAL RULES: No promotional language. Include specific numbers. Front-load primary keyword in first 80 chars.

MANDATORY TITLE CHECK: Before outputting, count your title characters. If under 180 → STOP and expand it.`;

  const userPrompt = `=== STAGE 1: DEEP LINK ANALYSIS ===
Platform: AMAZON | Title Limit: 200 chars | Current Utilization: ${gap.util}%
Current Title: "${gap.title}"
Brand: ${data.brand || '[Missing]'}
Price: ${data.price ? '$' + data.price : '[Missing]'}
Category: ${data.category || '[Missing]'}
${data.specs?.length ? 'Specifications:\n' + data.specs.map(s => `  - ${s.name}: ${s.value}`).join('\n') : 'Specifications: [None extracted]'}
${gap.missing.length ? '\nMISSING ELEMENTS (do NOT invent):\n' + gap.missing.map(m => `  - ${m}`).join('\n') : ''}
${gap.issues.length ? '\nSEO GAPS:\n' + gap.issues.map(i => `  - ${i}`).join('\n') : ''}

=== STAGE 2: PLATFORM RULES (AMAZON 2026) ===
Title: 180-200 chars | Bullets: 5 x 150-200 chars | Description: 1000+ chars HTML | Keywords: 15 max

=== STAGE 3: PRODUCT INFORMATION ===
Title: ${data.title}
Description: ${(data.description||'').substring(0,1500)}
${data.bullets?.length ? 'Current Bullets:\n' + data.bullets.map((b,i) => `  ${i+1}. ${b}`).join('\n') : ''}

=== REQUIRED JSON OUTPUT ===
{
  "analysisReport": "2-3 sentences on SEO improvements made and why they improve Amazon ranking.",
  "title": "MUST BE 180-200 CHARS — count before submitting — expand with use cases, compatibility, color, pack size if needed",
  "bullets": [
    "CAPITALIZED BENEFIT — detailed feature with specifics, numbers, materials (150-200 chars)",
    "CAPITALIZED BENEFIT — detailed feature with specifics, numbers, materials",
    "CAPITALIZED BENEFIT — detailed feature with specifics, numbers, materials",
    "CAPITALIZED BENEFIT — detailed feature with specifics, numbers, materials",
    "CAPITALIZED BENEFIT — detailed feature with specifics, numbers, materials"
  ],
  "description": "<h2>Product Overview</h2><p>Opening paragraph.</p><h2>Key Features</h2><ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul><h2>Technical Specifications</h2><ul><li>Spec: Value</li></ul><h2>Why Choose This Product</h2><p>Closing paragraph. Total minimum 1000 characters.</p>",
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "backendKeywordBank": ["long-tail 1","long-tail 2","long-tail 3","long-tail 4","long-tail 5","long-tail 6","long-tail 7","long-tail 8","long-tail 9","long-tail 10"],
  "platform_notes": "Brief summary of optimization decisions."
}

STAGE 4 QC — verify before submitting:
- Title is 180-200 chars? (MANDATORY)
- Zero prohibited words?
- No invented specs?
- Description has <h2> and <ul> and Technical Specifications section?
- backendKeywordBank has exactly 10 unique long-tail keywords NOT in title?`;

  return { systemInstruction, userPrompt };
}

// ─── AI CALL (Gemini → Groq fallback) ────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callGeminiDirect(systemInstruction, userPrompt) {
  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 16000, responseMimeType: 'application/json' }
  };
  const { data } = await postJson(
    'generativelanguage.googleapis.com',
    `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    body
  );
  if (data.error) {
    const msg = data.error.message || '';
    const retryMatch = msg.match(/retry in ([0-9.]+)s/i);
    const retryAfter = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
    const err = new Error(`Gemini error: ${msg}`);
    err.isQuota = true;
    err.retryAfter = retryAfter;
    throw err;
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return extractJSON(text);
}

async function callGroqDirect(systemInstruction, userPrompt) {
  const body = {
    model: GROQ_MODEL,
    messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: userPrompt }],
    temperature: 0.5,
    max_tokens: 16000,
    response_format: { type: 'json_object' }
  };
  const { data } = await postJson('api.groq.com', '/openai/v1/chat/completions', body, { 'Authorization': `Bearer ${GROQ_KEY}` });
  if (data.error) throw new Error(`Groq error: ${data.error.message || JSON.stringify(data.error)}`);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return extractJSON(text);
}

function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) try { return JSON.parse(fence[1].trim()); } catch {}
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) try { return JSON.parse(obj[0]); } catch {}
  throw new Error('Could not parse AI JSON response');
}

let geminiQuotaUntil = 0; // timestamp when Gemini quota resets

async function callAI(systemInstruction, userPrompt) {
  const now = Date.now();

  // Try Gemini if quota not exhausted
  if (GEMINI_KEY && now >= geminiQuotaUntil) {
    try {
      const result = await callGeminiDirect(systemInstruction, userPrompt);
      return { result, provider: 'Gemini' };
    } catch (err) {
      if (err.isQuota) {
        geminiQuotaUntil = Date.now() + (err.retryAfter * 1000);
        console.log(`\n  ⚠️  Gemini quota hit — switching to Groq (retry in ${err.retryAfter}s)`);
      } else {
        throw err;
      }
    }
  }

  // Groq fallback
  if (GROQ_KEY) {
    const result = await callGroqDirect(systemInstruction, userPrompt);
    return { result, provider: 'Groq' };
  }

  throw new Error('All AI providers exhausted');
}

// ─── QC CHECKS ───────────────────────────────────────────────────────────────

const BANNED = ['best','premium','professional','ultimate','perfect','amazing','incredible',
  'quality','grade','luxury','exclusive','superior','exceptional','outstanding',
  'revolutionary','innovative','cutting-edge','state-of-the-art','next-generation',
  'deluxe','plus','ultra','super','extra','special','unique','remarkable',
  'impressive','stunning','beautiful','elegant','stylish','modern','contemporary',
  'classic','traditional','advanced','enhanced','improved','upgraded'];
// Note: 'elite', 'pro', 'max' excluded — they appear in legitimate product model names (K-Elite, MacBook Pro, iPad Max)

function qcCheck(result) {
  const title = result.title || '';
  const desc  = result.description || '';
  const bank  = result.backendKeywordBank || [];
  const bullets = result.bullets || [];

  const titleLen  = title.length;
  const titlePct  = Math.round((titleLen / TITLE_LIMIT) * 100);
  const prohibited = BANNED.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(title));
  const hasH2     = desc.includes('<h2>');
  const hasUl     = desc.includes('<ul>');
  const hasTechSpec = /technical spec/i.test(desc);
  const descLen   = desc.replace(/<[^>]+>/g,'').length;
  const bankOk    = bank.length >= 10;
  const bulletsOk = bullets.length === 5;
  const benefitFirst = bullets.filter(b => /^[A-Z][A-Z\s]+\s*[–—-]/.test(b)).length;

  return { titleLen, titlePct, prohibited, hasH2, hasUl, hasTechSpec, descLen, bankOk, bulletsOk, benefitFirst, bank, bullets };
}

function bar(pct) {
  const f = Math.round(Math.min(pct,100) / 2);
  return '[' + '█'.repeat(f) + '░'.repeat(50-f) + ']';
}

function icon(ok) { return ok ? '✅' : '❌'; }

// ─── PRINT RESULT ─────────────────────────────────────────────────────────────

function printResult(label, scraped, gap, result, qc, elapsed) {
  console.log('\n' + SEP);
  console.log(`PRODUCT: ${label}`);
  console.log(SEP);

  // Stage 1 summary
  console.log(`\n[STAGE 1] Scraped: "${scraped.title.substring(0,80)}${scraped.title.length>80?'...':''}"`);
  console.log(`          Brand: ${scraped.brand||'[Missing]'} | Category: ${scraped.category} | Bullets: ${scraped.bullets?.length||0} | Specs: ${scraped.specs?.length||0}`);
  if (scraped.blocked) console.log('          ⚠️  Amazon blocked scrape — used slug fallback');
  console.log(`\n[GAP]     Title ${gap.util}% utilized | ${gap.issues.length} SEO issues | ${gap.missing.length} missing elements`);
  if (gap.issues.length) gap.issues.forEach(i => console.log(`          ✗ ${i}`));
  if (gap.missing.length) gap.missing.forEach(m => console.log(`          ⚠ Missing: ${m}`));

  // Stage 3 output
  console.log(`\n[STAGE 3] OPTIMIZED TITLE (${qc.titleLen} chars):`);
  console.log(`  ${result.title}`);
  console.log(`  ${qc.titlePct >= 90 ? '✅' : qc.titlePct >= 75 ? '⚠️ ' : '❌'} ${bar(qc.titlePct)} ${qc.titlePct}% (${qc.titleLen}/${TITLE_LIMIT})`);

  if (result.analysisReport) {
    console.log(`\n[REPORT]  ${result.analysisReport}`);
  }

  console.log(`\n[BULLETS] ${qc.bulletsOk ? '✅' : '❌'} ${qc.bullets.length}/5 | Benefit-first: ${qc.benefitFirst}/${qc.bullets.length}`);
  qc.bullets.forEach((b,i) => {
    const ok = /^[A-Z][A-Z\s]+\s*[–—-]/.test(b);
    console.log(`  ${ok?'✅':'⚠️ '} ${i+1}. ${b.substring(0,110)}${b.length>110?'...':''}`);
  });

  console.log(`\n[DESC]    ${icon(qc.hasH2)} <h2> tags | ${icon(qc.hasUl)} <ul> tags | ${icon(qc.hasTechSpec)} Tech Specs section | ${icon(qc.descLen>=1000)} ${qc.descLen} chars`);

  console.log(`\n[KEYWORDS] ${(result.keywords||[]).join(' | ')}`);

  console.log(`\n[BACKEND KEYWORD BANK] ${icon(qc.bankOk)} ${qc.bank.length}/10:`);
  qc.bank.forEach((k,i) => console.log(`  ${i+1}. ${k}`));

  // Stage 4 QC summary
  const allPass = qc.titlePct >= 90 && qc.prohibited.length === 0 && qc.hasH2 && qc.hasUl && qc.hasTechSpec && qc.descLen >= 1000 && qc.bankOk && qc.bulletsOk;
  console.log(`\n[STAGE 4 QC]`);
  console.log(`  ${icon(qc.titlePct>=90)} Title utilization: ${qc.titlePct}% (${qc.titleLen}/${TITLE_LIMIT} chars)`);
  console.log(`  ${icon(qc.prohibited.length===0)} Prohibited words: ${qc.prohibited.length===0 ? 'None' : qc.prohibited.join(', ')}`);
  console.log(`  ${icon(qc.hasH2 && qc.hasUl)} HTML structure: <h2>=${qc.hasH2} <ul>=${qc.hasUl}`);
  console.log(`  ${icon(qc.hasTechSpec)} Technical Specifications section`);
  console.log(`  ${icon(qc.descLen>=1000)} Description length: ${qc.descLen} chars`);
  console.log(`  ${icon(qc.bankOk)} Backend keyword bank: ${qc.bank.length}/10`);
  console.log(`  ⏱  Generated in ${elapsed}ms`);
  console.log(`\n  ${allPass ? '🎉 ALL CHECKS PASSED' : '⚠️  SOME CHECKS NEED ATTENTION'}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function runProduct(product, idx, total) {
  console.log(`\n${SEP}`);
  console.log(`[${idx}/${total}] ${product.label}`);
  console.log(`URL: ${product.url}`);
  console.log(sep);

  // Stage 1: Scrape
  process.stdout.write('  Scraping Amazon... ');
  const scraped = await scrapeAmazon(product.url);
  console.log(scraped.blocked ? '⚠️  blocked (fallback)' : `✅ ${scraped.title.substring(0,60)}`);

  // Gap analysis
  const gap = runGapAnalysis(scraped);

  // Stage 3: AI generation
  process.stdout.write('  Calling AI... ');
  const { systemInstruction, userPrompt } = buildPrompt(scraped, gap);
  const t0 = Date.now();
  const { result, provider } = await callAI(systemInstruction, userPrompt);
  const elapsed = Date.now() - t0;
  console.log(`✅ ${provider} — ${elapsed}ms`);

  // Stage 4: QC
  const qc = qcCheck(result);
  printResult(product.label, scraped, gap, result, qc, elapsed);

  return {
    label: product.label,
    titlePct: qc.titlePct,
    prohibited: qc.prohibited.length,
    htmlOk: qc.hasH2 && qc.hasUl && qc.hasTechSpec,
    descOk: qc.descLen >= 1000,
    bankOk: qc.bankOk,
    bulletsOk: qc.bulletsOk,
    pass: qc.titlePct >= 90 && qc.prohibited.length === 0 && qc.hasH2 && qc.hasUl && qc.hasTechSpec && qc.descLen >= 1000 && qc.bankOk && qc.bulletsOk,
  };
}

async function main() {
  console.log(SEP);
  console.log('AMAZON MULTI-PRODUCT 4-STAGE PIPELINE TEST');
  console.log(`Testing ${PRODUCTS.length} products across different categories`);
  console.log(`AI providers: Gemini (${GEMINI_KEY ? '✅' : '❌'}) → Groq fallback (${GROQ_KEY ? '✅' : '❌'})`);
  console.log(SEP);

  const results = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    try {
      const r = await runProduct(PRODUCTS[i], i + 1, PRODUCTS.length);
      results.push(r);
    } catch (err) {
      console.log(`\n❌ FAILED: ${PRODUCTS[i].label} — ${err.message}`);
      results.push({ label: PRODUCTS[i].label, pass: false, error: err.message });
    }
    // Small delay between products to avoid rate limits
    if (i < PRODUCTS.length - 1) {
      process.stdout.write('\n  Waiting 3s before next product...');
      await new Promise(r => setTimeout(r, 3000));
      console.log(' done');
    }
  }

  // Final summary
  console.log('\n' + SEP);
  console.log('FINAL SUMMARY');
  console.log(SEP);
  console.log(`${'Product'.padEnd(35)} ${'Title%'.padStart(7)} ${'Banned'.padStart(7)} ${'HTML'.padStart(5)} ${'Desc'.padStart(5)} ${'Bank'.padStart(5)} ${'Result'.padStart(8)}`);
  console.log(sep);
  results.forEach(r => {
    if (r.error) {
      console.log(`${r.label.substring(0,35).padEnd(35)} ${'ERROR'.padStart(7)} — ${r.error.substring(0,40)}`);
    } else {
      console.log(
        `${r.label.substring(0,35).padEnd(35)} ` +
        `${(r.titlePct+'%').padStart(7)} ` +
        `${(r.prohibited===0?'✅':'❌').padStart(7)} ` +
        `${(r.htmlOk?'✅':'❌').padStart(5)} ` +
        `${(r.descOk?'✅':'❌').padStart(5)} ` +
        `${(r.bankOk?'✅':'❌').padStart(5)} ` +
        `${(r.pass?'✅ PASS':'❌ FAIL').padStart(8)}`
      );
    }
  });
  const passed = results.filter(r => r.pass).length;
  console.log(sep);
  console.log(`PASSED: ${passed}/${results.length}`);
  console.log(SEP + '\n');
}

main().catch(err => { console.error('\n💥 Fatal:', err.message); process.exit(1); });
