/**
 * AI Prompt Builder — OPTIMIZED v2
 * 
 * KEY CHANGES FROM v1:
 * 1. Returns { systemInstruction, userPrompt } — clean separation
 * 2. System instruction is lean (role + rules only, ~500 tokens)
 * 3. 100 training examples REMOVED from prompt (were wasting 3000+ tokens)
 * 4. Mode-specific instructions are sharp and actionable
 * 5. Chain-of-thought: Gemini thinks THEN writes
 * 6. Output schema is strict and minimal
 */

import { AIGenerationRequest } from './types';

// Platform config — single source of truth
const PLATFORM_CONFIG: Record<string, {
  titleMax: number;
  titleTarget: string;
  bulletCount: number;
  bulletTarget: string;
  descMin: number;
  descTarget: string;
  keywordsMax: number;
  tone: string;
  algorithm: string;
  titleFormat: string;
  specialRules: string;
}> = {
  amazon: {
    titleMax: 200,
    titleTarget: '180-200 characters (90-100% of limit)',
    bulletCount: 5,
    bulletTarget: '150-250 characters each, ALL CAPS benefit keyword first',
    descMin: 1000,
    descTarget: '1000-2000 characters, keyword-rich prose',
    keywordsMax: 15,
    tone: 'Professional, feature-focused, benefit-driven',
    algorithm: 'Amazon A10 — ranks on: relevance, CTR, conversion rate, sales velocity',
    titleFormat: '[Primary Keyword] + [Type/Model] + [Key Specs] + [Use Cases] + [Brand if space]',
    specialRules: 'No promotional language (Sale, Best, #1). Include specific numbers (watts, dimensions, count). List compatible devices/brands. Front-load primary keyword in first 80 chars.'
  },
  etsy: {
    titleMax: 140,
    titleTarget: '126-140 characters (90-100% of limit)',
    bulletCount: 5,
    bulletTarget: '100-200 characters each, conversational tone',
    descMin: 400,
    descTarget: '500-1000 characters, story-driven, personal',
    keywordsMax: 13,
    tone: 'Warm, artisanal, personal, story-driven',
    algorithm: 'Etsy Search — ranks on: listing quality score, recency, shop performance, tags match',
    titleFormat: '[Item] + [Style/Material] + [Occasion] + [Recipient] + pipe separators (|)',
    specialRules: 'Use pipe (|) separators. Include gift occasions (Gift for Her, Birthday Gift). Mention handmade/handcrafted. All 13 tags must be used. Tags max 20 chars each.'
  },
  shopify: {
    titleMax: 70,
    titleTarget: '60-70 characters for SEO',
    bulletCount: 5,
    bulletTarget: '100-200 characters each, benefit-first',
    descMin: 300,
    descTarget: '400-800 characters, brand-voice, engaging',
    keywordsMax: 10,
    tone: 'Brand-aligned, engaging, conversion-focused',
    algorithm: 'Google SEO — ranks on: title relevance, meta description, page content, backlinks',
    titleFormat: '[Brand] + [Product Name] + [Key Feature] — concise, Google-friendly',
    specialRules: 'Title is the SEO title tag — keep it natural and clickable. Description should open with a meta description in first 160 chars. Include long-tail keywords naturally.'
  },
  ebay: {
    titleMax: 80,
    titleTarget: '72-80 characters (90-100% of limit)',
    bulletCount: 5,
    bulletTarget: '100-200 characters each',
    descMin: 300,
    descTarget: '400-1000 characters, condition + specs focused',
    keywordsMax: 10,
    tone: 'Conversational, trust-building, detailed',
    algorithm: 'eBay Cassini — ranks on: title keyword match, item specifics, seller metrics, price',
    titleFormat: '[Brand] + [Model/Type] + [Key Spec] + [Condition if used] + [Compatible With]',
    specialRules: 'Include brand, model number, condition. List compatibility. Include key specs in title. No promotional terms.'
  },
  walmart: {
    titleMax: 75,
    titleTarget: '68-75 characters',
    bulletCount: 6,
    bulletTarget: '100-200 characters each',
    descMin: 300,
    descTarget: '400-800 characters, family-friendly, value-focused',
    keywordsMax: 10,
    tone: 'Value-focused, family-friendly, practical',
    algorithm: 'Walmart Search — ranks on: relevance, price competitiveness, item performance, reviews',
    titleFormat: '[Brand] + [Quality Descriptor] + [Item Type] + [Key Feature] + [Pack Count]',
    specialRules: 'Family-friendly tone only. Emphasize value and quantity. Include pack sizes. Practical language.'
  }
};

