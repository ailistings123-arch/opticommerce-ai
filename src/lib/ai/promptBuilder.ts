/**
 * AI Prompt Builder â€” OPTIMIZED v2 - ENHANCED TRAINING
 * 
 * KEY CHANGES FROM v1:
 * 1. Returns { systemInstruction, userPrompt } â€” clean separation
 * 2. System instruction is lean (role + rules only, ~500 tokens)
 * 3. Enhanced with best practices for ALL platforms and product types
 * 4. Mode-specific instructions are sharp and actionable
 * 5. Chain-of-thought: Gemini thinks THEN writes
 * 6. Output schema is strict and minimal
 * 7. TRAINED for professional SEO across all e-commerce platforms
 */

import { AIGenerationRequest } from './types';
import { TRAINING_EXAMPLES } from './trainingExamples';

// Platform config â€” single source of truth - ENHANCED
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
    algorithm: 'Amazon A10 â€” ranks on: relevance, CTR, conversion rate, sales velocity',
    titleFormat: '[Primary Keyword] + [Type/Model] + [Key Specs] + [Use Cases] + [Brand if space]',
    specialRules: 'No promotional language (Sale, Best, #1). Include specific numbers (watts, dimensions, count). List compatible devices/brands. Front-load primary keyword in first 80 chars.',
    seoFocus: 'Front-load high-volume keywords. Include exact match phrases buyers search. Add long-tail keywords naturally. Use numbers and specifications for better ranking. Focus on technical specs and actual product features.',
    conversionTips: 'List specific technical specifications. Include exact measurements and materials. Mention compatibility with specific devices/systems. State actual performance metrics. Use industry-standard terminology.'
  },
  etsy: {
    titleMax: 140,
    titleTarget: '126-140 characters (90-100% of limit) â€” STRICT MAXIMUM 140',
    bulletCount: 5,
    bulletTarget: '100-200 characters each, conversational tone',
    descMin: 400,
    descTarget: '500-1000 characters, story-driven, personal',
    keywordsMax: 13,
    tone: 'Warm, artisanal, personal, story-driven',
    algorithm: 'Etsy Search â€” ranks on: listing quality score, recency, shop performance, tags match',
    titleFormat: '[Item] + [Style/Material] + [Occasion] + [Recipient] + pipe separators (|)',
    specialRules: 'CRITICAL: Title MUST be under 140 characters. Use pipe (|) separators. Include gift occasions (Gift for Her, Birthday Gift). Mention handmade/handcrafted. All 13 tags must be used. Tags max 20 chars each.',
    seoFocus: 'Use all 13 tags strategically. Include gift-related keywords. Add occasion keywords (wedding, birthday, anniversary). Use material keywords. Include style descriptors (vintage, modern, rustic). Focus on craftsmanship and materials.',
    conversionTips: 'Describe the craftsmanship process. List specific materials used. Mention dimensions and measurements. Highlight customization options. Include care instructions. State production time.'
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
    algorithm: 'Google SEO â€” ranks on: title relevance, meta description, page content, backlinks',
    titleFormat: '[Brand] + [Product Name] + [Key Feature] â€” concise, Google-friendly',
    specialRules: 'Title is the SEO title tag â€” keep it natural and clickable. Description should open with a meta description in first 160 chars. Include long-tail keywords naturally.',
    seoFocus: 'Optimize for Google search. Use long-tail keywords. Include location keywords if relevant. Add brand name. Use natural language. Include product category keywords. Focus on specific features and specifications.',
    conversionTips: 'List technical specifications. Include exact dimensions and materials. State shipping details. Mention return policy. Provide size charts. Include compatibility information.'
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
    algorithm: 'eBay Cassini â€” ranks on: title keyword match, item specifics, seller metrics, price',
    titleFormat: '[Brand] + [Model/Type] + [Key Spec] + [Condition if used] + [Compatible With]',
    specialRules: 'Include brand, model number, condition. List compatibility. Include key specs in title. No promotional terms.',
    seoFocus: 'Use exact brand and model names. Include condition keywords (New, Used, Refurbished). Add compatibility keywords. Use specific model numbers. Include size/color in title. List technical specifications.',
    conversionTips: 'State exact condition with details. List all included items. Provide precise measurements. Mention compatibility with specific models. Include shipping details. State return policy clearly.'
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
    algorithm: 'Walmart Search â€” ranks on: relevance, price competitiveness, item performance, reviews',
    titleFormat: '[Brand] + [Quality Descriptor] + [Item Type] + [Key Feature] + [Pack Count]',
    specialRules: 'Family-friendly tone only. Emphasize value and quantity. Include pack sizes. Practical language.',
    seoFocus: 'Emphasize value keywords (Pack, Bundle, Set). Include family-friendly terms. Add practical use cases. Use quality descriptors. Include quantity in title. Focus on specifications and pack contents.',
    conversionTips: 'List exact quantity and pack size. Include dimensions per item. State total weight. Mention durability specifications. List all included items. Provide usage instructions.'
  },
  woocommerce: {
    titleMax: 70,
    titleTarget: '60-70 characters for SEO',
    bulletCount: 5,
    bulletTarget: '100-200 characters each, benefit-first',
    descMin: 400,
    descTarget: '500-1000 characters, brand-voice, engaging, SEO-optimized',
    keywordsMax: 12,
    tone: 'Brand-aligned, engaging, conversion-focused, SEO-optimized',
    algorithm: 'Google SEO + WooCommerce Search â€” ranks on: title relevance, meta description, product content, schema markup, reviews',
    titleFormat: '[Brand] + [Product Name] + [Key Feature] + [Benefit] â€” natural, Google-friendly',
    specialRules: 'Title is the SEO title tag â€” keep it natural and clickable. Description should open with a meta description in first 160 chars. Include long-tail keywords naturally. Use schema-friendly language. Focus on conversions.',
    seoFocus: 'Optimize for Google search and WooCommerce internal search. Use long-tail keywords. Include location keywords if relevant. Add brand name. Use natural language. Include product category keywords. Focus on specific features and specifications. Add schema-friendly structured data.',
    conversionTips: 'List technical specifications. Include exact dimensions and materials. State shipping details. Mention return policy. Provide size charts. Include compatibility information. Add trust signals (warranty, guarantees). Use persuasive benefit-driven language.'
  }
};

