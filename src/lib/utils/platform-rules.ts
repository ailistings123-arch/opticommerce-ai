import { PlatformRules, Platform } from '@/types';

// Single source of truth — kept in sync with Engine classes and promptBuilder
export const PLATFORM_RULES: Record<Platform, PlatformRules> = {
  amazon: {
    name: 'Amazon',
    titleRange: { min: 150, max: 200 },
    minDescription: 1000,
    maxTags: 15,
    tagFormat: 'Backend search terms',
    guidelines: [
      'Front-load primary keyword in first 80 characters',
      'Use Title Case capitalization',
      'Include brand, key features, product type, size, and color',
      'No promotional language (Best, #1, Top Rated)',
      'Include specific numbers, dimensions, and specifications',
      'Optimize for mobile display (first 80 chars visible)',
    ],
  },
  shopify: {
    name: 'Shopify',
    titleRange: { min: 55, max: 70 },
    minDescription: 300,
    maxTags: 10,
    tagFormat: 'Product tags',
    guidelines: [
      'Optimize for Google search — title is the SEO title tag',
      'Natural, clickable language — write for humans first',
      'Include primary keyword user would Google',
      'Meta description in first 160 chars of description',
      'Focus on long-tail keywords',
    ],
  },
  etsy: {
    name: 'Etsy',
    titleRange: { min: 100, max: 140 },
    minDescription: 500,
    maxTags: 13,
    tagFormat: 'Multi-word phrases (max 20 chars each)',
    guidelines: [
      'STRICT 140-character title limit — never exceed',
      'Use pipe (|) separators between key phrases',
      'Include gift occasions (Gift for Her, Birthday Gift)',
      'Mention handmade/handcrafted where applicable',
      'Use all 13 tags strategically',
      'Include material and style keywords',
    ],
  },
  ebay: {
    name: 'eBay',
    titleRange: { min: 60, max: 80 },
    minDescription: 400,
    maxTags: 10,
    tagFormat: 'Item specifics',
    guidelines: [
      'Keyword-dense title, max 80 characters',
      'Include brand, model, condition, and compatibility',
      'No promotional language in title',
      'Include condition details',
      'Be factual and direct',
    ],
  },
  walmart: {
    name: 'Walmart',
    titleRange: { min: 40, max: 75 },
    minDescription: 400,
    maxTags: 10,
    tagFormat: 'Product attributes',
    guidelines: [
      'Brand name first in title',
      'Emphasize value and quantity (Pack, Bundle, Set)',
      'Family-friendly tone only',
      'Title Case only',
      'Include pack sizes and quantities',
    ],
  },
  woocommerce: {
    name: 'WooCommerce',
    titleRange: { min: 55, max: 70 },
    minDescription: 300,
    maxTags: 12,
    tagFormat: 'Product tags',
    guidelines: [
      'SEO-optimized title for Google search',
      'Natural, readable language',
      'Include brand and key features',
      'Focus on benefits and specifications',
      'Use schema-friendly structured data',
    ],
  },
};

export const TIER_LIMITS = {
  free: 3,
  basic: 20,
  premium: 75,
};

export function getPlatformRules(platform: Platform): PlatformRules {
  return PLATFORM_RULES[platform];
}

export function getTierLimit(tier: string): number {
  return TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || 3;
}
