import { PlatformRules, Platform } from '@/types';

export const PLATFORM_RULES: Record<Platform, PlatformRules> = {
  amazon: {
    name: 'Amazon',
    titleRange: { min: 150, max: 200 },
    minDescription: 2000,
    maxTags: 7,
    tagFormat: 'Backend search terms',
    guidelines: [
      'Capitalize first letter of each word in title',
      'Include brand name and key features',
      'Use bullet points for product features',
      'Include dimensions and specifications',
      'Focus on benefits and use cases',
    ],
  },
  shopify: {
    name: 'Shopify',
    titleRange: { min: 60, max: 70 },
    minDescription: 300,
    maxTags: 15,
    tagFormat: 'Product tags',
    guidelines: [
      'Use natural, conversational language',
      'Tell a brand story',
      'Emphasize lifestyle and benefits',
      'Keep title concise and readable',
      'Mix broad and specific tags',
    ],
  },
  etsy: {
    name: 'Etsy',
    titleRange: { min: 100, max: 140 },
    minDescription: 1000,
    maxTags: 13,
    tagFormat: 'Single words or 2-word phrases',
    guidelines: [
      'Keyword-rich title within 140 characters',
      'Add personal touch to description',
      'Include materials and dimensions',
      'Mention care instructions',
      'Emphasize handmade/unique qualities',
    ],
  },
  ebay: {
    name: 'eBay',
    titleRange: { min: 60, max: 80 },
    minDescription: 500,
    maxTags: 10,
    tagFormat: 'Item specifics',
    guidelines: [
      'Keyword-dense title, max 80 characters',
      'No promotional language in title',
      'Include condition details',
      'Mention shipping and return policy',
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
      'Concise and feature-focused',
      'Title Case only',
      'Competitive pricing important',
      'Fill all product attributes',
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