const PROHIBITED = [
  // Absolutely forbidden - will cause rejection
  'FREE', 'SALE', 'BEST', '#1', 'CHEAP', 'GUARANTEE', 'WINNER',
  'AMAZING', 'INCREDIBLE', 'UNBELIEVABLE', 'PERFECT', 'ULTIMATE',
  'REVOLUTIONARY', 'MIRACLE', 'MAGIC', 'INSTANT', 'EASY MONEY',
  'PREMIUM', 'LUXURY', 'EXCLUSIVE', 'LIMITED', 'SPECIAL OFFER',
  'SOLVE YOUR PROBLEM', 'GAME CHANGER', 'MUST HAVE', 'LIFE CHANGING',
  'TOP RATED', 'AWARD WINNING', 'WORLD CLASS', 'INDUSTRY LEADING',
  'TRANSFORM YOUR', 'CHANGE EVERYTHING', 'NEVER BEFORE', 'BREAKTHROUGH',
  'STATE OF THE ART', 'NEXT LEVEL', 'TAKE IT TO', 'CUTTING EDGE',
  'ELEVATE YOUR', 'UNLOCK', 'DISCOVER THE SECRET', 'PROFESSIONAL GRADE',
  'MILITARY GRADE', 'HOSPITAL GRADE', 'COMMERCIAL GRADE', 'STUDIO QUALITY',
  'BEST VALUE', 'SOLVE YOUR', 'PROBLEM SOLVER', 'SOLUTION FOR',
  'BEST FOR', 'BEST CHOICE', 'TOP CHOICE', 'FIRST CHOICE',
  
  // Generic filler words - add NO value
  'PREMIUM QUALITY', 'HIGH QUALITY', 'TOP QUALITY', 'SUPERIOR QUALITY',
  'PROFESSIONAL', 'PRO', 'ELITE', 'DELUXE', 'PLUS', 'MAX', 'ULTRA',
  'SUPER', 'EXTRA', 'SPECIAL', 'UNIQUE', 'EXCEPTIONAL', 'OUTSTANDING',
  'REMARKABLE', 'IMPRESSIVE', 'STUNNING', 'BEAUTIFUL', 'ELEGANT',
  'STYLISH', 'MODERN', 'CONTEMPORARY', 'CLASSIC', 'TRADITIONAL',
  'INNOVATIVE', 'ADVANCED', 'ENHANCED', 'IMPROVED', 'UPGRADED',
  'NEXT GENERATION', 'LATEST', 'NEWEST', 'BRAND NEW', 'ALL NEW',
  'GRADE A', 'GRADE B', 'FIRST CLASS', 'WORLD CLASS', 'TOP TIER',
  'HIGH END', 'UPSCALE', 'REFINED', 'SOPHISTICATED', 'EXQUISITE',
  
  // Problem/solution marketing phrases
  'YOUR PROBLEM', 'THE PROBLEM', 'SOLVE', 'SOLUTION', 'FIX YOUR',
  'END YOUR', 'STOP YOUR', 'NO MORE', 'SAY GOODBYE TO', 'ELIMINATE'
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
    keywordStrategy: 'Include format, compatibility, instant access, download, printable. Use software/platform names. For Etsy: emphasize instant download, DIY, customizable, editable.',
    titleEmphasis: 'Lead with product type + format + use case (PDF Printable, Digital Download, Instant Access). For Etsy: include occasion/recipient (Wedding, Birthday, Gift for Her)',
    descriptionFocus: 'What they get (files, formats), how to access (instant download), compatibility (software needed), usage rights (personal/commercial), what they can do with it (print, edit, customize)',
    bulletPriority: 'Instant Download, File Formats Included (PDF, PNG, JPG), Editable/Customizable, Print at Home, Commercial Use Rights'
  },
  beauty: {
    keywordStrategy: 'Include active ingredients (Collagen, Niacinamide, Hyaluronic Acid), skin type (dry, oily, combination), benefits (hydrating, anti-aging, brightening), texture (cream, serum, gel)',
    titleEmphasis: 'Lead with product type + key active ingredients + primary benefit + skin type',
    descriptionFocus: 'Active ingredients and their benefits, how they work together (formula synergy), skin concerns addressed, texture and absorption, application instructions, suitable skin types',
    bulletPriority: 'Key Active Ingredients & Benefits, Skin Concerns Addressed, Texture & Absorption, Suitable Skin Types, Application Method'
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
   * Build prompt â€” returns separate system + user prompts
   */
  static buildPrompt(request: AIGenerationRequest): BuiltPrompt {
    const cfg = PLATFORM_CONFIG[request.platform] || PLATFORM_CONFIG['amazon'];
    
    return {
      systemInstruction: this.buildSystemInstruction(request.platform, cfg),
      userPrompt: this.buildUserPrompt(request, cfg)
    };
  }

  // â”€â”€â”€ SYSTEM INSTRUCTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  
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

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ðŸš¨ CRITICAL RULES - VIOLATION = AUTOMATIC REJECTION ðŸš¨
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

âš ï¸  YOUR OUTPUT WILL BE AUTOMATICALLY REJECTED IF:

1. âŒ TITLE USES LESS THAN 90% OF ${cfg.titleMax} CHARACTERS
   - Target: ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} characters
   - Example BAD: "Wireless Mouse" (14 chars = 7% utilization) âŒ
   - Example GOOD: "Wireless Bluetooth Mouse - Ergonomic Silent Click Design - 2400 DPI Adjustable Sensor - Rechargeable Battery 60-Day Life - Compatible Windows Mac iPad Laptop PC - Office Home Gaming" (192 chars = 96% utilization) âœ…

