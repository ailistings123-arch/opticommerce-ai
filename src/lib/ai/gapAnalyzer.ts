/**
 * Gap Analyzer — Stage 1 of the 4-Stage Optimization Formula
 * Performs deep analysis of scraped product data against 2026 SEO standards
 * before any AI generation occurs.
 */

import { GapAnalysis } from './types';
import { AnalyzedUrlData } from '@/lib/services/UrlAnalyzerService';

// Platform title limits — 2026 Operational Protocol
const PLATFORM_TITLE_LIMITS: Record<string, number> = {
  amazon: 200,   // target 80-120, hard max 200
  walmart: 75,   // strictly 50-75 (avoid Search Suppressed)
  ebay: 80,      // strictly 80 — maximize every character
  etsy: 140,     // strict 140 limit
  shopify: 70,
  woocommerce: 70,
};

// Platform title minimums — 2026 Operational Protocol
const PLATFORM_TITLE_MINS: Record<string, number> = {
  amazon: 80,
  walmart: 50,
  ebay: 75,
  etsy: 100,
  shopify: 40,
  woocommerce: 40,
};

// Platform-specific required elements for 2026 compliance
const PLATFORM_REQUIRED_ELEMENTS: Record<string, string[]> = {
  amazon: [
    'brand name',
    'product type',
    'key specifications (dimensions, material, model)',
    'primary use case or benefit',
    'compatibility or size/color variant',
  ],
  walmart: [
    'brand name (first word)',
    'product name',
    'model number',
    'style or color',
    'pack count or size',
  ],
  ebay: [
    'brand + Model/MPN (first)',
    'product type',
    'condition (New/Used/Refurbished)',
    'key specification (size/color)',
    'compatibility',
  ],
  etsy: [
    'primary keyword in first 40 chars',
    'gifting occasion keyword (Gift for Her, Birthday, Wedding)',
    'recipient keyword',
    'style or material',
    'handmade/handcrafted indicator',
  ],
  shopify: [
    'primary SEO keyword',
    'brand name',
    'product name',
    'key differentiating feature',
  ],
  woocommerce: [
    'primary SEO keyword',
    'brand name',
    'product name',
    'key differentiating feature',
  ],
};

