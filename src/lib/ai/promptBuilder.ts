/**
 * AI Prompt Builder — OPTIMIZED v2 - ENHANCED TRAINING
 * 
 * KEY CHANGES FROM v1:
 * 1. Returns { systemInstruction, userPrompt } — clean separation
 * 2. System instruction is lean (role + rules only, ~500 tokens)
 * 3. Enhanced with best practices for ALL platforms and product types
 * 4. Mode-specific instructions are sharp and actionable
 * 5. Chain-of-thought: Gemini thinks THEN writes
 * 6. Output schema is strict and minimal
 * 7. TRAINED for professional SEO across all e-commerce platforms
 */

import { AIGenerationRequest } from './types';
import { TRAINING_EXAMPLES } from './trainingExamples';

// Platform config — single source of truth - ENHANCED
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
  seoFocus: string;
  conversionTips: string;
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
    specialRules: 'No promotional language (Sale, Best, #1). Include specific numbers (watts, dimensions, count). List compatible devices/brands. Front-load primary keyword in first 80 chars.',
    seoFocus: 'Front-load high-volume keywords. Include exact match phrases buyers search. Add long-tail keywords naturally. Use numbers and specifications for better ranking.',
    conversionTips: 'Emphasize Prime eligibility benefits. Highlight fast shipping. Address common customer questions. Include warranty/guarantee info. Use power words: Premium, Professional, Durable, Certified.'
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
    specialRules: 'Use pipe (|) separators. Include gift occasions (Gift for Her, Birthday Gift). Mention handmade/handcrafted. All 13 tags must be used. Tags max 20 chars each.',
    seoFocus: 'Use all 13 tags strategically. Include gift-related keywords. Add occasion keywords (wedding, birthday, anniversary). Use material keywords. Include style descriptors (vintage, modern, rustic).',
    conversionTips: 'Tell the story behind the product. Emphasize handmade quality. Mention customization options. Highlight unique features. Use emotional language. Include care instructions.'
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
    specialRules: 'Title is the SEO title tag — keep it natural and clickable. Description should open with a meta description in first 160 chars. Include long-tail keywords naturally.',
    seoFocus: 'Optimize for Google search. Use long-tail keywords. Include location keywords if relevant. Add brand name. Use natural language. Include product category keywords.',
    conversionTips: 'Strong brand voice. Emphasize unique value proposition. Include social proof. Highlight free shipping if available. Use scarcity/urgency carefully. Add trust signals.'
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
    specialRules: 'Include brand, model number, condition. List compatibility. Include key specs in title. No promotional terms.',
    seoFocus: 'Use exact brand and model names. Include condition keywords (New, Used, Refurbished). Add compatibility keywords. Use specific model numbers. Include size/color in title.',
    conversionTips: 'Clear condition description. Detailed item specifics. Include shipping details. Mention return policy. Add measurements. Use high-quality photos. Build trust with transparency.'
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
    specialRules: 'Family-friendly tone only. Emphasize value and quantity. Include pack sizes. Practical language.',
    seoFocus: 'Emphasize value keywords (Pack, Bundle, Set). Include family-friendly terms. Add practical use cases. Use quality descriptors. Include quantity in title.',
    conversionTips: 'Highlight value for money. Emphasize family benefits. Include pack sizes prominently. Mention durability. Use trust words: Trusted, Reliable, Quality. Compare to retail price if better.'
  }
};

const PROHIBITED = [
  'FREE', 'SALE', 'BEST', '#1', 'CHEAP', 'GUARANTEE', 'WINNER',
  'AMAZING', 'INCREDIBLE', 'UNBELIEVABLE', 'PERFECT', 'ULTIMATE',
  'REVOLUTIONARY', 'MIRACLE', 'MAGIC', 'INSTANT', 'EASY MONEY'
];