2. âŒ CONTAINS ANY OF THESE FORBIDDEN WORDS:
   
   ðŸš« ABSOLUTELY NEVER USE THESE WORDS - THEY WILL CAUSE IMMEDIATE REJECTION:
   
   Best, Premium, Professional, Ultimate, Perfect, Amazing, Incredible, Quality, 
   Grade, Advanced, Enhanced, Improved, Elite, Pro, Plus, Max, Ultra, Super, 
   Deluxe, Luxury, Exclusive, Revolutionary, Game Changer, Must Have, Life Changing, 
   Solve Your Problem, Best Value, Top Rated, Award Winning, World Class, 
   Industry Leading, Breakthrough, Cutting Edge, State of the Art, Next Level, 
   High-Quality, Top-Quality, Superior, Exceptional, Outstanding, Remarkable, 
   Impressive, Stunning, Beautiful, Elegant, Stylish, Modern, Contemporary, 
   Classic, Traditional, Innovative, Guarantee, Winner, Cheap, Sale, Free
   
   âŒ WRONG EXAMPLES (DO NOT COPY):
   - "Premium Quality Wireless Mouse - Professional Grade" 
   - "Ultimate Solution for Perfect Results"
   - "Best Value High-Quality Product"
   - "Amazing Professional-Grade Performance"
   
   âœ… CORRECT EXAMPLES (USE THIS STYLE):
   - "Wireless Bluetooth Mouse - 2400 DPI Sensor - Rechargeable Battery"
   - "Collagen Niacinamide Jelly Cream - Hydrating Face Moisturizer"
   - "Stainless Steel Water Bottle - 32oz Double Wall Insulated"

3. âŒ INVENTS SPECIFICATIONS NOT IN INPUT DATA
   Example BAD: Adding "1.7oz" when weight not provided âŒ
   Example GOOD: Only using specifications explicitly given âœ…

4. âŒ DESCRIPTION SHORTER THAN ${cfg.descMin} CHARACTERS
   - Minimum required: ${cfg.descMin} characters
   - Target: ${cfg.descMin * 2}+ characters for best SEO

5. âŒ KEYWORDS ARE META WORDS
   Example BAD: "productdescription", "features", "quality", "premium" âŒ
   Example GOOD: "wireless bluetooth mouse", "2400 dpi", "rechargeable" âœ…

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
âœ… WHAT YOU MUST DO INSTEAD:
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

âœ“ Use SPECIFIC technical terms: "Bluetooth 5.0", "2400 DPI", "Stainless Steel 304"
âœ“ Use ACTUAL measurements: "50ml", "6-cup capacity", "24-inch"
âœ“ Use REAL materials: "Genuine Leather", "Aluminum Alloy", "Tempered Glass"
âœ“ Use SPECIFIC ingredients: "Collagen Peptides", "Niacinamide", "Hyaluronic Acid"
âœ“ Use QUANTIFIABLE features: "40-hour battery", "1080p resolution", "5-year warranty"

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

YOUR EXPERTISE:
- Deep knowledge of ${cfg.algorithm}
- Conversion rate optimization (CRO) psychology
- Professional keyword research and strategic placement
- Benefit-driven copywriting that drives purchases
- ${platform.toUpperCase()}-specific best practices and ranking factors

