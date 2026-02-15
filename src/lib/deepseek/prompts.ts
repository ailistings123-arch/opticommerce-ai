/**
 * DeepSeek Prompt Templates Module
 * 
 * Contains all DeepSeek-specific prompt templates for different platforms and modes.
 * Defines platform-specific rules, character limits, banned words, and quality checklists.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { Platform } from '@/types';

/**
 * Platform-specific rules and requirements
 */
export interface PlatformRules {
  titleLimit: { min: number; max: number };
  descriptionLimit: { min: number; max: number };
  bulletLimit: { min: number; max: number };
  keywordCount: { min: number; max: number };
  bannedWords: string[];
  requiredElements: string[];
  specialRules: string[];
}

/**
 * Platform-specific rules for all supported platforms
 * Requirements: 3.2, 3.6
 */
export const PLATFORM_RULES: Record<Platform, PlatformRules> = {
  amazon: {
    titleLimit: { min: 150, max: 200 },
    descriptionLimit: { min: 1500, max: 2000 },
    bulletLimit: { min: 400, max: 500 },
    keywordCount: { min: 40, max: 60 },
    bannedWords: [
      'best', 'top', '#1', 'sale', 'discount', 'cheap', 'free shipping',
      'guarantee', 'warranty', 'amazon', 'prime', 'seller', 'buy now',
      'click here', 'limited time', 'hurry', 'act now'
    ],
    requiredElements: [
      'Start bullets with CAPITALIZED BENEFIT',
      'Front-load keywords in first 50 chars of title',
      'Include specific measurements and numbers',
      'No promotional language'
    ],
    specialRules: [
      'Title: 200 chars max, NO "Best/Sale/#1" words',
      'Bullets: 500 chars each max, start with CAPITALIZED BENEFIT',
      'Backend search terms: 250 bytes max',
      'Use natural keywords (1-2% density)',
      'Benefits over features',
      'Specific measurements required'
    ]
  },
  shopify: {
    titleLimit: { min: 50, max: 70 },
    descriptionLimit: { min: 300, max: 1000 },
    bulletLimit: { min: 100, max: 200 },
    keywordCount: { min: 20, max: 40 },
    bannedWords: ['cheap', 'free', 'guarantee'],
    requiredElements: [
      'SEO-friendly title',
      'Meta description under 155 chars',
      'Clear product benefits'
    ],
    specialRules: [
      'Title: 60-70 chars optimal',
      'Meta description: 155 chars max',
      'Focus on brand storytelling',
      'Include lifestyle benefits'
    ]
  },
  ebay: {
    titleLimit: { min: 70, max: 80 },
    descriptionLimit: { min: 500, max: 1500 },
    bulletLimit: { min: 150, max: 300 },
    keywordCount: { min: 25, max: 45 },
    bannedWords: ['best', 'top', 'cheap'],
    requiredElements: [
      'Use all 80 characters',
      'Include brand and model',
      'Specific condition details'
    ],
    specialRules: [
      'Title: 80 chars max (use all 80)',
      'Include brand, model, size, color',
      'Front-load most important keywords',
      'No promotional language'
    ]
  },
  etsy: {
    titleLimit: { min: 120, max: 140 },
    descriptionLimit: { min: 500, max: 1500 },
    bulletLimit: { min: 100, max: 250 },
    keywordCount: { min: 13, max: 13 },
    bannedWords: ['cheap', 'replica', 'inspired by'],
    requiredElements: [
      'Personal, warm tone',
      '13 tags exactly (20 chars each)',
      'Handmade/vintage emphasis',
      'Story-driven description'
    ],
    specialRules: [
      'Title: 140 chars max',
      'Tags: Exactly 13 tags, 20 chars each',
      'Personal, warm, artisan tone',
      'Emphasize handmade/unique qualities',
      'Tell the product story'
    ]
  },
  walmart: {
    titleLimit: { min: 50, max: 75 },
    descriptionLimit: { min: 500, max: 1500 },
    bulletLimit: { min: 150, max: 300 },
    keywordCount: { min: 25, max: 45 },
    bannedWords: ['best', 'top', 'cheap', 'walmart'],
    requiredElements: [
      'Clear, concise title',
      'Value proposition',
      'Family-friendly language'
    ],
    specialRules: [
      'Title: 50-75 chars',
      'Clear value proposition',
      'Family-friendly tone',
      'Emphasize quality and value'
    ]
  }
};