export class GapAnalyzer {
  /**
   * Perform Stage 1 deep gap analysis on scraped URL data
   */
  static analyze(urlData: AnalyzedUrlData, platform: string): GapAnalysis {
    const titleLimit = PLATFORM_TITLE_LIMITS[platform] || 200;
    const currentTitle = urlData.title || '';
    const currentTitleLength = currentTitle.length;
    const titleUtilization = Math.round((currentTitleLength / titleLimit) * 100);

    const missingElements: string[] = [];
    const seoIssues: string[] = [];

    // ── Title analysis ──────────────────────────────────────────────────────
    const titleMin = PLATFORM_TITLE_MINS[platform] || 40;
    if (currentTitleLength < titleMin) {
      seoIssues.push(`Title too short: ${currentTitleLength}/${titleLimit} chars — minimum is ${titleMin} for ${platform}`);
    } else if (titleUtilization < 80) {
      seoIssues.push(`Title underutilized: ${currentTitleLength}/${titleLimit} chars (${titleUtilization}%) — target 90%+`);
    }

    // ── Missing data elements ────────────────────────────────────────────────
    if (!urlData.brand) missingElements.push('Brand name');
    if (!urlData.specifications?.length) missingElements.push('Technical specifications (dimensions, material, model #)');
    if (!urlData.bullets?.length) missingElements.push('Feature bullet points');
    if (!urlData.description || urlData.description.length < 100) missingElements.push('Product description');
    if (!urlData.category) missingElements.push('Product category');

    // ── Extract key data for AI context ─────────────────────────────────────
    const specs = urlData.specifications || [];
    const material = specs.find(s =>
      /material|fabric|made of|composition/i.test(s.name)
    );
    const dimensions = specs.find(s =>
      /dimension|size|length|width|height|weight/i.test(s.name)
    );
    const model = specs.find(s =>
      /model|part number|sku|asin/i.test(s.name)
    );

    if (!material) missingElements.push('Material type');
    if (!dimensions) missingElements.push('Dimensions or size');

    // ── Platform-specific rule checks ────────────────────────────────────────
    const requiredElements = PLATFORM_REQUIRED_ELEMENTS[platform] || [];
    const titleLower = currentTitle.toLowerCase();
    const descLower = (urlData.description || '').toLowerCase();

    if (platform === 'amazon') {
      if (!urlData.brand || !titleLower.includes(urlData.brand.toLowerCase())) {
        seoIssues.push('Brand name missing from title — Amazon A10 requires brand in title');
      }
      if (!/\d/.test(currentTitle)) {
        seoIssues.push('No numeric specifications in title — add dimensions, count, or capacity');
      }
      if (!urlData.bullets || urlData.bullets.length < 5) {
        seoIssues.push(`Only ${urlData.bullets?.length || 0}/5 bullet points — Amazon requires exactly 5 benefit-driven bullets`);
      }
      // Check for prohibited symbols
      const prohibitedSymbols = ['™', '!', '*', '©', '®'];
      const foundSymbols = prohibitedSymbols.filter(s => currentTitle.includes(s));
      if (foundSymbols.length > 0) {
        seoIssues.push(`Prohibited symbols in title: ${foundSymbols.join(', ')} — Amazon A10 will suppress listing`);
      }
      // Check for all-caps words
      if (/\b[A-Z]{3,}\b/.test(currentTitle)) {
        seoIssues.push('ALL-CAPS words detected in title — prohibited by Amazon A10');
      }
    }

    if (platform === 'walmart') {
      if (currentTitleLength < 50 || currentTitleLength > 75) {
        seoIssues.push(`Walmart title must be 50-75 chars (currently ${currentTitleLength}) — outside range triggers Search Suppressed`);
      }
      if (urlData.brand && !currentTitle.startsWith(urlData.brand)) {
        seoIssues.push('Brand name must be the first word in Walmart title');
      }
      if (!urlData.description || urlData.description.split(/\s+/).length < 150) {
        seoIssues.push('Description under 150 words — Walmart requires 150-word minimum paragraph for Listing Quality Score');
      }
    }

    if (platform === 'ebay') {
      if (currentTitleLength < 75) {
        seoIssues.push(`eBay title only ${currentTitleLength}/80 chars — maximize every character for Cassini ranking`);
      }
      const ebayFluff = ['l@@k', 'wow', 'fast shipping', 'must see', 'great deal'];
      const foundFluff = ebayFluff.filter(f => titleLower.includes(f));
      if (foundFluff.length > 0) {
        seoIssues.push(`Fluff words in eBay title: "${foundFluff.join(', ')}" — Cassini penalizes these`);
      }
    }

    if (platform === 'etsy') {
      const first40 = currentTitle.substring(0, 40).toLowerCase();
      const giftKeywords = ['gift', 'birthday', 'wedding', 'anniversary', 'christmas', 'holiday', 'personalized', 'custom'];
      const hasGiftInFirst40 = giftKeywords.some(k => first40.includes(k));
      if (!hasGiftInFirst40 && !giftKeywords.some(k => titleLower.includes(k) || descLower.includes(k))) {
        seoIssues.push('Missing gifting/occasion keywords — critical for Etsy Gift & Intent AI ranking');
      }
      if (!currentTitle.includes('|') && !currentTitle.includes(',')) {
        seoIssues.push('Etsy title lacks pipe (|) separators between keyword phrases');
      }
    }

    if (platform === 'shopify' || platform === 'woocommerce') {
      if (currentTitleLength > 60) {
        seoIssues.push(`SEO meta title exceeds 60 chars (${currentTitleLength}) — Google truncates in search results`);
      }
    }

    // ── Benefit-driven hooks check ───────────────────────────────────────────
    const hasPromotionalText = /\b(best|#1|top rated|award|free shipping|sale|discount)\b/i.test(currentTitle);
    if (hasPromotionalText) {
      seoIssues.push('Title contains prohibited promotional text — will be rejected by platform algorithm');
    }

    const hasBenefitHooks = urlData.bullets?.some(b => /^[A-Z\s]+\s*[–—-]/.test(b));
    if (!hasBenefitHooks) {
      seoIssues.push('Lacks benefit-driven hooks in bullets — 2026 standard requires CAPITALIZED BENEFIT first');
    }

    // ── Build summary ────────────────────────────────────────────────────────
    const issueCount = missingElements.length + seoIssues.length;
    let summary: string;

    if (issueCount === 0) {
      summary = `Listing is well-structured with ${titleUtilization}% title utilization. Minor keyword density improvements possible for 2026 algorithm compliance.`;
    } else if (issueCount <= 3) {
      summary = `Listing has ${issueCount} SEO gaps: ${seoIssues[0] || missingElements[0]}. Title uses ${titleUtilization}% of the ${titleLimit}-character limit. Optimization will target ${platform} 2026 ranking factors.`;
    } else {
      summary = `Listing has ${issueCount} critical SEO gaps including ${missingElements.slice(0, 2).join(', ')}. Title is severely underutilized at ${titleUtilization}% (${currentTitleLength}/${titleLimit} chars). Full rewrite required to meet 2026 ${platform} standards.`;
    }

    return {
      platform,
      currentTitle,
      currentTitleLength,
      titleLimit,
      titleUtilization,
      missingElements,
      seoIssues,
      extractedData: {
        productName: urlData.title,
        brand: urlData.brand,
        model: model?.value,
        material: material?.value,
        dimensions: dimensions ? `${dimensions.value}${dimensions.unit ? ' ' + dimensions.unit : ''}` : undefined,
        price: urlData.price ? `$${urlData.price}` : undefined,
        specifications: specs.slice(0, 10).map(s => ({ name: s.name, value: `${s.value}${s.unit ? ' ' + s.unit : ''}` })),
      },
      summary,
    };
  }
}