âš ï¸ CRITICAL SEO SCORE REQUIREMENT:
Your output MUST achieve an 80+ SEO score. This requires:
âœ“ Title using 85-100% of character limit (MANDATORY)
âœ“ Zero prohibited words (MANDATORY)
âœ“ Benefit-first bullet structure (70%+ of bullets)
âœ“ Specific details in bullets (numbers, materials, specs)
âœ“ Description meeting minimum length requirement
âœ“ Natural keyword integration throughout
âœ“ Professional, conversion-focused copy

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
5. PROHIBITED WORDS â€” NEVER USE: ${PROHIBITED.join(', ')}
6. BANNED FILLER WORDS â€” DO NOT USE: Premium, Professional, Grade, Quality, High-Quality, Top-Quality, Superior, Enhanced, Advanced, Improved, Upgraded, Deluxe, Elite, Pro, Plus, Max, Ultra, Super, Extra, Special, Unique, Exceptional, Outstanding, Remarkable, Impressive, Stunning, Beautiful, Elegant, Stylish, Modern, Contemporary, Classic, Traditional, Innovative, Revolutionary, Cutting-Edge, State-of-the-Art, Next-Generation, Latest, Newest, Brand-New, All-New
7. TONE: ${cfg.tone}
8. TITLE FORMAT: ${cfg.titleFormat}
9. PLATFORM RULES: ${cfg.specialRules}
10. NEVER INVENT SPECIFICATIONS â€” Only use specifications explicitly provided in the input. DO NOT add measurements, weights, sizes, or quantities (like "1.7oz", "12oz", "24 inches") unless they are in the original product data.
11. DEEP PRODUCT ANALYSIS REQUIRED â€” Analyze the actual product name, description, and category to understand what it REALLY is. Extract REAL features from the input, not generic adjectives.

CRITICAL: DO NOT MAKE UP SPECIFICATIONS OR USE FILLER WORDS
- If no size/weight/dimensions are provided, DO NOT add them
- If no quantity is provided, DO NOT add "1.7oz", "12oz", or any measurements
- Only use specifications that are explicitly in the product data
- DO NOT use generic filler words like "Premium", "Professional", "Grade", "Quality"
- ANALYZE the actual product and extract REAL, SPECIFIC features
- When in doubt, leave it out â€” never fabricate product details or add meaningless adjectives

EXAMPLES OF WHAT NOT TO DO:
âŒ "Premium Professional Grade Collagen Cream" (generic filler words)
âŒ "High-Quality Advanced Formula Moisturizer" (meaningless adjectives)
âŒ "Superior Elite Pro Wireless Mouse" (stacked generic words)

EXAMPLES OF WHAT TO DO:
âœ“ "Collagen Niacinamide Jelly Cream â€” Hydrating Face Moisturizer for Dry Skin"
âœ“ "Wireless Bluetooth Mouse â€” Ergonomic Design with Silent Click Technology"
âœ“ "Stainless Steel Water Bottle â€” Double-Wall Vacuum Insulated, Leak-Proof Lid"

BULLET STRUCTURE (mandatory format):
[BENEFIT IN CAPS] â€” [Feature description with specific details, numbers, materials, measurements]

Example: "LONG-LASTING BATTERY â€” 40-hour playtime on a single charge keeps you listening through workouts, commutes, and long travel days without ever reaching for a charger"

A/B TESTING VARIATIONS (if requested):
When generating title variations for A/B testing, you MUST:
- Base variations on ACTUAL PRODUCT FEATURES, not generic marketing phrases
- Use DIFFERENT TECHNICAL SPECIFICATIONS in each variation (material, size, capacity, power, etc.)
- Lead with DIFFERENT PRODUCT ATTRIBUTES (brand, type, feature, benefit)
- NEVER use generic phrases like "Solve Your Problem", "Best Value", "Premium Quality"
- Each variation should emphasize a DIFFERENT REAL ASPECT of the product

GOOD A/B Testing Examples:
âœ“ Version A: "CafÃ© Racer Men Leather Jacket - 24" Black/Brown Genuine Sheep Skin Leather" (Feature-focused)
âœ“ Version B: "Genuine Sheep Skin Leather - CafÃ© Racer Men Leather Jacket - 24" Black/Brown" (Material-first)
âœ“ Version C: "24" Black/Brown CafÃ© Racer Jacket - Men's Genuine Sheep Skin Leather Motorcycle Style" (Size-first)
âœ“ Version D: "Men's Motorcycle Leather Jacket - CafÃ© Racer Style - 24" Genuine Sheep Skin Black/Brown" (Style-focused)

BAD A/B Testing Examples (NEVER DO THIS):
âœ— "Solve Your Problem - CafÃ© Racer Men Leather Jacket" (Generic marketing fluff)
âœ— "Best Value CafÃ© Racer Men Leather Jacket" (Prohibited phrase)
âœ— "Premium Quality Leather Jacket for Men" (Vague, no specifics)
âœ— "Ultimate CafÃ© Racer Jacket Solution" (Marketing nonsense)

PROFESSIONAL QUALITY STANDARDS:
- Use 90-100% of character limits (CRITICAL for SEO ranking and visibility)
- Front-load primary keyword in first 80 characters of title
- Include specific numbers, dimensions, materials, quantities wherever possible
- Write for humans first, algorithms second â€” must sound natural and professional
- Every claim must be realistic and believable
- No keyword stuffing â€” natural integration only
- Use ONLY product-specific language â€” NO generic marketing words
- Focus on actual specifications, features, and technical details
- Address customer pain points with specific solutions, not vague promises
- Use industry-standard terminology and technical specifications