const PROHIBITED = [
  'FREE', 'SALE', 'BEST', '#1', 'CHEAP', 'GUARANTEE', 'WINNER',
  'AMAZING', 'INCREDIBLE', 'UNBELIEVABLE', 'PERFECT', 'ULTIMATE',
  'REVOLUTIONARY', 'MIRACLE', 'MAGIC', 'INSTANT', 'EASY MONEY'
];

export interface BuiltPrompt {
  systemInstruction: string;
  userPrompt: string;
}

export class PromptBuilder {
  /**
   * Build prompt — returns separate system + user prompts
   */
  static buildPrompt(request: AIGenerationRequest): BuiltPrompt {
    const cfg = PLATFORM_CONFIG[request.platform] || PLATFORM_CONFIG['amazon'];
    
    return {
      systemInstruction: this.buildSystemInstruction(request.platform, cfg),
      userPrompt: this.buildUserPrompt(request, cfg)
    };
  }

  // ─── SYSTEM INSTRUCTION ──────────────────────────────────────────────────
  
  private static buildSystemInstruction(
    platform: string,
    cfg: typeof PLATFORM_CONFIG[string]
  ): string {
    return `You are an elite e-commerce SEO specialist and conversion copywriter with 15 years of experience optimizing product listings on ${platform.toUpperCase()} specifically.

YOUR EXPERTISE:
- Deep knowledge of ${cfg.algorithm}
- Conversion rate optimization (CRO) psychology
- Keyword research and strategic placement
- Benefit-driven copywriting that drives purchases

NON-NEGOTIABLE RULES:
1. TITLE: Must be ${cfg.titleTarget}
2. BULLETS: Exactly ${cfg.bulletCount} bullets, ${cfg.bulletTarget}
3. DESCRIPTION: Minimum ${cfg.descMin} characters, ${cfg.descTarget}
4. KEYWORDS: Up to ${cfg.keywordsMax} highly relevant keywords
5. PROHIBITED WORDS — NEVER USE: ${PROHIBITED.join(', ')}
6. TONE: ${cfg.tone}
7. TITLE FORMAT: ${cfg.titleFormat}
8. PLATFORM RULES: ${cfg.specialRules}

BULLET STRUCTURE (mandatory format):
[BENEFIT IN CAPS] — [Feature description with specific details, numbers, materials]

Example: "LONG-LASTING BATTERY — 40-hour playtime on a single charge keeps you listening through workouts, commutes, and long travel days without ever reaching for a charger"

QUALITY STANDARD:
- Use 90-100% of character limits (CRITICAL for SEO ranking)
- Front-load primary keyword in first 80 characters of title
- Include specific numbers, dimensions, materials, quantities wherever possible
- Write for humans first, algorithms second — must sound natural
- Every claim must be realistic and believable
- No keyword stuffing — natural integration only

OUTPUT RULES:
- Return ONLY valid JSON. No markdown, no preamble, no explanation.
- All strings must be properly escaped
- Do not truncate any field`;
  }

  // ─── USER PROMPT ─────────────────────────────────────────────────────────
  
