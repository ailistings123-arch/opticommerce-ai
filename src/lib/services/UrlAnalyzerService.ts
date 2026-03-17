/**
 * URL Analyzer Service — Unified scraper for all e-commerce platforms
 * Strategy: JSON-LD → meta tags → HTML selectors → URL slug fallback
 */

export interface AnalyzedUrlData {
  title: string;
  description: string;
  price?: number;
  images?: string[];
  specifications?: Array<{ name: string; value: string; unit?: string }>;
  bullets?: string[];
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
}

// Rotate user agents to reduce bot detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function baseHeaders(referer?: string): Record<string, string> {
  return {
    'User-Agent': randomUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'no-cache',
    'DNT': '1',
    ...(referer ? { 'Referer': referer } : {}),
  };
}

export class UrlAnalyzerService {
  static async analyzeUrl(url: string): Promise<AnalyzedUrlData> {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    if (host.includes('amazon')) return this.analyzeAmazon(url);
    if (host.includes('ebay')) return this.analyzeEbay(url);
    if (host.includes('etsy')) return this.analyzeEtsy(url);
    if (host.includes('walmart')) return this.analyzeWalmart(url);
    return this.analyzeGeneric(url);
  }

  // ─── SHARED UTILITIES ────────────────────────────────────────────────────