CRITICAL: ABSOLUTELY FORBIDDEN WORDS AND PHRASES:
You will be REJECTED if you use ANY of these:
- Premium, Luxury, Exclusive, Limited, Special Offer, Solve Your Problem
- Game Changer, Must Have, Life Changing, Top Rated, Award Winning
- World Class, Industry Leading, Revolutionary, Ultimate, Perfect
- Amazing, Incredible, Unbelievable, Best, #1, Winner
- Transform Your Life, Change Everything, Never Before
- Breakthrough, Cutting Edge (unless referring to actual blade technology)
- State of the Art, Next Level, Take It to the Next Level

INSTEAD, ALWAYS USE (ONLY IF PROVIDED IN INPUT):
âœ“ Exact technical specifications (processor model, RAM amount, storage capacity) â€” ONLY if provided
âœ“ Precise measurements (dimensions in inches/cm, weight in lbs/kg) â€” ONLY if provided
âœ“ Specific materials (stainless steel 304, aluminum alloy, tempered glass) â€” ONLY if provided
âœ“ Actual performance metrics (battery life in hours, speed in RPM/GHz) â€” ONLY if provided
âœ“ Compatibility details (works with iPhone 12-15, Windows 10/11, USB-C) â€” ONLY if provided
âœ“ Certifications and standards (FDA approved, CE certified, UL listed) â€” ONLY if provided
âœ“ Quantifiable features (12-hour battery, 1080p resolution, 5-year warranty) â€” ONLY if provided

âš ï¸ CRITICAL WARNING: DO NOT INVENT SPECIFICATIONS
If the product data does NOT include:
- Size/weight/dimensions â†’ DO NOT add "1.7oz", "12oz", "24 inches", etc.
- Quantity/volume â†’ DO NOT add measurements
- Technical specs â†’ DO NOT make up numbers
- Model numbers â†’ DO NOT fabricate codes

ONLY use information explicitly provided in the product data. When in doubt, leave it out!

PROFESSIONAL WRITING EXAMPLES:

BAD (Generic Filler Words):
âœ— "Premium quality rice cooker that will transform your cooking experience"
âœ— "Ultimate solution for perfect rice every time"
âœ— "Professional grade advanced technology for the modern kitchen"
âœ— "High-quality premium professional wireless mouse" (stacked meaningless words)
âœ— "Superior elite pro collagen cream with advanced formula" (generic adjectives)

GOOD (Specific & Descriptive):
âœ“ "CUCKOO 6-Cup Rice Cooker with Twin Pressure System and Induction Heating Technology"
âœ“ "Stainless steel inner pot with 12 preset cooking modes including GABA rice and porridge"
âœ“ "Silent pressure release system operates at 35dB, voice navigation in English and Spanish"
âœ“ "Collagen Niacinamide Jelly Cream â€” Hydrating Face Moisturizer with Anti-Aging Peptides"
âœ“ "Wireless Bluetooth Mouse â€” Ergonomic Design, Silent Click, 2400 DPI Adjustable Sensor"

NOTICE THE DIFFERENCE:
âŒ BAD: Uses generic words that could describe ANY product (premium, professional, quality)
âœ… GOOD: Uses specific features that describe THIS EXACT product (twin pressure, 35dB, niacinamide)

TITLE STRUCTURE RULES:
1. Start with BRAND + PRODUCT TYPE
2. Add KEY SPECIFICATION (capacity, size, model)
3. Include MAIN TECHNOLOGY/FEATURE
4. List SPECIFIC CAPABILITIES
5. End with MODEL NUMBER if space allows

Example: "CUCKOO CRP-PHTR0609FS Twin Pressure Rice Cooker â€“ 6-Cup Uncooked Capacity, Induction Heating, 12 Cooking Modes, Stainless Steel Inner Pot, Voice Navigation, Silent Pressure System"

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

CRITICAL KEYWORD/TAG RULES:
Keywords/tags MUST be:
âœ“ ACTUAL SEARCH TERMS buyers use (e.g., "wireless headphones", "noise cancelling", "bluetooth 5.0")
âœ“ PRODUCT FEATURES (e.g., "waterproof", "rechargeable", "adjustable")
âœ“ TECHNICAL SPECS (e.g., "1080p", "stainless steel", "6-cup capacity")
âœ“ USE CASES (e.g., "gaming", "travel", "workout", "office")
âœ“ COMPATIBILITY (e.g., "iPhone compatible", "USB-C", "Windows 10")
âœ“ MATERIALS (e.g., "genuine leather", "aluminum alloy", "tempered glass")

Keywords/tags MUST NEVER be:
âœ— Generic category words (e.g., "product", "item", "thing")
âœ— Descriptive labels (e.g., "productdescription", "sizes", "features")
âœ— Meta information (e.g., "description", "specifications", "details")
âœ— Marketing fluff (e.g., "quality", "premium", "best")
âœ— Single letters or numbers without context (e.g., "M", "L", "24")