  private static buildUserPrompt(
    request: AIGenerationRequest,
    cfg: typeof PLATFORM_CONFIG[string]
  ): string {
    const { productData, mode, imageAnalysis } = request;
    let prompt = '';

    // Mode-specific task
    prompt += this.getModeInstruction(mode, request.platform);
    prompt += '\n\n';

    // Product data
    prompt += '=== PRODUCT INFORMATION ===\n';
    if (productData.title) prompt += `Current Title: ${productData.title}\n`;
    if (productData.description) prompt += `Current Description: ${productData.description}\n`;
    if (productData.category) prompt += `Category: ${productData.category}\n`;
    if (productData.price) prompt += `Price: $${productData.price}\n`;
    
    if (productData.specifications?.length) {
      prompt += 'Specifications:\n';
      productData.specifications.forEach(s => {
        prompt += `  • ${s.name}: ${s.value}${s.unit ? ' ' + s.unit : ''}\n`;
      });
    }
    
    if (productData.keywords?.length) {
      prompt += `Target Keywords: ${productData.keywords.join(', ')}\n`;
    }

    if (imageAnalysis) {
      prompt += '\n=== IMAGE ANALYSIS ===\n';
      prompt += `Visual Features: ${imageAnalysis.mainFeatures.join(', ')}\n`;
      prompt += `Colors: ${imageAnalysis.colors.join(', ')}\n`;
      prompt += `Style: ${imageAnalysis.style}\n`;
      prompt += `Apparent Quality: ${imageAnalysis.quality}\n`;
    }

    // Chain-of-thought — forces reasoning before writing
    prompt += `
=== THINK FIRST, THEN WRITE ===
Before generating output, reason through:
1. PRIMARY KEYWORD: What exact phrase would a buyer type to find this product?
2. TOP 3 BENEFITS: What are the strongest emotional/practical benefits (not features)?
3. TARGET BUYER: Who is buying this and what do they care most about?
4. MISSING DATA: What specific details (numbers, specs, materials) should be inferred from context?

Now generate the fully optimized listing for ${request.platform.toUpperCase()}.

=== REQUIRED JSON OUTPUT (return this exact structure) ===
{
  "title": "optimized title — must be ${cfg.titleTarget}",
  "bullets": [
    "BENEFIT KEYWORD — detailed feature description with specifics",
    "BENEFIT KEYWORD — detailed feature description with specifics",
    "BENEFIT KEYWORD — detailed feature description with specifics",
    "BENEFIT KEYWORD — detailed feature description with specifics",
    "BENEFIT KEYWORD — detailed feature description with specifics"
  ],
  "description": "full product description — minimum ${cfg.descMin} characters",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "platform_notes": "1-2 sentences on the key optimization decisions made"
}`;

    return prompt;
  }

  // ─── MODE INSTRUCTIONS ───────────────────────────────────────────────────
  
  private static getModeInstruction(mode: string, platform: string): string {
    switch (mode) {
      case 'optimize':
        return `TASK: OPTIMIZE EXISTING LISTING

You have an existing product listing. Make substantial improvements — do NOT just rephrase:
- Rewrite the title to maximize SEO impact, character utilization, and click-through rate
- Rewrite ALL bullets with benefit-first structure and specific numbers/details
- Expand the description significantly with more keywords and compelling copy
- Identify and add high-value keywords the current listing is missing
- Fix any compliance issues (prohibited words, bad formatting)
- Result should be noticeably better, not a minor tweak`;

      case 'create':
        return `TASK: CREATE NEW LISTING FROM SCRATCH

Build a powerful listing from zero:
- Write a title that immediately communicates value and targets high-search keywords
- Create ${platform === 'walmart' ? '6' : '5'} compelling bullets addressing buyer concerns and key benefits
- Write a full description that tells the product story, answers common questions, and integrates keywords naturally
- Select the most relevant, high-traffic keywords for this product type
- Think like a buyer — what would make them stop scrolling and click BUY NOW?`;

      case 'analyze':
        return `TASK: ANALYZE COMPETITOR/URL DATA AND OPTIMIZE

You have extracted data from a product URL. Your job is to create a dramatically better version:
- Identify all weaknesses in the current listing (thin title, missing keywords, weak bullets, short description)
- Add keywords and use cases the original listing missed entirely
- Strengthen every element with specific benefits and details
- The optimized version should clearly outperform the original
- Be bold — don't just tweak, transform`;

      default:
        return `TASK: Generate a fully optimized product listing for ${platform.toUpperCase()}.`;
    }
  }

  /**
   * Legacy string-based buildPrompt — for backward compatibility
   * with any code that still calls buildPrompt and expects a string
   */
  static buildPromptLegacy(request: AIGenerationRequest): string {
    const { systemInstruction, userPrompt } = this.buildPrompt(request);
    return `${systemInstruction}\n\n${userPrompt}`;
  }

  /**
   * Compress prompt (trim whitespace)
   */
  static compressPrompt(prompt: string): string {
    return prompt
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
}