/**
 * Quality checklist requirements
 * Requirements: 3.4, 3.5
 */
export const QUALITY_CHECKLIST = {
  titleCharUtilization: 0.9, // 90%+
  bulletCharRange: { min: 400, max: 500 },
  descriptionCharRange: { min: 1500, max: 2000 },
  keywordCount: { min: 40, max: 60 },
  keywordDensity: { min: 0.01, max: 0.02 } // 1-2%
};

/**
 * Main system prompt defining AI role and behavior
 * Requirements: 3.1, 3.3
 */
export const DEEPSEEK_SYSTEM_PROMPT = `You are an expert e-commerce copywriter specializing in Amazon, Shopify, eBay, Etsy, Walmart, and WooCommerce product listings. Create SEO-optimized, high-converting product content.

CRITICAL RULES:
1. Write 100% natural, human-quality content (never reveal you're AI)
2. Always output valid JSON in the exact structure specified
3. Integrate keywords naturally - NO keyword stuffing
4. Focus on BENEFITS over features
5. Use specific numbers and measurements
6. Address customer pain points directly

PLATFORM LIMITS (NEVER EXCEED):
- Amazon: Title 200 chars, Bullets 500 chars each, Backend 250 bytes
- Shopify: Title 60-70 chars, Meta 155 chars
- eBay: Title 80 chars
- Etsy: Title 140 chars, 13 tags (20 chars each)
- Walmart: Title 50-75 chars
- WooCommerce: Title 60-70 chars

AMAZON RULES:
- NO promotional words (Best, #1, Sale, Top, etc.)
- Start bullets with CAPITALIZED BENEFIT
- Front-load keywords in first 50 chars of title

JSON OUTPUT FORMAT:
{
  "seoScore": {
    "overall": 0-100,
    "keywordOptimization": 0-100,
    "titleEffectiveness": 0-100,
    "descriptionQuality": 0-100,
    "beforeScore": 0-100
  },
  "title": "optimized title here",
  "bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "description": "1500-2000 char description with hook, problem, solution, features, use cases, CTA",
  "keywords": {
    "primary": ["keyword1", "keyword2", "keyword3"],
    "secondary": ["keyword4", "keyword5"],
    "longTail": ["phrase1", "phrase2"],
    "backend": "comma separated backend keywords"
  },
  "recommendations": ["tip1", "tip2", "tip3"]
}

QUALITY CHECKLIST:
✓ Title uses 90%+ of character limit
✓ Each bullet 400-500 characters
✓ Description 1500-2000 characters
✓ 40-60 keywords integrated naturally
✓ Keyword density 1-2%
✓ Benefits-first language
✓ Specific measurements included
✓ No AI-sounding phrases
✓ Natural, persuasive tone

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, ONLY the JSON object.`;

/**
 * Get platform-specific prompt additions
 */
function getPlatformSpecificRules(platform: Platform): string {
  const rules = PLATFORM_RULES[platform];
  
  return `
PLATFORM: ${platform.toUpperCase()}

CHARACTER LIMITS:
- Title: ${rules.titleLimit.min}-${rules.titleLimit.max} characters
- Description: ${rules.descriptionLimit.min}-${rules.descriptionLimit.max} characters
- Bullets: ${rules.bulletLimit.min}-${rules.bulletLimit.max} characters each
- Keywords: ${rules.keywordCount.min}-${rules.keywordCount.max} total

BANNED WORDS (DO NOT USE):
${rules.bannedWords.map(word => `- ${word}`).join('\n')}

REQUIRED ELEMENTS:
${rules.requiredElements.map(elem => `- ${elem}`).join('\n')}

SPECIAL RULES:
${rules.specialRules.map(rule => `- ${rule}`).join('\n')}
`;
}

/**
 * Build prompt for "optimize_existing" mode
 * Requirements: 4.1, 4.4
 */
export function buildOptimizeExistingPrompt(
  title: string,
  description: string,
  platform: Platform,
  keywords?: string
): string {
  const platformRules = getPlatformSpecificRules(platform);
  
  return `${platformRules}

MODE: optimize_existing

CURRENT LISTING:
Title: ${title}
Description: ${description}
${keywords ? `Keywords: ${keywords}` : ''}

TASK:
Analyze the weaknesses in this listing and create a dramatically improved version that:
1. Maximizes character limits (use 90%+ of title limit)
2. Front-loads primary keywords in the first 50 characters
3. Transforms features into compelling benefits
4. Includes specific measurements and numbers
5. Addresses customer pain points
6. Uses natural, persuasive language (not AI-sounding)
7. Follows all platform-specific rules
8. Achieves 1-2% keyword density

Provide the optimized content in the JSON format specified.`;
}