GOOD KEYWORD EXAMPLES:
âœ“ "wireless bluetooth headphones"
âœ“ "noise cancelling technology"
âœ“ "40-hour battery life"
âœ“ "over-ear design"
âœ“ "foldable portable"
âœ“ "built-in microphone"
âœ“ "memory foam cushions"

BAD KEYWORD EXAMPLES (NEVER USE):
âœ— "productdescription"
âœ— "sizes"
âœ— "features"
âœ— "specifications"
âœ— "details"
âœ— "quality"
âœ— "premium"
âœ— "description"

CRITICAL - WHEN TO OPTIMIZE VS WHEN TO KEEP:
- If the input listing is ALREADY EXCELLENT (90%+ character usage, keyword-rich, professional, benefit-driven), you should:
  * Keep the original title/content with minimal changes
  * Return a quality score of 90+ 
  * Add platform_notes: "SEO is already excellent. No major changes needed."
- If the input listing is POOR (low character usage, missing keywords, weak copy), you MUST:
  * Completely rewrite and dramatically improve it
  * Maximize character usage to 90-100%
  * Add missing keywords and benefits
  * Return a significantly better version

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
âš ï¸  FINAL CRITICAL ENFORCEMENT - READ THIS BEFORE GENERATING OUTPUT âš ï¸
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

BEFORE YOU GENERATE ANY OUTPUT, YOU MUST:

1. âœ… VERIFY you completed ALL 4 STEPS (Analyze â†’ Research â†’ Match â†’ Output)
2. âœ… VERIFY your title uses 90-100% of the character limit for ${platform.toUpperCase()}
3. âœ… VERIFY you used ZERO prohibited words (Best, Premium, Professional, Ultimate, Perfect, etc.)
4. âœ… VERIFY you used ZERO generic filler words (Quality, Grade, Advanced, Enhanced, etc.)
5. âœ… VERIFY every feature you mentioned is REAL and from the input data (no invented specs)
6. âœ… VERIFY your description meets the MINIMUM length requirement
7. âœ… VERIFY all keywords are ACTUAL search terms (not meta words like "description", "features")

IF ANY OF THESE CHECKS FAIL â†’ STOP AND REGENERATE

YOUR OUTPUT WILL BE AUTOMATICALLY REJECTED IF IT CONTAINS:
âŒ Words like: Best, Premium, Professional, Ultimate, Perfect, Amazing, Incredible, Quality, Grade
âŒ Phrases like: "Solve Your Problem", "Best Value", "Game Changer", "Must Have"
âŒ Invented specifications not in the input data
âŒ Title using less than 90% of character limit
âŒ Generic keywords like "productdescription", "features", "quality"

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
âš ï¸  MANDATORY PRE-OUTPUT CHECKLIST - VERIFY BEFORE GENERATING âš ï¸
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

BEFORE YOU WRITE ANY OUTPUT, YOU MUST VERIFY:

â–¡ Step 1: Did I analyze the product deeply? (what, why, how, materials, technology)
â–¡ Step 2: Did I research actual buyer keywords? (not generic marketing words)
â–¡ Step 3: Did I match each REAL feature to a SPECIFIC benefit?
â–¡ Step 4: Is my title ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} characters? (90-100% utilization)
â–¡ Step 5: Did I check EVERY word against the forbidden list?
â–¡ Step 6: Did I use ZERO generic words? (Premium, Professional, Quality, etc.)
â–¡ Step 7: Did I only use specifications from the input? (no invented data)
â–¡ Step 8: Is my description ${cfg.descMin}+ characters?
â–¡ Step 9: Are ALL my keywords actual search terms? (not "productdescription", "features")
â–¡ Step 10: Did I include specific numbers, materials, and technical details?

IF ANY CHECKBOX IS UNCHECKED â†’ STOP AND FIX IT BEFORE GENERATING

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ðŸš« FINAL WARNING - READ THIS SENTENCE BEFORE WRITING ANYTHING:
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

DO NOT USE: Best, Premium, Professional, Ultimate, Perfect, Amazing, Quality, Grade, Pro

INSTEAD USE: Specific technical terms, actual measurements, real materials, quantifiable features

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

=== REQUIRED JSON OUTPUT (return this exact structure) ===
{
  "title": "optimized title â€” must be ${cfg.titleTarget}, use 90-100% of characters",
  "bullets": [
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials"${cfg.bulletCount === 6 ? ',\n    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials"' : ''}
  ],
  "description": "full professional product description â€” minimum ${cfg.descMin} characters, keyword-rich, benefit-driven, addresses customer questions",
  "keywords": [
    "primary-search-term",
    "secondary-feature-keyword",
    "technical-specification",
    "use-case-keyword",
    "material-or-compatibility"
  ],
  "platform_notes": "Brief summary of key optimization decisions made for ${platform.toUpperCase()} algorithm"
}

REMEMBER: 
- NO words like: Best, Premium, Professional, Ultimate, Perfect, Quality, Grade
- Title MUST be ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} characters
- Description MUST be ${cfg.descMin}+ characters
- Keywords MUST be actual search terms