  /** Extract JSON-LD Product schema — works on most modern e-commerce sites */
  private static extractJsonLd(html: string): AnalyzedUrlData | null {
    const matches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of matches) {
      try {
        const data = JSON.parse(m[1]);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          const product = item['@type'] === 'Product' ? item
            : item['@graph']?.find((n: any) => n['@type'] === 'Product');
          if (!product) continue;

          const name = product.name || '';
          if (!name) continue;

          const desc = product.description || '';
          let price: number | undefined;
          const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
          if (offer?.price) price = parseFloat(offer.price);

          const images: string[] = [];
          if (product.image) {
            const imgs = Array.isArray(product.image) ? product.image : [product.image];
            imgs.forEach((img: any) => {
              const src = typeof img === 'string' ? img : img?.url || img?.contentUrl || '';
              if (src) images.push(src);
            });
          }

          const specs: Array<{ name: string; value: string }> = [];
          if (product.additionalProperty) {
            (Array.isArray(product.additionalProperty) ? product.additionalProperty : [product.additionalProperty])
              .forEach((p: any) => {
                if (p.name && p.value) specs.push({ name: p.name, value: String(p.value) });
              });
          }

          return {
            title: name,
            description: desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000),
            price,
            images: images.slice(0, 6),
            specifications: specs.slice(0, 10),
            brand: typeof product.brand === 'string' ? product.brand : product.brand?.name,
            rating: product.aggregateRating?.ratingValue ? parseFloat(product.aggregateRating.ratingValue) : undefined,
            reviewCount: product.aggregateRating?.reviewCount ? parseInt(product.aggregateRating.reviewCount) : undefined,
            category: product.category || undefined,
          };
        }
      } catch { /* skip malformed JSON-LD */ }
    }
    return null;
  }

  /** Extract Open Graph / meta tag data — universal fallback */
  private static extractMeta(html: string): Partial<AnalyzedUrlData> {
    const get = (pattern: RegExp) => html.match(pattern)?.[1]?.trim() || '';
    const title = get(/<meta property="og:title" content="([^"]+)"/i)
      || get(/<meta name="twitter:title" content="([^"]+)"/i)
      || get(/<title>([^<|]+)/i);
    const description = get(/<meta property="og:description" content="([^"]+)"/i)
      || get(/<meta name="description" content="([^"]+)"/i);
    const image = get(/<meta property="og:image" content="([^"]+)"/i);
    const priceStr = get(/<meta property="product:price:amount" content="([^"]+)"/i)
      || get(/<meta property="og:price:amount" content="([^"]+)"/i);
    const brand = get(/<meta property="product:brand" content="([^"]+)"/i);

    return {
      title: title.replace(/\s*[|\-–—].*$/, '').trim(),
      description: description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
      images: image ? [image] : [],
      price: priceStr ? parseFloat(priceStr) : undefined,
      brand: brand || undefined,
    };
  }

  /** Decode HTML entities and strip tags */
  private static clean(s: string): string {
    return s
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/&ndash;/g, '-').replace(/&mdash;/g, '-')
      .replace(/\s+/g, ' ').trim();
  }

  /** Extract title from URL slug as last-resort fallback */
  private static slugTitle(url: string): string {
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/').filter(Boolean);
      // Find the most descriptive segment (longest, not a pure number)
      const best = parts
        .filter(p => !/^\d+$/.test(p) && p.length > 3)
        .sort((a, b) => b.length - a.length)[0] || parts[parts.length - 1] || '';
      return best.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
    } catch { return ''; }
  }

  /** Detect product category from text */
  private static detectCategory(text: string): string {
    const t = text.toLowerCase();
    if (/curling|hair|straighten|flat iron|wand|shampoo|conditioner|blow dry/.test(t)) return 'Hair Care';
    if (/keyboard|mouse|laptop|monitor|headphone|speaker|webcam|usb|bluetooth/.test(t)) return 'Electronics';
    if (/shirt|pants|dress|jacket|shoes|sneaker|hoodie|jeans|clothing/.test(t)) return 'Clothing';
    if (/toy|game|puzzle|lego|doll|action figure/.test(t)) return 'Toys';
    if (/vitamin|supplement|protein|probiotic|omega/.test(t)) return 'Health';
    if (/coffee|blender|air fryer|instant pot|cookware|knife|pan/.test(t)) return 'Kitchen';
    if (/sofa|chair|desk|bed|mattress|shelf|lamp|furniture/.test(t)) return 'Home & Furniture';
    if (/cream|serum|moisturizer|lotion|cleanser|sunscreen|makeup/.test(t)) return 'Beauty';
    if (/dog|cat|pet|collar|leash|treat|aquarium/.test(t)) return 'Pet Supplies';
    if (/book|novel|textbook|guide|manual/.test(t)) return 'Books';
    if (/tire|car|truck|auto|vehicle|motor/.test(t)) return 'Automotive';
    if (/yoga|gym|dumbbell|resistance|treadmill|bicycle/.test(t)) return 'Sports & Fitness';
    return 'General';
  }

  // ─── AMAZON ──────────────────────────────────────────────────────────────

  private static async analyzeAmazon(url: string): Promise<AnalyzedUrlData> {
    const asin = url.match(/\/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i)?.[1] || null;
    const slugTitle = this.slugTitle(url);

    try {
      const res = await fetch(url.split('?')[0], { headers: baseHeaders() });
      const html = await res.text();

      // Bot check — Amazon CAPTCHA page is small and has specific markers
      const isBlocked = html.includes('Enter the characters you see below') ||
        html.includes('<title>Robot Check</title>') ||
        html.includes('Type the characters you see in this image') ||
        html.length < 5000;
      if (isBlocked) {
        return this.amazonFallback(slugTitle, asin);
      }

      // Try JSON-LD first
      const ld = this.extractJsonLd(html);
      if (ld?.title && ld.title.length > 10) {
        return { ...ld, category: ld.category || this.detectCategory(ld.title) };
      }

      // HTML extraction
      const title = this.clean(
        html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ||
        html.match(/<h1[^>]*id="title"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''
      ).replace(/^Amazon\.com\s*:\s*/i, '') || slugTitle;

      const bullets: string[] = [];
      const bulletsSection = html.match(/id="feature-bullets"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)?.[1] || html;
      let bm: RegExpExecArray | null;
      const br = /<span class="a-list-item">([\s\S]*?)<\/span>/gi;
      while ((bm = br.exec(bulletsSection)) !== null) {
        const b = this.clean(bm[1]);
        if (b.length > 20) bullets.push(b);
      }

      const descDiv = html.match(/<div id="productDescription"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)?.[1];
      const description = descDiv ? this.clean(descDiv).substring(0, 2000)
        : bullets.join(' ').substring(0, 2000) || 'Amazon product';

      const priceWhole = html.match(/class="a-price-whole">([\d,]+)</i)?.[1];
      const price = priceWhole ? parseFloat(priceWhole.replace(/,/g, '')) : undefined;

      const specs: Array<{ name: string; value: string }> = [];
      const specRe = /<th[^>]*class="[^"]*prodDetSectionEntry[^"]*"[^>]*>([\s\S]*?)<\/th>[\s\S]*?<td[^>]*class="[^"]*prodDetAttrValue[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
      let sm: RegExpExecArray | null;
      while ((sm = specRe.exec(html)) !== null) {
        const n = this.clean(sm[1]); const v = this.clean(sm[2]);
        if (n && v) specs.push({ name: n, value: v });
      }

      const images: string[] = [];
      let im: RegExpExecArray | null;
      const ir = /"hiRes":"([^"]+)"/g;
      while ((im = ir.exec(html)) !== null) images.push(im[1]);

      const brand = this.clean(html.match(/<a id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i)?.[1] || '')
        .replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '') || undefined;

      return {
        title: title || slugTitle || 'Amazon Product',
        description,
        price,
        bullets: bullets.slice(0, 5),
        images: images.slice(0, 6),
        specifications: specs.slice(0, 10),
        brand,
        category: this.detectCategory(title),
        rating: html.match(/<span class="a-icon-alt">([0-9.]+) out of 5/i)?.[1] ? parseFloat(html.match(/<span class="a-icon-alt">([0-9.]+) out of 5/i)![1]) : undefined,
      };
    } catch {
      return this.amazonFallback(slugTitle, asin);
    }
  }

  private static amazonFallback(slugTitle: string, asin: string | null): AnalyzedUrlData {
    return {
      title: slugTitle || `Amazon Product${asin ? ` (ASIN: ${asin})` : ''}`,
      description: `${slugTitle || 'Amazon product'}. Amazon blocks automated access — the AI will optimize based on the product name.`,
      category: this.detectCategory(slugTitle),
      images: [], bullets: [], specifications: [],
    };
  }

  // ─── WALMART ─────────────────────────────────────────────────────────────

  private static async analyzeWalmart(url: string): Promise<AnalyzedUrlData> {
    const cleanUrl = url.split('?')[0];
    const itemId = url.match(/\/ip\/(?:[^/]+\/)?(\d+)/)?.[1] || null;
    const slugTitle = this.slugTitle(cleanUrl);

    try {
      const res = await fetch(cleanUrl, { headers: baseHeaders() });
      const html = await res.text();

      // Bot detection check — must be specific, not just the word "robot"
      const isBlocked = html.includes('Robot or human?') || 
        html.includes('<title>Robot or human?</title>') ||
        (html.includes('robot-check') && html.length < 20000) ||
        html.length < 5000;
      
      if (isBlocked) {
        console.warn('[UrlAnalyzer] Walmart bot-detection — using slug fallback');
        return this.walmartSlugFallback(slugTitle, itemId);
      }

      // 1. Try __NEXT_DATA__ JSON (most reliable when available)
      const nextData = this.extractWalmartNextData(html);
      if (nextData) return nextData;

      // 2. Try JSON-LD
      const ld = this.extractJsonLd(html);
      if (ld?.title && ld.title.length > 10) {
        return { ...ld, category: ld.category || this.detectCategory(ld.title) };
      }

      // 3. Meta tags
      const meta = this.extractMeta(html);
      if (meta.title && meta.title.length > 10) {
        return {
          title: meta.title,
          description: meta.description || `${meta.title} — available at Walmart.`,
          price: meta.price,
          images: meta.images || [],
          brand: meta.brand,
          category: this.detectCategory(meta.title),
          bullets: [], specifications: [],
        };
      }

      return this.walmartSlugFallback(slugTitle, itemId);
    } catch {
      return this.walmartSlugFallback(slugTitle, itemId);
    }
  }

  private static extractWalmartNextData(html: string): AnalyzedUrlData | null {
    try {
      const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
      if (!raw) return null;
      const json = JSON.parse(raw);

      // Try multiple paths Walmart uses
      const product =
        json?.props?.pageProps?.initialData?.data?.product ||
        json?.props?.pageProps?.initialData?.data?.idmlData ||
        json?.props?.pageProps?.initialData?.data?.contentLayout?.modules
          ?.find((m: any) => m?.configs?.product)?.configs?.product ||
        null;

      if (!product?.name) return null;

      const desc = (product.longDescription || product.shortDescription || product.description || '')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000);

      let price: number | undefined;
      const pi = product.priceInfo?.currentPrice || product.priceInfo;
      if (pi?.price) price = parseFloat(pi.price);
      else if (typeof pi === 'number') price = pi;

      const images: string[] = [];
      const allImgs = product.imageInfo?.allImages || product.images || [];
      (Array.isArray(allImgs) ? allImgs : []).forEach((img: any) => {
        const src = typeof img === 'string' ? img : img?.url || img?.src || '';
        if (src?.startsWith('http')) images.push(src);
      });
      if (product.imageInfo?.thumbnailUrl) images.unshift(product.imageInfo.thumbnailUrl);

      const specs: Array<{ name: string; value: string }> = [];
      (product.specifications || product.productAttributes || []).forEach((s: any) => {
        const n = s?.name || s?.key || ''; const v = s?.value || s?.values?.join(', ') || '';
        if (n && v) specs.push({ name: n, value: v });
      });

      const bullets: string[] = [];
      (product.keyFeatures || product.highlights || []).forEach((f: any) => {
        const t = typeof f === 'string' ? f : f?.description || f?.text || '';
        if (t) bullets.push(this.clean(t));
      });

      return {
        title: product.name,
        description: desc || `${product.name} — available at Walmart.`,
        price,
        brand: product.brand || product.brandName || undefined,
        images: [...new Set(images)].slice(0, 6),
        specifications: specs.slice(0, 10),
        bullets: bullets.slice(0, 6),
        category: product.category?.name || this.detectCategory(product.name),
        rating: product.averageRating ? parseFloat(product.averageRating) : undefined,
        reviewCount: product.numberOfReviews ? parseInt(product.numberOfReviews) : undefined,
      };
    } catch { return null; }
  }

  private static walmartSlugFallback(slugTitle: string, itemId: string | null): AnalyzedUrlData {
    const category = this.detectCategory(slugTitle);
    const brand = slugTitle.split(' ')[0] || '';
    return {
      title: slugTitle || `Walmart Product${itemId ? ` #${itemId}` : ''}`,
      description: `Product: ${slugTitle}. Brand: ${brand}. Physical product sold at Walmart. Category: ${category}.`,
      category,
      brand,
      images: [], bullets: [], specifications: [],
    };
  }

  // ─── ETSY ─────────────────────────────────────────────────────────────────

  private static async analyzeEtsy(url: string): Promise<AnalyzedUrlData> {
    const cleanUrl = url.split('?')[0];
    const slugTitle = this.slugTitle(cleanUrl);

    try {
      const res = await fetch(cleanUrl, { headers: baseHeaders('https://www.etsy.com/') });

      if (res.status === 403 || res.status === 429 || res.status >= 500) {
        return this.etsySlugFallback(cleanUrl, slugTitle);
      }

      const html = await res.text();
      if (html.length < 3000 || html.includes('Access Denied')) return this.etsySlugFallback(cleanUrl, slugTitle);

      // JSON-LD first
      const ld = this.extractJsonLd(html);
      if (ld?.title && ld.title.length > 10) {
        return { ...ld, category: ld.category || 'Handmade' };
      }

      // Meta tags
      const meta = this.extractMeta(html);
      const title = (meta.title || slugTitle).replace(/\s*\|\s*Etsy.*$/i, '').trim();

      const description = meta.description || '';
      const price = meta.price;
      const images: string[] = meta.images || [];

      // Etsy-specific image extraction
      const imgRe = /<img[^>]+src="([^"]+il_(?:fullxfull|1588xN|794xN)[^"]+)"[^>]*>/gi;
      let im: RegExpExecArray | null;
      while ((im = imgRe.exec(html)) !== null) {
        if (!images.includes(im[1])) images.push(im[1]);
      }

      return {
        title: title || slugTitle || 'Etsy Product',
        description: description || `${title} — handmade product on Etsy.`,
        price,
        images: images.slice(0, 6),
        category: 'Handmade',
        brand: meta.brand,
        bullets: [], specifications: [],
      };
    } catch {
      return this.etsySlugFallback(cleanUrl, slugTitle);
    }
  }

  private static etsySlugFallback(url: string, slugTitle: string): AnalyzedUrlData {
    const productId = url.match(/\/listing\/(\d+)/)?.[1] || '';
    return {
      title: slugTitle || 'Etsy Product',
      description: `${slugTitle || 'Handmade product'} on Etsy${productId ? ` (Listing #${productId})` : ''}. Handmade/digital product.`,
      category: 'Handmade',
      images: [], bullets: [], specifications: [],
    };
  }

  // ─── EBAY ─────────────────────────────────────────────────────────────────

  private static async analyzeEbay(url: string): Promise<AnalyzedUrlData> {
    const slugTitle = this.slugTitle(url);
    try {
      const res = await fetch(url, { headers: baseHeaders('https://www.ebay.com/') });
      const html = await res.text();

      // JSON-LD first
      const ld = this.extractJsonLd(html);
      if (ld?.title && ld.title.length > 10) {
        return { ...ld, category: ld.category || this.detectCategory(ld.title) };
      }

      // Meta tags
      const meta = this.extractMeta(html);
      const title = meta.title || this.clean(
        html.match(/<h1 class="x-item-title__mainTitle"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''
      ) || slugTitle;

      const description = meta.description || this.clean(
        html.match(/<div class="x-item-description"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || ''
      ).substring(0, 2000);

      const specs: Array<{ name: string; value: string }> = [];
      const specRe = /<dt class="ux-labels-values__labels"[^>]*><span[^>]*>([^<]+)<\/span><\/dt>[\s\S]*?<dd class="ux-labels-values__values"[^>]*><span[^>]*>([^<]+)<\/span><\/dd>/gi;
      let sm: RegExpExecArray | null;
      while ((sm = specRe.exec(html)) !== null) {
        const n = sm[1].trim(); const v = sm[2].trim();
        if (n && v) specs.push({ name: n, value: v });
      }

      return {
        title: title || slugTitle || 'eBay Product',
        description: description || `${title} — available on eBay.`,
        price: meta.price,
        images: meta.images || [],
        specifications: specs.slice(0, 15),
        brand: meta.brand,
        category: this.detectCategory(title),
        bullets: [],
      };
    } catch {
      return {
        title: slugTitle || 'eBay Product',
        description: `${slugTitle} — available on eBay.`,
        category: this.detectCategory(slugTitle),
        images: [], bullets: [], specifications: [],
      };
    }
  }

  // ─── GENERIC (Shopify, WooCommerce, any store) ────────────────────────────

  private static async analyzeGeneric(url: string): Promise<AnalyzedUrlData> {
    const slugTitle = this.slugTitle(url);
    try {
      // Try Shopify product JSON endpoint first
      const shopifyJsonUrl = url.replace(/\?.*$/, '') + '.json';
      try {
        const sjRes = await fetch(shopifyJsonUrl, { headers: baseHeaders() });
        if (sjRes.ok) {
          const sj = await sjRes.json();
          const p = sj?.product;
          if (p?.title) {
            const variant = p.variants?.[0];
            const images = (p.images || []).map((i: any) => i.src).filter(Boolean);
            const specs: Array<{ name: string; value: string }> = [];
            if (p.options) {
              p.options.forEach((o: any) => {
                if (o.name && o.values?.length) specs.push({ name: o.name, value: o.values.join(', ') });
              });
            }
            return {
              title: p.title,
              description: this.clean(p.body_html || '').substring(0, 2000) || `${p.title} — available in store.`,
              price: variant?.price ? parseFloat(variant.price) : undefined,
              images: images.slice(0, 6),
              specifications: specs,
              brand: p.vendor || undefined,
              category: p.product_type || this.detectCategory(p.title),
              bullets: [],
            };
          }
        }
      } catch { /* not Shopify */ }

      // Generic HTML fetch
      const res = await fetch(url, { headers: baseHeaders() });
      if (!res.ok) return this.genericFallback(slugTitle);

      const html = await res.text();

      // JSON-LD
      const ld = this.extractJsonLd(html);
      if (ld?.title && ld.title.length > 10) {
        return { ...ld, category: ld.category || this.detectCategory(ld.title) };
      }

      // Meta tags
      const meta = this.extractMeta(html);
      const title = meta.title || this.clean(html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] || '') || slugTitle;

      // Try WooCommerce-specific selectors
      const wcDesc = html.match(/<div class="woocommerce-product-details__short-description"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
      const description = wcDesc ? this.clean(wcDesc).substring(0, 2000)
        : meta.description || this.clean(html.match(/<div[^>]*class="[^"]*product[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '').substring(0, 2000)
        || `${title} — product available in store.`;

      const specs: Array<{ name: string; value: string }> = [];
      const attrRe = /<tr[^>]*>[\s\S]*?<th[^>]*>([^<]+)<\/th>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<\/tr>/gi;
      let am: RegExpExecArray | null;
      while ((am = attrRe.exec(html)) !== null) {
        const n = this.clean(am[1]); const v = this.clean(am[2]);
        if (n && v && n.length < 60) specs.push({ name: n, value: v });
      }

      const images: string[] = meta.images || [];
      const imgRe = /<img[^>]+(?:src|data-src)="(https?:[^"]+)"[^>]*class="[^"]*(?:product|wp-post-image|attachment)[^"]*"/gi;
      let imgM: RegExpExecArray | null;
      while ((imgM = imgRe.exec(html)) !== null) {
        if (!images.includes(imgM[1])) images.push(imgM[1]);
      }

      return {
        title: title || slugTitle || 'Product',
        description,
        price: meta.price,
        images: images.slice(0, 6),
        specifications: specs.slice(0, 10),
        brand: meta.brand,
        category: this.detectCategory(title),
        bullets: [],
      };
    } catch {
      return this.genericFallback(slugTitle);
    }
  }

  private static genericFallback(slugTitle: string): AnalyzedUrlData {
    return {
      title: slugTitle || 'Product',
      description: `${slugTitle || 'Product'} — available in store.`,
      category: this.detectCategory(slugTitle),
      images: [], bullets: [], specifications: [],
    };
  }
}