/**
 * Build prompt for "create_new" mode
 * Requirements: 4.2, 4.4
 */
export function buildCreateNewPrompt(
  productData: {
    platform: Platform;
    productName: string;
    whatIsIt: string;
    problemSolved?: string;
    keyFeatures: string[];
    mainBenefits: string[];
    primaryMaterial?: string;
    idealCustomer?: string;
    useCases: string[];
    uniqueAdvantage?: string;
    category?: string;
    tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  }
): string {
  const platformRules = getPlatformSpecificRules(productData.platform);
  
  return `${platformRules}

MODE: create_new

PRODUCT INFORMATION:
Name: ${productData.productName}
Category: ${productData.category || 'Not specified'}
What it is: ${productData.whatIsIt}
${productData.problemSolved ? `Problem Solved: ${productData.problemSolved}` : ''}
${productData.primaryMaterial ? `Material: ${productData.primaryMaterial}` : ''}
${productData.idealCustomer ? `Target Customer: ${productData.idealCustomer}` : ''}
${productData.uniqueAdvantage ? `Unique Advantage: ${productData.uniqueAdvantage}` : ''}
Tone: ${productData.tone || 'professional'}

KEY FEATURES:
${productData.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

MAIN BENEFITS:
${productData.mainBenefits.map((b, i) => `${i + 1}. ${b}`).join('\n')}

USE CASES:
${productData.useCases.map((u, i) => `${i + 1}. ${u}`).join('\n')}

TASK:
Create a professional, high-converting ${productData.platform} listing from scratch that:
1. Uses 90%+ of the title character limit
2. Includes 5 compelling bullet points (400-500 chars each)
3. Writes a 1500-2000 character description with:
   - Hook (attention-grabbing opening)
   - Problem (pain points)
   - Solution (how product solves it)
   - Features (with benefits)
   - Use cases (real-world applications)
   - CTA (call to action)
4. Integrates 40-60 keywords naturally (1-2% density)
5. Follows all platform-specific rules
6. Uses ${productData.tone || 'professional'} tone
7. Sounds human, not AI-generated

Provide the complete listing in the JSON format specified.`;
}

/**
 * Build prompt for "analyze_url" mode
 * Requirements: 4.3, 4.4
 */
export function buildAnalyzeUrlPrompt(
  competitorContent: {
    title: string;
    description: string;
    bullets?: string[];
    price?: string;
  },
  platform: Platform,
  productDifferences?: string
): string {
  const platformRules = getPlatformSpecificRules(platform);
  
  return `${platformRules}

MODE: analyze_url

COMPETITOR LISTING:
Title: ${competitorContent.title}
Description: ${competitorContent.description}
${competitorContent.bullets ? `Bullets:\n${competitorContent.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}` : ''}
${competitorContent.price ? `Price: ${competitorContent.price}` : ''}

${productDifferences ? `MY PRODUCT DIFFERENCES:\n${productDifferences}` : ''}

TASK:
Analyze the competitor's listing strategy and create an even better version that:
1. Identifies their keyword strategy and improves upon it
2. Finds gaps in their content and fills them
3. Uses more compelling benefit-focused language
4. Maximizes character limits (90%+ of title limit)
5. Includes more specific measurements and details
6. Addresses customer pain points they missed
7. Follows all platform-specific rules
8. Achieves better keyword optimization (1-2% density)
${productDifferences ? '9. Highlights the unique advantages of my product' : ''}

Provide the optimized listing in the JSON format specified.`;
}

/**
 * Get optimization mode template
 * Requirements: 4.4
 */
export function getOptimizationPrompt(
  mode: 'optimize_existing' | 'create_new' | 'analyze_url',
  data: any
): string {
  switch (mode) {
    case 'optimize_existing':
      return buildOptimizeExistingPrompt(
        data.title,
        data.description,
        data.platform,
        data.keywords
      );
    
    case 'create_new':
      return buildCreateNewPrompt(data.productData);
    
    case 'analyze_url':
      return buildAnalyzeUrlPrompt(
        data.competitorContent,
        data.platform,
        data.productDifferences
      );
    
    default:
      throw new Error(`Unknown optimization mode: ${mode}`);
  }
}