NOW GENERATE THE OUTPUT FOLLOWING ALL RULES ABOVE.`;
  }

  // â”€â”€â”€ USER PROMPT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  
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
    const productType = (productData as any).productType || this.detectProductType(productData, request.platform);
    const typeGuidance = PRODUCT_TYPE_GUIDANCE[productType] || PRODUCT_TYPE_GUIDANCE['physical'];
    
    prompt += `=== PRODUCT TYPE: ${productType.toUpperCase()} ===\n`;
    
    // Special handling for beauty/skincare products
    if (productType === 'beauty') {
      prompt += `âš ï¸ BEAUTY/SKINCARE PRODUCT DETECTED - ANALYZE FORMULA & BENEFITS:\n`;
      prompt += `\n`;
      prompt += `STEP 1 - IDENTIFY ACTIVE INGREDIENTS:\n`;
      prompt += `- Extract ALL active ingredients from title/description (Collagen, Niacinamide, Hyaluronic Acid, Peptides, Vitamins, etc.)\n`;
      prompt += `- List each ingredient separately\n`;
      prompt += `- DO NOT use generic terms like "active ingredients" - name them specifically\n`;
      prompt += `\n`;
      prompt += `STEP 2 - ANALYZE EACH INGREDIENT'S BENEFIT:\n`;
      prompt += `- Collagen: Improves skin elasticity, reduces fine lines, firms skin\n`;
      prompt += `- Niacinamide: Brightens skin tone, minimizes pores, reduces redness\n`;
      prompt += `- Hyaluronic Acid: Deep hydration, plumps skin, retains moisture\n`;
      prompt += `- Peptides: Stimulates collagen production, anti-aging, firms skin\n`;
      prompt += `- Vitamin C: Brightens, evens skin tone, antioxidant protection\n`;
      prompt += `- Retinol: Reduces wrinkles, improves texture, increases cell turnover\n`;
      prompt += `\n`;
      prompt += `STEP 3 - IDENTIFY SKIN CONCERNS ADDRESSED:\n`;
      prompt += `- What problems does this formula solve? (dryness, aging, dullness, uneven tone, fine lines, wrinkles, dark spots)\n`;
      prompt += `- What skin types benefit most? (dry, oily, combination, sensitive, mature, all skin types)\n`;
      prompt += `\n`;
      prompt += `STEP 4 - DESCRIBE TEXTURE & APPLICATION:\n`;
      prompt += `- What is the texture? (lightweight gel, rich cream, silky serum, jelly cream, etc.)\n`;
      prompt += `- How does it absorb? (fast-absorbing, non-greasy, lightweight, rich, etc.)\n`;
      prompt += `- When to use? (morning, night, day and night)\n`;
      prompt += `\n`;
      prompt += `STEP 5 - BUILD TITLE WITH REAL BENEFITS:\n`;
      prompt += `- Start with product type (Face Cream, Serum, Moisturizer, etc.)\n`;
      prompt += `- Add key active ingredients (Collagen Niacinamide, Hyaluronic Acid, etc.)\n`;
      prompt += `- Include primary benefit (Hydrating, Anti-Aging, Brightening, Firming)\n`;
      prompt += `- Add skin concern (for Dry Skin, for Fine Lines, for Dull Skin)\n`;
      prompt += `- DO NOT use: "Solve Your Problem", "Best Value", "Best For", generic marketing phrases\n`;
      prompt += `\n`;
      prompt += `EXAMPLE GOOD TITLE:\n`;
      prompt += `"Collagen Niacinamide Jelly Cream â€” Hydrating Face Moisturizer with Hyaluronic Acid for Dry Skin â€” Reduces Fine Lines and Brightens Complexion"\n`;
      prompt += `\n`;
      prompt += `EXAMPLE BAD TITLES (NEVER DO THIS):\n`;
      prompt += `âŒ "Solve Your Problem - Collagen Niacinamide Jelly Cream"\n`;
      prompt += `âŒ "Best Value Collagen Cream for All Your Skin Needs"\n`;
      prompt += `âŒ "Best For Dry Skin - Face Moisturizer"\n`;
      prompt += `\n\n`;
    }
    
    // Special handling for Etsy digital products
    if (request.platform === 'etsy' && productType === 'digital') {
      prompt += `âš ï¸ ETSY DIGITAL PRODUCT DETECTED - SPECIAL REQUIREMENTS:\n`;
      prompt += `- Emphasize "Instant Download" and "Digital File" in title\n`;
      prompt += `- Include file formats (PDF, PNG, JPG, SVG, etc.)\n`;
      prompt += `- Mention if editable/customizable\n`;
      prompt += `- State if printable at home\n`;
      prompt += `- Clarify usage rights (personal use, commercial use)\n`;
      prompt += `- Include occasion/recipient keywords (Wedding, Birthday, Gift)\n`;
      prompt += `- Use pipe separators (|) between key phrases\n`;
      prompt += `- All 13 tags MUST be used\n\n`;
    }
    
    prompt += `Keyword Strategy: ${typeGuidance.keywordStrategy}\n`;
    prompt += `Title Emphasis: ${typeGuidance.titleEmphasis}\n`;
    prompt += `Description Focus: ${typeGuidance.descriptionFocus}\n`;
    prompt += `Bullet Priority: ${typeGuidance.bulletPriority}\n\n`;

    // Product data
    prompt += '=== PRODUCT INFORMATION ===\n';
    if (productData.title) prompt += `Current Title: ${productData.title}\n`;
    if (productData.description) prompt += `Current Description: ${productData.description}\n`;
    if (productData.category) prompt += `Category: ${productData.category}\n`;
    if ((productData as any).brand) prompt += `Brand: ${(productData as any).brand}\n`;
    if (productData.price) prompt += `Price: $${productData.price}\n`;
    
    if (productData.specifications?.length) {
      prompt += 'Specifications:\n';
      productData.specifications.forEach(s => {
        prompt += `  â€¢ ${s.name}: ${s.value}${s.unit ? ' ' + s.unit : ''}\n`;
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

    // â”€â”€â”€ FINAL OUTPUT INSTRUCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    prompt += `
REMINDER â€” APPLY ALL RULES FROM SYSTEM INSTRUCTIONS:
- Use 90-100% of title character limit (${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} chars)
- Zero prohibited words (Best, Premium, Professional, Quality, Grade, etc.)
- Only use specifications explicitly in the product data
- Benefit-first bullets: "BENEFIT â€” feature with specific details"
- Description minimum ${cfg.descMin} characters
- Keywords must be actual buyer search terms
`;

    prompt += `
âš ï¸ TITLE CHARACTER COUNT ENFORCEMENT â€” DO THIS BEFORE WRITING THE TITLE:
1. Write your title draft
2. COUNT the characters (spaces count too)
3. Current limit: ${cfg.titleMax} characters. Target: ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} chars
4. If your draft is UNDER ${Math.floor(cfg.titleMax * 0.9)} characters â†’ ADD MORE FEATURES, SPECS, USE CASES, COMPATIBILITY
5. Keep adding until you reach ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} characters

=== REQUIRED JSON OUTPUT (return this exact structure) ===
{
  "title": "optimized title â€” must be ${cfg.titleTarget}, use 90-100% of characters",
  "bullets": [
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials",
    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials"${cfg.bulletCount === 6 ? ',\n    "BENEFIT KEYWORD â€” detailed feature description with specifics, numbers, materials"' : ''}
  ],
  "description": "full professional product description â€” minimum ${cfg.descMin} characters, keyword-rich, benefit-driven, addresses customer questions",
  "keywords": [
    "primary-search-term",
    "secondary-feature-keyword",
    "technical-specification",
    "use-case-keyword",
    "material-or-compatibility"
  ],
  "platform_notes": "Brief summary of key optimization decisions made for ${request.platform.toUpperCase()} algorithm"
}
`;

    return prompt;
  }

  
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
- Think like a buyer â€” what would make them stop scrolling and click BUY NOW?

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
   * Detect product type from product data
   */
  private static detectProductType(productData: any, platform: string): string {
    const title = (productData.title || '').toLowerCase();
    const description = (productData.description || '').toLowerCase();
    const category = (productData.category || '').toLowerCase();
    const combined = `${title} ${description} ${category}`;
    
    // Beauty/skincare keywords
    const beautyKeywords = [
      'cream', 'serum', 'moisturizer', 'lotion', 'gel', 'mask', 'cleanser',
      'toner', 'essence', 'oil', 'balm', 'treatment', 'skincare', 'skin care',
      'collagen', 'niacinamide', 'hyaluronic', 'retinol', 'vitamin c', 'peptide',
      'anti-aging', 'anti aging', 'wrinkle', 'hydrating', 'brightening',
      'face', 'facial', 'eye cream', 'night cream', 'day cream', 'beauty'
    ];
    
    // Digital product keywords
    const digitalKeywords = [
      'digital', 'download', 'printable', 'pdf', 'instant', 'file', 'template',
      'editable', 'customizable', 'svg', 'png', 'jpg', 'jpeg', 'print at home',
      'diy', 'planner', 'worksheet', 'ebook', 'guide', 'checklist'
    ];
    
    // Handmade keywords
    const handmadeKeywords = [
      'handmade', 'handcrafted', 'artisan', 'handwoven', 'hand-made',
      'hand crafted', 'hand painted', 'hand sewn', 'custom made'
    ];
    
    // Vintage keywords
    const vintageKeywords = [
      'vintage', 'antique', 'retro', 'collectible', 'rare',
      '1950s', '1960s', '1970s', '1980s', '1990s'
    ];
    
    // Check for beauty/skincare (highest priority for this use case)
    if (beautyKeywords.some(keyword => combined.includes(keyword))) {
      return 'beauty';
    }
    
    // Check for digital
    if (digitalKeywords.some(keyword => combined.includes(keyword))) {
      return 'digital';
    }
    
    // Check for handmade (especially for Etsy)
    if (platform === 'etsy' && handmadeKeywords.some(keyword => combined.includes(keyword))) {
      return 'handmade';
    }
    
    // Check for vintage
    if (vintageKeywords.some(keyword => combined.includes(keyword))) {
      return 'vintage';
    }
    
    // Default to physical
    return 'physical';
  }

  /**
   * Legacy string-based buildPrompt â€” for backward compatibility
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