// ENHANCED: Product type specific guidance
const PRODUCT_TYPE_GUIDANCE: Record<string, {
  keywordStrategy: string;
  titleEmphasis: string;
  descriptionFocus: string;
  bulletPriority: string;
}> = {
  physical: {
    keywordStrategy: 'Include dimensions, weight, material, color, size. Use specific measurements.',
    titleEmphasis: 'Lead with product type + key physical attributes (size, material, color)',
    descriptionFocus: 'Detailed specifications, materials, dimensions, weight, what\'s included in package',
    bulletPriority: 'Dimensions, Material Quality, Durability, Easy to Clean/Maintain, Warranty'
  },
  digital: {
    keywordStrategy: 'Include format, compatibility, instant access, download. Use software/platform names.',
    titleEmphasis: 'Lead with product type + format + compatibility (PDF, MP4, Compatible with...)',
    descriptionFocus: 'What they get, format details, how to access, compatibility, usage rights',
    bulletPriority: 'Instant Access, File Format, Compatibility, Usage Rights, Support Included'
  },
  handmade: {
    keywordStrategy: 'Include handmade, handcrafted, artisan, custom, unique. Use material keywords.',
    titleEmphasis: 'Lead with Handmade/Handcrafted + item type + material + style',
    descriptionFocus: 'Craftsmanship story, materials used, time to create, customization options, care instructions',
    bulletPriority: 'Handmade Quality, Unique Design, Premium Materials, Customizable, Gift-Ready'
  },
  vintage: {
    keywordStrategy: 'Include era, condition, authentic, original, collectible. Use decade keywords.',
    titleEmphasis: 'Lead with Vintage + era/decade + item type + condition',
    descriptionFocus: 'Age/era, condition details, authenticity, history, measurements, any flaws',
    bulletPriority: 'Authentic Vintage, Era/Decade, Condition, Measurements, Collectible Value'
  },
  'print-on-demand': {
    keywordStrategy: 'Include design theme, sizes available, print quality, material. Use niche keywords.',
    titleEmphasis: 'Lead with design theme + item type + sizes + material',
    descriptionFocus: 'Design details, available sizes, print quality, material, care instructions',
    bulletPriority: 'High-Quality Print, Multiple Sizes, Durable Material, Unique Design, Easy Care'
  }
};

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
    // Get relevant training examples (3 examples)
    const examples = TRAINING_EXAMPLES.slice(0, 3);
    const examplesText = examples.map((ex, idx) => `
EXAMPLE ${idx + 1} - ${ex.category}:
BEFORE (Poor): "${ex.before.title}"
AFTER (Excellent): "${ex.after.title}"

Notice how the AFTER version:
- Uses 90-100% of character limit (${ex.after.title.length} chars)
- Includes specific numbers, specs, and measurements
- Front-loads primary keywords
- Adds compelling benefits and features
- Uses power words that drive conversions
`).join('\n');

    return `You are an ELITE e-commerce SEO specialist and conversion copywriter with 15+ years of experience optimizing product listings specifically for ${platform.toUpperCase()}.

YOUR EXPERTISE:
- Deep knowledge of ${cfg.algorithm}
- Conversion rate optimization (CRO) psychology
- Professional keyword research and strategic placement
- Benefit-driven copywriting that drives purchases
- ${platform.toUpperCase()}-specific best practices and ranking factors

LEARN FROM THESE PROFESSIONAL EXAMPLES:
${examplesText}

CRITICAL SUCCESS FACTORS FOR ${platform.toUpperCase()}:
${cfg.seoFocus}

CONVERSION OPTIMIZATION:
${cfg.conversionTips}

NON-NEGOTIABLE RULES:
1. TITLE: Must be ${cfg.titleTarget} - USE 90-100% OF AVAILABLE CHARACTERS
2. BULLETS: Exactly ${cfg.bulletCount} bullets, ${cfg.bulletTarget}
3. DESCRIPTION: Minimum ${cfg.descMin} characters, ${cfg.descTarget}
4. KEYWORDS: Up to ${cfg.keywordsMax} highly relevant, high-traffic keywords
5. PROHIBITED WORDS — NEVER USE: ${PROHIBITED.join(', ')}
6. TONE: ${cfg.tone}
7. TITLE FORMAT: ${cfg.titleFormat}
8. PLATFORM RULES: ${cfg.specialRules}

BULLET STRUCTURE (mandatory format):
[BENEFIT IN CAPS] — [Feature description with specific details, numbers, materials, measurements]

Example: "LONG-LASTING BATTERY — 40-hour playtime on a single charge keeps you listening through workouts, commutes, and long travel days without ever reaching for a charger"

PROFESSIONAL QUALITY STANDARDS:
- Use 90-100% of character limits (CRITICAL for SEO ranking and visibility)
- Front-load primary keyword in first 80 characters of title
- Include specific numbers, dimensions, materials, quantities wherever possible
- Write for humans first, algorithms second — must sound natural and professional
- Every claim must be realistic and believable
- No keyword stuffing — natural integration only
- Use power words that drive conversions
- Address customer pain points and desires
- Include social proof elements when relevant

KEYWORD STRATEGY:
- Primary keyword: 1-2% density (appears naturally 1-2 times per 100 words)
- Secondary keywords: 0.5-1% density
- Long-tail keywords: Include 2-3 specific long-tail phrases
- LSI keywords: Add semantically related terms
- Competitor keywords: Include terms competitors rank for

OUTPUT RULES:
- Return ONLY valid JSON. No markdown, no preamble, no explanation.
- All strings must be properly escaped
- Do not truncate any field
- Ensure all required fields are present and complete
- NEVER use HTML entities (&ndash;, &amp;, &quot;, etc.) - use plain text characters only
- Use plain hyphens (-), ampersands (&), and quotes (") instead of HTML entities

CRITICAL - WHEN TO OPTIMIZE VS WHEN TO KEEP:
- If the input listing is ALREADY EXCELLENT (90%+ character usage, keyword-rich, professional, benefit-driven), you should:
  * Keep the original title/content with minimal changes
  * Return a quality score of 90+ 
  * Add platform_notes: "SEO is already excellent. No major changes needed."
- If the input listing is POOR (low character usage, missing keywords, weak copy), you MUST:
  * Completely rewrite and dramatically improve it
  * Maximize character usage to 90-100%
  * Add missing keywords and benefits
  * Return a significantly better version`;
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

    // Product type guidance
    const productType = (productData as any).productType || 'physical';
    const typeGuidance = PRODUCT_TYPE_GUIDANCE[productType] || PRODUCT_TYPE_GUIDANCE['physical'];
    
    prompt += `=== PRODUCT TYPE: ${productType.toUpperCase()} ===\n`;
    prompt += `Keyword Strategy: ${typeGuidance.keywordStrategy}\n`;
    prompt += `Title Emphasis: ${typeGuidance.titleEmphasis}\n`;
    prompt += `Description Focus: ${typeGuidance.descriptionFocus}\n`;
    prompt += `Bullet Priority: ${typeGuidance.bulletPriority}\n\n`;

    // Product data
    prompt += '=== PRODUCT INFORMATION ===\n';
    if (productData.title) prompt += `Current Title: ${productData.title}\n`;
    if (productData.description) prompt += `Current Description: ${productData.description}\n`;
    if (productData.category) prompt += `Category: ${productData.category}\n`;
    if (productData.price) prompt += `Price: ${productData.price}\n`;
    
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

    // Enhanced chain-of-thought
    prompt += `
=== PROFESSIONAL SEO ANALYSIS (Think deeply before writing) ===

STEP 1 - KEYWORD RESEARCH:
- What is the PRIMARY keyword buyers use to find this product? (high-volume, exact match)
- What are 3-5 SECONDARY keywords? (related searches, variations)
- What are 2-3 LONG-TAIL keywords? (specific phrases, lower competition)
- What LSI keywords should be included? (semantically related terms)

STEP 2 - COMPETITIVE ANALYSIS:
- What keywords are competitors ranking for?
- What makes this product UNIQUE vs competitors?
- What are the TOP 3 BENEFITS that drive purchases? (emotional + practical)
- What customer PAIN POINTS does this solve?

STEP 3 - TARGET BUYER PROFILE:
- Who is buying this? (demographics, psychographics)
- What do they care most about? (price, quality, speed, features)
- What objections might they have? (address in description)
- What would make them click BUY NOW?

STEP 4 - MISSING DATA INFERENCE:
- What specific details (numbers, specs, materials) should be inferred from context?
- What dimensions/measurements are standard for this product type?
- What certifications/standards apply?
- What's included in the package?

STEP 5 - OPTIMIZATION STRATEGY:
- How can we maximize character usage (90-100%)?
- Where should keywords be placed for maximum impact?
- What power words will drive conversions?
- How can we stand out from competitors?

Now generate the PROFESSIONAL, SEO-OPTIMIZED listing for ${request.platform.toUpperCase()}.

=== REQUIRED JSON OUTPUT (return this exact structure) ===
{
  "title": "optimized title — must be ${cfg.titleTarget}, use 90-100% of characters",
  "bullets": [
    "BENEFIT KEYWORD — detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD — detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD — detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD — detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD — detailed feature description with specifics, numbers, materials"${cfg.bulletCount === 6 ? ',\n    "BENEFIT KEYWORD — detailed feature description with specifics, numbers, materials"' : ''}
  ],
  "description": "full professional product description — minimum ${cfg.descMin} characters, keyword-rich, benefit-driven, addresses customer questions",
  "keywords": ["primary-keyword", "secondary-keyword-1", "secondary-keyword-2", "long-tail-keyword-phrase", "lsi-keyword"],
  "platform_notes": "Brief summary of key optimization decisions made for ${request.platform.toUpperCase()} algorithm"
}`;

    return prompt;
  }

  // ─── MODE INSTRUCTIONS ───────────────────────────────────────────────────
  
  private static getModeInstruction(mode: string, platform: string): string {
    switch (mode) {
      case 'optimize':
        return `TASK: PROFESSIONAL OPTIMIZATION OF EXISTING LISTING

CRITICAL DECISION POINT - ANALYZE FIRST:
1. Calculate current character usage percentage
2. Check keyword density and quality
3. Evaluate professional tone and benefit-driven language
4. Assess if it follows platform best practices

IF CURRENT LISTING IS ALREADY EXCELLENT (90%+ character usage, keyword-rich, professional):
- Keep the original content with MINIMAL or NO changes
- DO NOT rewrite just for the sake of rewriting
- Return quality score 90+
- Add note: "SEO is already excellent. No major changes needed."

IF CURRENT LISTING IS POOR (low character usage, missing keywords, weak copy):
- Completely rewrite and dramatically improve
- Maximize character usage to 90-100%
- Add missing keywords and compelling benefits
- Transform it into professional quality

CRITICAL REQUIREMENTS FOR POOR LISTINGS:
- Rewrite the title to maximize SEO impact, character utilization (90-100%), and click-through rate
- Front-load the primary keyword in first 80 characters
- Rewrite ALL bullets with benefit-first structure and specific numbers/details
- Expand the description significantly with more keywords and compelling, professional copy
- Identify and add high-value keywords the current listing is missing
- Fix any compliance issues (prohibited words, bad formatting)
- Add power words that drive conversions
- Address customer pain points and objections
- Include social proof elements if relevant

RESULT: Either keep excellent content OR dramatically improve poor content. Never make minor tweaks to already-good listings.`;

      case 'create':
        return `TASK: CREATE PROFESSIONAL LISTING FROM SCRATCH

Build a POWERFUL, PROFESSIONAL listing from zero that will rank and convert:

CRITICAL REQUIREMENTS:
- Write a title that immediately communicates value and targets high-search keywords
- Use 90-100% of available title characters
- Create ${platform === 'walmart' ? '6' : '5'} compelling bullets addressing buyer concerns and key benefits
- Write a full professional description that tells the product story, answers common questions, and integrates keywords naturally
- Select the most relevant, high-traffic keywords for this product type
- Include specific numbers, dimensions, materials, specifications
- Use power words that drive conversions
- Address customer pain points proactively
- Think like a buyer — what would make them stop scrolling and click BUY NOW?

RESULT MUST BE: Professional, comprehensive, SEO-optimized listing that stands out from competitors.`;

      case 'analyze':
        return `TASK: ANALYZE COMPETITOR DATA AND CREATE SUPERIOR VERSION

You have extracted data from a competitor's product URL. Your job is to create a DRAMATICALLY BETTER, PROFESSIONAL version:

CRITICAL REQUIREMENTS:
- Identify ALL weaknesses in the current listing (thin title, missing keywords, weak bullets, short description)
- Add keywords and use cases the original listing missed entirely
- Strengthen every element with specific benefits and details
- Use 90-100% of available character limits
- Include power words and conversion-focused language
- Address customer questions the original doesn't answer
- Add professional polish and credibility
- The optimized version should CLEARLY outperform the original

RESULT MUST BE: Professional transformation that ranks higher and converts better than the competitor.`;

      default:
        return `TASK: Generate a PROFESSIONAL, SEO-OPTIMIZED product listing for ${platform.toUpperCase()} that ranks and converts.`;
    }
  }

  /**
   * Legacy string-based buildPrompt — for backward compatibility
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
