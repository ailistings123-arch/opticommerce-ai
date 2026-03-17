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
    seoFocus: 'Front-load high-volume keywords. Include exact match phrases buyers search. Add long-tail keywords naturally. Use numbers and specifications for better ranking. Focus on technical specs and actual product features.',
    conversionTips: 'List specific technical specifications. Include exact measurements and materials. Mention compatibility with specific devices/systems. State actual performance metrics. Use industry-standard terminology.'
  },
  etsy: {
    titleMax: 140,
    titleTarget: '126-140 characters (90-100% of limit) — STRICT MAXIMUM 140',
    bulletCount: 5,
    bulletTarget: '100-200 characters each, conversational tone',
    descMin: 400,
    descTarget: '500-1000 characters, story-driven, personal',
    keywordsMax: 13,
    tone: 'Warm, artisanal, personal, story-driven',
    algorithm: 'Etsy Search — ranks on: listing quality score, recency, shop performance, tags match',
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
    algorithm: 'Google SEO — ranks on: title relevance, meta description, page content, backlinks',
    titleFormat: '[Brand] + [Product Name] + [Key Feature] — concise, Google-friendly',
    specialRules: 'Title is the SEO title tag — keep it natural and clickable. Description should open with a meta description in first 160 chars. Include long-tail keywords naturally.',
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
    algorithm: 'eBay Cassini — ranks on: title keyword match, item specifics, seller metrics, price',
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
    algorithm: 'Walmart Search — ranks on: relevance, price competitiveness, item performance, reviews',
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
    algorithm: 'Google SEO + WooCommerce Search — ranks on: title relevance, meta description, product content, schema markup, reviews',
    titleFormat: '[Brand] + [Product Name] + [Key Feature] + [Benefit] — natural, Google-friendly',
    specialRules: 'Title is the SEO title tag — keep it natural and clickable. Description should open with a meta description in first 160 chars. Include long-tail keywords naturally. Use schema-friendly language. Focus on conversions.',
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

═══════════════════════════════════════════════════════════════════════════
🚨 CRITICAL RULES - VIOLATION = AUTOMATIC REJECTION 🚨
═══════════════════════════════════════════════════════════════════════════

⚠️  YOUR OUTPUT WILL BE AUTOMATICALLY REJECTED IF:

1. ❌ TITLE USES LESS THAN 90% OF ${cfg.titleMax} CHARACTERS
   - Target: ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} characters
   - Example BAD: "Wireless Mouse" (14 chars = 7% utilization) ❌
   - Example GOOD: "Wireless Bluetooth Mouse - Ergonomic Silent Click Design - 2400 DPI Adjustable Sensor - Rechargeable Battery 60-Day Life - Compatible Windows Mac iPad Laptop PC - Office Home Gaming" (192 chars = 96% utilization) ✅

2. ❌ CONTAINS ANY OF THESE FORBIDDEN WORDS:
   
   🚫 ABSOLUTELY NEVER USE THESE WORDS - THEY WILL CAUSE IMMEDIATE REJECTION:
   
   Best, Premium, Professional, Ultimate, Perfect, Amazing, Incredible, Quality, 
   Grade, Advanced, Enhanced, Improved, Elite, Pro, Plus, Max, Ultra, Super, 
   Deluxe, Luxury, Exclusive, Revolutionary, Game Changer, Must Have, Life Changing, 
   Solve Your Problem, Best Value, Top Rated, Award Winning, World Class, 
   Industry Leading, Breakthrough, Cutting Edge, State of the Art, Next Level, 
   High-Quality, Top-Quality, Superior, Exceptional, Outstanding, Remarkable, 
   Impressive, Stunning, Beautiful, Elegant, Stylish, Modern, Contemporary, 
   Classic, Traditional, Innovative, Guarantee, Winner, Cheap, Sale, Free
   
   ❌ WRONG EXAMPLES (DO NOT COPY):
   - "Premium Quality Wireless Mouse - Professional Grade" 
   - "Ultimate Solution for Perfect Results"
   - "Best Value High-Quality Product"
   - "Amazing Professional-Grade Performance"
   
   ✅ CORRECT EXAMPLES (USE THIS STYLE):
   - "Wireless Bluetooth Mouse - 2400 DPI Sensor - Rechargeable Battery"
   - "Collagen Niacinamide Jelly Cream - Hydrating Face Moisturizer"
   - "Stainless Steel Water Bottle - 32oz Double Wall Insulated"

3. ❌ INVENTS SPECIFICATIONS NOT IN INPUT DATA
   Example BAD: Adding "1.7oz" when weight not provided ❌
   Example GOOD: Only using specifications explicitly given ✅

4. ❌ DESCRIPTION SHORTER THAN ${cfg.descMin} CHARACTERS
   - Minimum required: ${cfg.descMin} characters
   - Target: ${cfg.descMin * 2}+ characters for best SEO

5. ❌ KEYWORDS ARE META WORDS
   Example BAD: "productdescription", "features", "quality", "premium" ❌
   Example GOOD: "wireless bluetooth mouse", "2400 dpi", "rechargeable" ✅

═══════════════════════════════════════════════════════════════════════════
✅ WHAT YOU MUST DO INSTEAD:
═══════════════════════════════════════════════════════════════════════════

✓ Use SPECIFIC technical terms: "Bluetooth 5.0", "2400 DPI", "Stainless Steel 304"
✓ Use ACTUAL measurements: "50ml", "6-cup capacity", "24-inch"
✓ Use REAL materials: "Genuine Leather", "Aluminum Alloy", "Tempered Glass"
✓ Use SPECIFIC ingredients: "Collagen Peptides", "Niacinamide", "Hyaluronic Acid"
✓ Use QUANTIFIABLE features: "40-hour battery", "1080p resolution", "5-year warranty"

═══════════════════════════════════════════════════════════════════════════

YOUR EXPERTISE:
- Deep knowledge of ${cfg.algorithm}
- Conversion rate optimization (CRO) psychology
- Professional keyword research and strategic placement
- Benefit-driven copywriting that drives purchases
- ${platform.toUpperCase()}-specific best practices and ranking factors

⚠️ CRITICAL SEO SCORE REQUIREMENT:
Your output MUST achieve an 80+ SEO score. This requires:
✓ Title using 85-100% of character limit (MANDATORY)
✓ Zero prohibited words (MANDATORY)
✓ Benefit-first bullet structure (70%+ of bullets)
✓ Specific details in bullets (numbers, materials, specs)
✓ Description meeting minimum length requirement
✓ Natural keyword integration throughout
✓ Professional, conversion-focused copy

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
6. BANNED FILLER WORDS — DO NOT USE: Premium, Professional, Grade, Quality, High-Quality, Top-Quality, Superior, Enhanced, Advanced, Improved, Upgraded, Deluxe, Elite, Pro, Plus, Max, Ultra, Super, Extra, Special, Unique, Exceptional, Outstanding, Remarkable, Impressive, Stunning, Beautiful, Elegant, Stylish, Modern, Contemporary, Classic, Traditional, Innovative, Revolutionary, Cutting-Edge, State-of-the-Art, Next-Generation, Latest, Newest, Brand-New, All-New
7. TONE: ${cfg.tone}
8. TITLE FORMAT: ${cfg.titleFormat}
9. PLATFORM RULES: ${cfg.specialRules}
10. NEVER INVENT SPECIFICATIONS — Only use specifications explicitly provided in the input. DO NOT add measurements, weights, sizes, or quantities (like "1.7oz", "12oz", "24 inches") unless they are in the original product data.
11. DEEP PRODUCT ANALYSIS REQUIRED — Analyze the actual product name, description, and category to understand what it REALLY is. Extract REAL features from the input, not generic adjectives.

CRITICAL: DO NOT MAKE UP SPECIFICATIONS OR USE FILLER WORDS
- If no size/weight/dimensions are provided, DO NOT add them
- If no quantity is provided, DO NOT add "1.7oz", "12oz", or any measurements
- Only use specifications that are explicitly in the product data
- DO NOT use generic filler words like "Premium", "Professional", "Grade", "Quality"
- ANALYZE the actual product and extract REAL, SPECIFIC features
- When in doubt, leave it out — never fabricate product details or add meaningless adjectives

EXAMPLES OF WHAT NOT TO DO:
❌ "Premium Professional Grade Collagen Cream" (generic filler words)
❌ "High-Quality Advanced Formula Moisturizer" (meaningless adjectives)
❌ "Superior Elite Pro Wireless Mouse" (stacked generic words)

EXAMPLES OF WHAT TO DO:
✓ "Collagen Niacinamide Jelly Cream — Hydrating Face Moisturizer for Dry Skin"
✓ "Wireless Bluetooth Mouse — Ergonomic Design with Silent Click Technology"
✓ "Stainless Steel Water Bottle — Double-Wall Vacuum Insulated, Leak-Proof Lid"

BULLET STRUCTURE (mandatory format):
[BENEFIT IN CAPS] — [Feature description with specific details, numbers, materials, measurements]

Example: "LONG-LASTING BATTERY — 40-hour playtime on a single charge keeps you listening through workouts, commutes, and long travel days without ever reaching for a charger"

A/B TESTING VARIATIONS (if requested):
When generating title variations for A/B testing, you MUST:
- Base variations on ACTUAL PRODUCT FEATURES, not generic marketing phrases
- Use DIFFERENT TECHNICAL SPECIFICATIONS in each variation (material, size, capacity, power, etc.)
- Lead with DIFFERENT PRODUCT ATTRIBUTES (brand, type, feature, benefit)
- NEVER use generic phrases like "Solve Your Problem", "Best Value", "Premium Quality"
- Each variation should emphasize a DIFFERENT REAL ASPECT of the product

GOOD A/B Testing Examples:
✓ Version A: "Café Racer Men Leather Jacket - 24" Black/Brown Genuine Sheep Skin Leather" (Feature-focused)
✓ Version B: "Genuine Sheep Skin Leather - Café Racer Men Leather Jacket - 24" Black/Brown" (Material-first)
✓ Version C: "24" Black/Brown Café Racer Jacket - Men's Genuine Sheep Skin Leather Motorcycle Style" (Size-first)
✓ Version D: "Men's Motorcycle Leather Jacket - Café Racer Style - 24" Genuine Sheep Skin Black/Brown" (Style-focused)

BAD A/B Testing Examples (NEVER DO THIS):
✗ "Solve Your Problem - Café Racer Men Leather Jacket" (Generic marketing fluff)
✗ "Best Value Café Racer Men Leather Jacket" (Prohibited phrase)
✗ "Premium Quality Leather Jacket for Men" (Vague, no specifics)
✗ "Ultimate Café Racer Jacket Solution" (Marketing nonsense)

PROFESSIONAL QUALITY STANDARDS:
- Use 90-100% of character limits (CRITICAL for SEO ranking and visibility)
- Front-load primary keyword in first 80 characters of title
- Include specific numbers, dimensions, materials, quantities wherever possible
- Write for humans first, algorithms second — must sound natural and professional
- Every claim must be realistic and believable
- No keyword stuffing — natural integration only
- Use ONLY product-specific language — NO generic marketing words
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
✓ Exact technical specifications (processor model, RAM amount, storage capacity) — ONLY if provided
✓ Precise measurements (dimensions in inches/cm, weight in lbs/kg) — ONLY if provided
✓ Specific materials (stainless steel 304, aluminum alloy, tempered glass) — ONLY if provided
✓ Actual performance metrics (battery life in hours, speed in RPM/GHz) — ONLY if provided
✓ Compatibility details (works with iPhone 12-15, Windows 10/11, USB-C) — ONLY if provided
✓ Certifications and standards (FDA approved, CE certified, UL listed) — ONLY if provided
✓ Quantifiable features (12-hour battery, 1080p resolution, 5-year warranty) — ONLY if provided

⚠️ CRITICAL WARNING: DO NOT INVENT SPECIFICATIONS
If the product data does NOT include:
- Size/weight/dimensions → DO NOT add "1.7oz", "12oz", "24 inches", etc.
- Quantity/volume → DO NOT add measurements
- Technical specs → DO NOT make up numbers
- Model numbers → DO NOT fabricate codes

ONLY use information explicitly provided in the product data. When in doubt, leave it out!

PROFESSIONAL WRITING EXAMPLES:

BAD (Generic Filler Words):
✗ "Premium quality rice cooker that will transform your cooking experience"
✗ "Ultimate solution for perfect rice every time"
✗ "Professional grade advanced technology for the modern kitchen"
✗ "High-quality premium professional wireless mouse" (stacked meaningless words)
✗ "Superior elite pro collagen cream with advanced formula" (generic adjectives)

GOOD (Specific & Descriptive):
✓ "CUCKOO 6-Cup Rice Cooker with Twin Pressure System and Induction Heating Technology"
✓ "Stainless steel inner pot with 12 preset cooking modes including GABA rice and porridge"
✓ "Silent pressure release system operates at 35dB, voice navigation in English and Spanish"
✓ "Collagen Niacinamide Jelly Cream — Hydrating Face Moisturizer with Anti-Aging Peptides"
✓ "Wireless Bluetooth Mouse — Ergonomic Design, Silent Click, 2400 DPI Adjustable Sensor"

NOTICE THE DIFFERENCE:
❌ BAD: Uses generic words that could describe ANY product (premium, professional, quality)
✅ GOOD: Uses specific features that describe THIS EXACT product (twin pressure, 35dB, niacinamide)

TITLE STRUCTURE RULES:
1. Start with BRAND + PRODUCT TYPE
2. Add KEY SPECIFICATION (capacity, size, model)
3. Include MAIN TECHNOLOGY/FEATURE
4. List SPECIFIC CAPABILITIES
5. End with MODEL NUMBER if space allows

Example: "CUCKOO CRP-PHTR0609FS Twin Pressure Rice Cooker – 6-Cup Uncooked Capacity, Induction Heating, 12 Cooking Modes, Stainless Steel Inner Pot, Voice Navigation, Silent Pressure System"

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
✓ ACTUAL SEARCH TERMS buyers use (e.g., "wireless headphones", "noise cancelling", "bluetooth 5.0")
✓ PRODUCT FEATURES (e.g., "waterproof", "rechargeable", "adjustable")
✓ TECHNICAL SPECS (e.g., "1080p", "stainless steel", "6-cup capacity")
✓ USE CASES (e.g., "gaming", "travel", "workout", "office")
✓ COMPATIBILITY (e.g., "iPhone compatible", "USB-C", "Windows 10")
✓ MATERIALS (e.g., "genuine leather", "aluminum alloy", "tempered glass")

Keywords/tags MUST NEVER be:
✗ Generic category words (e.g., "product", "item", "thing")
✗ Descriptive labels (e.g., "productdescription", "sizes", "features")
✗ Meta information (e.g., "description", "specifications", "details")
✗ Marketing fluff (e.g., "quality", "premium", "best")
✗ Single letters or numbers without context (e.g., "M", "L", "24")

GOOD KEYWORD EXAMPLES:
✓ "wireless bluetooth headphones"
✓ "noise cancelling technology"
✓ "40-hour battery life"
✓ "over-ear design"
✓ "foldable portable"
✓ "built-in microphone"
✓ "memory foam cushions"

BAD KEYWORD EXAMPLES (NEVER USE):
✗ "productdescription"
✗ "sizes"
✗ "features"
✗ "specifications"
✗ "details"
✗ "quality"
✗ "premium"
✗ "description"

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

═══════════════════════════════════════════════════════════════════════════
⚠️  FINAL CRITICAL ENFORCEMENT - READ THIS BEFORE GENERATING OUTPUT ⚠️
═══════════════════════════════════════════════════════════════════════════

BEFORE YOU GENERATE ANY OUTPUT, YOU MUST:

1. ✅ VERIFY you completed ALL 4 STEPS (Analyze → Research → Match → Output)
2. ✅ VERIFY your title uses 90-100% of the character limit for ${platform.toUpperCase()}
3. ✅ VERIFY you used ZERO prohibited words (Best, Premium, Professional, Ultimate, Perfect, etc.)
4. ✅ VERIFY you used ZERO generic filler words (Quality, Grade, Advanced, Enhanced, etc.)
5. ✅ VERIFY every feature you mentioned is REAL and from the input data (no invented specs)
6. ✅ VERIFY your description meets the MINIMUM length requirement
7. ✅ VERIFY all keywords are ACTUAL search terms (not meta words like "description", "features")

IF ANY OF THESE CHECKS FAIL → STOP AND REGENERATE

YOUR OUTPUT WILL BE AUTOMATICALLY REJECTED IF IT CONTAINS:
❌ Words like: Best, Premium, Professional, Ultimate, Perfect, Amazing, Incredible, Quality, Grade
❌ Phrases like: "Solve Your Problem", "Best Value", "Game Changer", "Must Have"
❌ Invented specifications not in the input data
❌ Title using less than 90% of character limit
❌ Generic keywords like "productdescription", "features", "quality"

═══════════════════════════════════════════════════════════════════════════
⚠️  MANDATORY PRE-OUTPUT CHECKLIST - VERIFY BEFORE GENERATING ⚠️
═══════════════════════════════════════════════════════════════════════════

BEFORE YOU WRITE ANY OUTPUT, YOU MUST VERIFY:

□ Step 1: Did I analyze the product deeply? (what, why, how, materials, technology)
□ Step 2: Did I research actual buyer keywords? (not generic marketing words)
□ Step 3: Did I match each REAL feature to a SPECIFIC benefit?
□ Step 4: Is my title ${Math.floor(cfg.titleMax * 0.9)}-${cfg.titleMax} characters? (90-100% utilization)
□ Step 5: Did I check EVERY word against the forbidden list?
□ Step 6: Did I use ZERO generic words? (Premium, Professional, Quality, etc.)
□ Step 7: Did I only use specifications from the input? (no invented data)
□ Step 8: Is my description ${cfg.descMin}+ characters?
□ Step 9: Are ALL my keywords actual search terms? (not "productdescription", "features")
□ Step 10: Did I include specific numbers, materials, and technical details?

IF ANY CHECKBOX IS UNCHECKED → STOP AND FIX IT BEFORE GENERATING

═══════════════════════════════════════════════════════════════════════════
🚫 FINAL WARNING - READ THIS SENTENCE BEFORE WRITING ANYTHING:
═══════════════════════════════════════════════════════════════════════════

DO NOT USE: Best, Premium, Professional, Ultimate, Perfect, Amazing, Quality, Grade, Pro

INSTEAD USE: Specific technical terms, actual measurements, real materials, quantifiable features

═══════════════════════════════════════════════════════════════════════════

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
    const productType = (productData as any).productType || this.detectProductType(productData, request.platform);
    const typeGuidance = PRODUCT_TYPE_GUIDANCE[productType] || PRODUCT_TYPE_GUIDANCE['physical'];
    
    prompt += `=== PRODUCT TYPE: ${productType.toUpperCase()} ===\n`;
    
    // Special handling for beauty/skincare products
    if (productType === 'beauty') {
      prompt += `⚠️ BEAUTY/SKINCARE PRODUCT DETECTED - ANALYZE FORMULA & BENEFITS:\n`;
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
      prompt += `"Collagen Niacinamide Jelly Cream — Hydrating Face Moisturizer with Hyaluronic Acid for Dry Skin — Reduces Fine Lines and Brightens Complexion"\n`;
      prompt += `\n`;
      prompt += `EXAMPLE BAD TITLES (NEVER DO THIS):\n`;
      prompt += `❌ "Solve Your Problem - Collagen Niacinamide Jelly Cream"\n`;
      prompt += `❌ "Best Value Collagen Cream for All Your Skin Needs"\n`;
      prompt += `❌ "Best For Dry Skin - Face Moisturizer"\n`;
      prompt += `\n\n`;
    }
    
    // Special handling for Etsy digital products
    if (request.platform === 'etsy' && productType === 'digital') {
      prompt += `⚠️ ETSY DIGITAL PRODUCT DETECTED - SPECIAL REQUIREMENTS:\n`;
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

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE DEEP TRAINING SYSTEM - ALL AI MODELS
    // ═══════════════════════════════════════════════════════════════════════════
    prompt += `
═══════════════════════════════════════════════════════════════════════════
🎯 MASTER AI TRAINING SYSTEM - SYSTEMATIC 4-STEP ANALYSIS FRAMEWORK
═══════════════════════════════════════════════════════════════════════════

This training applies to ALL AI models (Gemini, Groq, Cloudflare, GPT, Claude, etc.)
and ALL platforms (Amazon, Etsy, Shopify, WooCommerce, eBay, Walmart).

YOU MUST FOLLOW THIS EXACT 4-STEP PROCESS FOR EVERY PRODUCT:

┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: DEEP PRODUCT ANALYSIS (ANALYZE)                        │
└─────────────────────────────────────────────────────────────────┘

Before writing ANYTHING, answer these questions by analyzing the input data:

1. WHAT IS IT? (Product Identity)
   - What is the EXACT product name from the input?
   - What category does it belong to? (beauty, electronics, clothing, digital, etc.)
   - What is its PRIMARY function or purpose?
   
2. WHAT ARE THE REAL FEATURES? (Feature Extraction)
   - List EVERY ingredient mentioned (for beauty/food products)
   - List EVERY material mentioned (for physical products)
   - List EVERY technology mentioned (for electronics)
   - List EVERY specification provided (size, weight, capacity, power, etc.)
   - DO NOT add features that aren't in the input data
   
3. WHY IS IT USED? (Use Case Analysis)
   - What problem does it solve?
   - What pain points does it address?
   - Who is the target customer?
   - When/where would someone use this?
   
4. HOW DOES IT WORK? (Mechanism Understanding)
   - How do the ingredients/materials/technology work together?
   - What is the application method or usage process?
   - What makes it effective or different?

EXAMPLE - Beauty Product Analysis:
Input: "Collagen Niacinamide Jelly Cream - moisturizing face cream"

ANALYSIS:
✓ WHAT IS IT? A jelly-textured facial moisturizer
✓ REAL FEATURES: Collagen (ingredient), Niacinamide (ingredient), Jelly texture
✓ WHY USED? To hydrate dry skin, reduce fine lines, brighten complexion
✓ HOW IT WORKS: Collagen improves elasticity, Niacinamide brightens and minimizes pores, jelly texture absorbs quickly

✗ WRONG: "Premium quality moisturizer" (generic, no analysis)
✗ WRONG: "Contains 1.7oz" (not in input data - invented specification)

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: KEYWORD RESEARCH (RESEARCH)                            │
└─────────────────────────────────────────────────────────────────┘

Based on your analysis, identify what buyers actually search for:

1. PRIMARY KEYWORD (Most Important)
   - What is the #1 search term buyers use for this product type?
   - Must be high-volume, exact match to product category
   - Examples: "face moisturizer", "wireless mouse", "yoga mat", "wedding invitation"
   
2. SECONDARY KEYWORDS (Supporting Terms)
   - What are 3-5 related search terms?
   - Include feature-based keywords from your analysis
   - Examples: "collagen cream", "anti-aging moisturizer", "hydrating cream"
   
3. LONG-TAIL KEYWORDS (Specific Phrases)
   - What are 2-3 specific multi-word phrases?
   - Combine product type + feature + benefit
   - Examples: "collagen cream for dry skin", "anti-aging moisturizer with niacinamide"
   
4. TECHNICAL KEYWORDS (Specifications)
   - Include actual specs from your analysis
   - Examples: "50ml", "bluetooth 5.0", "stainless steel", "300 DPI"

EXAMPLE - Keyword Research:
Product: Collagen Niacinamide Jelly Cream

RESEARCH:
✓ PRIMARY: "face moisturizer" (high-volume search term)
✓ SECONDARY: "collagen cream", "niacinamide moisturizer", "anti-aging cream", "hydrating cream"
✓ LONG-TAIL: "collagen niacinamide cream for dry skin", "jelly moisturizer anti-aging"
✓ TECHNICAL: "50ml", "jelly texture", "fast-absorbing"

✗ WRONG: "premium moisturizer" (not a real search term)
✗ WRONG: "best cream" (prohibited phrase)

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: FEATURE-BENEFIT MATCHING (MATCH)                       │
└─────────────────────────────────────────────────────────────────┘

Connect each REAL FEATURE from Step 1 to a SPECIFIC BENEFIT:

For each feature you identified, ask:
- What does this feature DO for the customer?
- What problem does it solve?
- What result does it provide?

FEATURE → BENEFIT MAPPING EXAMPLES:

Beauty Products:
✓ Collagen → Improves skin elasticity, reduces fine lines, firms skin
✓ Niacinamide → Brightens skin tone, minimizes pores, reduces redness
✓ Hyaluronic Acid → Deep hydration, plumps skin, retains moisture
✓ Jelly Texture → Fast-absorbing, non-greasy, lightweight feel

Electronics:
✓ Bluetooth 5.0 → Stable connection, 33ft range, no USB dongle needed
✓ 2400 DPI Sensor → Precise cursor control, adjustable sensitivity
✓ Silent Click → 90% noise reduction, quiet for offices
✓ Rechargeable Battery → 60-day battery life, eco-friendly, no disposable batteries

Physical Products:
✓ Stainless Steel → Durable, rust-resistant, easy to clean
✓ Double-Wall Insulation → Keeps drinks hot 12hrs/cold 24hrs
✓ Leak-Proof Lid → No spills in bags, safe for travel
✓ BPA-Free → Safe for health, no harmful chemicals

Digital Products:
✓ Instant Download → No shipping wait, immediate access
✓ Editable PDF → Customize with your information, no design skills needed
✓ High-Resolution 300 DPI → Professional print quality
✓ Unlimited Prints → Print as many as needed for personal use

✗ WRONG: "Premium quality" → "Best results" (vague, no specific benefit)
✗ WRONG: "Professional grade" → "Professional use" (meaningless marketing)

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: OPTIMIZED OUTPUT GENERATION (OUTPUT)                   │
└─────────────────────────────────────────────────────────────────┘

Now use Steps 1-3 to create your listing:

TITLE FORMULA:
[Primary Keyword] + [Key Features from Analysis] + [Main Benefits] + [Specifications]

TITLE CONSTRUCTION RULES:
1. Start with primary keyword from Step 2
2. Add 2-3 most important features from Step 1
3. Include 1-2 key benefits from Step 3
4. Add specifications if space allows
5. Use 90-100% of character limit
6. NO generic words (Premium, Professional, Quality, Grade, Best, etc.)

BULLET FORMULA:
[BENEFIT IN CAPS] — [Feature explanation] + [Specific details] + [Customer result]

BULLET CONSTRUCTION RULES:
1. Start with benefit keyword in ALL CAPS
2. Explain the feature that provides this benefit
3. Include specific numbers, measurements, materials
4. End with what the customer gets/experiences
5. Each bullet 150-250 characters

DESCRIPTION FORMULA:
Opening Hook + Feature Details + Benefit Explanations + Usage Instructions + Quality Assurance

DESCRIPTION CONSTRUCTION RULES:
1. Open with compelling benefit statement
2. Dedicate paragraph to each major feature
3. Explain how features work together
4. Include usage instructions
5. Add trust signals (certifications, guarantees)
6. Minimum ${cfg.descMin} characters
7. Natural keyword integration

KEYWORDS SELECTION:
- Use ALL keywords from Step 2 (primary, secondary, long-tail, technical)
- Add material keywords (stainless steel, cotton, leather, etc.)
- Add use-case keywords (office, travel, workout, wedding, etc.)
- Add compatibility keywords (iPhone, Windows, USB-C, etc.)
- NO meta words (description, features, quality, premium, etc.)

═══════════════════════════════════════════════════════════════════

🚫 CRITICAL "NEVER DO THIS" EXAMPLES:

❌ BAD TITLE: "Premium Professional Grade Collagen Cream - Best Quality Moisturizer"
   Why bad: Generic filler words, no specific features, "best" is prohibited
   
✅ GOOD TITLE: "Collagen Niacinamide Jelly Cream - Hydrating Face Moisturizer for Dry Skin - Anti-Aging Formula Reduces Fine Lines - 50ml"
   Why good: Specific ingredients, real benefits, actual use case, includes size

❌ BAD TITLE: "Solve Your Problem - Ultimate Solution Wireless Mouse"
   Why bad: Prohibited marketing phrases, no product information
   
✅ GOOD TITLE: "Wireless Bluetooth Mouse - Ergonomic Silent Click Design - 2400 DPI Adjustable Sensor - Rechargeable Battery - Office Home"
   Why good: Specific technology, real features, actual specifications

❌ BAD BULLET: "HIGH QUALITY - Made with premium materials for the best experience"
   Why bad: All generic words, no specific information
   
✅ GOOD BULLET: "ERGONOMIC COMFORT - Contoured shape with soft-touch coating reduces wrist strain during 8+ hour workdays; ideal for office professionals and gamers"
   Why good: Specific design feature, measurable benefit, target audience

❌ BAD KEYWORD: "productdescription"
   Why bad: Meta word, not a search term
   
✅ GOOD KEYWORD: "wireless bluetooth mouse"
   Why good: Actual buyer search term

═══════════════════════════════════════════════════════════════════

📚 PLATFORM-SPECIFIC TRAINING EXAMPLES:

AMAZON EXAMPLE (200 char title):
Product: Stainless Steel Water Bottle
✓ Title: "Stainless Steel Water Bottle - 32oz Double Wall Vacuum Insulated - Keeps Drinks Cold 24hrs Hot 12hrs - Leak-Proof Lid - BPA-Free - Wide Mouth for Ice - Gym Travel Office"
✓ Why: Uses 198/200 chars (99%), includes capacity, technology, benefits, use cases

ETSY EXAMPLE (140 char title):
Product: Wedding Invitation Template
✓ Title: "Wedding Invitation Template | Instant Download | Printable PDF | Editable | Rustic Floral | DIY Wedding Invite"
✓ Why: Uses 139/140 chars (99%), pipe separators, emphasizes digital/instant, includes style

SHOPIFY EXAMPLE (70 char title):
Product: Yoga Mat
✓ Title: "Non-Slip Yoga Mat - 6mm Thick TPE - Eco-Friendly Exercise Mat"
✓ Why: Uses 68/70 chars (97%), Google-friendly, includes material and thickness

WALMART EXAMPLE (75 char title):
Product: Paper Towels
✓ Title: "Paper Towels 12-Pack - 2-Ply Strong Absorbent - Family Size Value Pack"
✓ Why: Uses 74/75 chars (99%), emphasizes quantity and value, family-friendly

EBAY EXAMPLE (80 char title):
Product: iPhone Case
✓ Title: "iPhone 14 Pro Case Clear Shockproof Slim Protective Cover - New in Box"
✓ Why: Uses 79/80 chars (99%), includes model, condition, key features

WOOCOMMERCE EXAMPLE (70 char title):
Product: Coffee Beans
✓ Title: "Organic Fair Trade Coffee Beans - Medium Roast - Whole Bean 1lb"
✓ Why: Uses 69/70 chars (99%), SEO-friendly, includes certifications and specs

═══════════════════════════════════════════════════════════════════


1. NEVER INVENT SPECIFICATIONS
   - If size/weight/dimensions are NOT in the product data → DO NOT add them
   - If quantity/volume is NOT provided → DO NOT add "1.7oz", "12oz", "50ml", etc.
   - If technical specs are NOT given → DO NOT make up numbers
   - ONLY use information explicitly provided in the input data

2. NEVER USE GENERIC FILLER WORDS
   - BANNED FOREVER: Premium, Professional, Grade, Quality, High-Quality, Superior, Advanced, Enhanced, Improved, Elite, Pro, Plus, Max, Ultra, Super, Deluxe, Best, Ultimate, Perfect, Amazing, Incredible
   - These words are MEANINGLESS and add ZERO value
   - Instead, use SPECIFIC features: "Collagen Niacinamide", "Bluetooth 5.0", "Stainless Steel 304", "2400 DPI"
   
3. NEVER USE PROHIBITED MARKETING PHRASES
   - ABSOLUTELY FORBIDDEN: "Solve Your Problem", "Best Value", "Best For", "Best Choice", "Game Changer", "Must Have", "Life Changing", "Transform Your", "Ultimate Solution"
   - These trigger rejection and hurt SEO
   - Instead, state ACTUAL benefits: "Reduces Fine Lines", "Silent Operation", "Leak-Proof Design"

4. ALWAYS FOLLOW THE 4-STEP PROCESS
   - STEP 1: Analyze the product deeply (what, features, why, how)
   - STEP 2: Research keywords buyers actually use
   - STEP 3: Match features to specific benefits
   - STEP 4: Generate output using Steps 1-3
   - DO NOT skip any step

5. ALWAYS USE 90-100% OF CHARACTER LIMITS
   - Amazon: 180-200 chars (target 195)
   - Etsy: 126-140 chars (target 138)
   - Shopify/WooCommerce: 60-70 chars (target 68)
   - eBay: 72-80 chars (target 78)
   - Walmart: 68-75 chars (target 73)
   - Under-utilizing is wasting SEO opportunity

═══════════════════════════════════════════════════════════════════

📖 COMPREHENSIVE PRODUCT TYPE TRAINING:

┌─────────────────────────────────────────────────────────────────┐
│ BEAUTY/SKINCARE PRODUCTS                                        │
└─────────────────────────────────────────────────────────────────┘

ANALYSIS CHECKLIST:
✓ Identify ALL active ingredients (Collagen, Niacinamide, Hyaluronic Acid, Retinol, Vitamin C, Peptides, etc.)
✓ Determine texture (cream, serum, gel, jelly, lotion, oil, balm)
✓ Identify skin concerns addressed (dryness, aging, acne, dullness, sensitivity)
✓ Determine suitable skin types (dry, oily, combination, sensitive, all types)
✓ Note application method (morning, night, both)

INGREDIENT BENEFIT DATABASE:
• Collagen → Improves elasticity, reduces fine lines, firms skin
• Niacinamide → Brightens tone, minimizes pores, reduces redness
• Hyaluronic Acid → Deep hydration, plumps skin, retains moisture
• Retinol → Reduces wrinkles, improves texture, increases cell turnover
• Vitamin C → Brightens, evens tone, antioxidant protection
• Peptides → Stimulates collagen, anti-aging, firms skin
• Salicylic Acid → Unclogs pores, treats acne, exfoliates
• Glycolic Acid → Exfoliates, brightens, smooths texture
• Ceramides → Strengthens barrier, locks moisture, protects
• Alpha Arbutin → Fades dark spots, brightens, evens tone

TITLE FORMULA FOR BEAUTY:
[Ingredient Names] + [Product Type] + [Primary Benefit] + [Skin Type/Concern] + [Size if provided]

EXAMPLE:
Input: "Collagen Niacinamide Jelly Cream, 50ml"
Output: "Collagen Niacinamide Jelly Cream - Hydrating Face Moisturizer for Dry Skin - Anti-Aging Formula Reduces Fine Lines & Brightens Complexion - Lightweight Fast-Absorbing 50ml"

✗ NEVER: "Premium Quality Collagen Cream - Best Anti-Aging Solution"
✗ NEVER: "Solve Your Skin Problems - Ultimate Moisturizer"

┌─────────────────────────────────────────────────────────────────┐
│ ELECTRONICS PRODUCTS                                            │
└─────────────────────────────────────────────────────────────────┘

ANALYSIS CHECKLIST:
✓ Identify connectivity (Bluetooth, WiFi, Wired, Wireless, USB-C, etc.)
✓ Note technical specs (DPI, battery life, resolution, power, capacity)
✓ Determine compatibility (Windows, Mac, iPhone, Android, etc.)
✓ Identify key technology (noise cancelling, fast charging, etc.)
✓ Note physical specs (size, weight, color, material)

TECHNOLOGY BENEFIT DATABASE:
• Bluetooth 5.0 → Stable connection, 33ft range, low power consumption
• 2400 DPI Sensor → Precise control, adjustable sensitivity
• Silent Click → 90% noise reduction, quiet operation
• Rechargeable Battery → Long-lasting, eco-friendly, cost-effective
• Noise Cancelling → Blocks ambient sound, immersive audio
• Fast Charging → Quick power-up, less downtime
• USB-C → Universal compatibility, fast data transfer
• Wireless → No cable clutter, freedom of movement

TITLE FORMULA FOR ELECTRONICS:
[Product Type] + [Key Technology] + [Main Specs] + [Compatibility] + [Use Case]

EXAMPLE:
Input: "Wireless Mouse, Bluetooth 5.0, 2400 DPI, Rechargeable"
Output: "Wireless Bluetooth Mouse - Ergonomic Silent Click Design - 2400 DPI Adjustable Sensor - Rechargeable Battery 60-Day Life - Compatible Windows Mac iPad - Office Home Gaming"

✗ NEVER: "Premium Professional Grade Wireless Mouse - Ultimate Solution"
✗ NEVER: "Best Quality Mouse for All Your Computing Needs"

┌─────────────────────────────────────────────────────────────────┐
│ DIGITAL PRODUCTS (Etsy Focus)                                   │
└─────────────────────────────────────────────────────────────────┘

ANALYSIS CHECKLIST:
✓ Identify file formats (PDF, PNG, JPG, SVG, PSD, etc.)
✓ Determine if editable (Yes/No, what software needed)
✓ Note if printable (home printer, professional print shop)
✓ Identify usage rights (personal use, commercial use)
✓ Determine occasion/theme (wedding, birthday, business, etc.)

DIGITAL PRODUCT KEYWORDS:
• Instant Download → Immediate access, no shipping
• Printable → Can print at home or print shop
• Editable → Customizable with your information
• PDF Template → Easy to use, no special software
• High Resolution → Professional print quality (300 DPI)
• DIY → Do-it-yourself, budget-friendly
• Digital File → No physical item shipped

TITLE FORMULA FOR DIGITAL (Etsy 140 chars):
[Product Type] | Instant Download | [Format] | Editable | [Style/Theme] | [Occasion]

EXAMPLE:
Input: "Wedding Invitation Template, PDF, Printable"
Output: "Wedding Invitation Template | Instant Download | Printable PDF | Editable | Rustic Floral Design | DIY Wedding Invite"

✗ NEVER: "Best Wedding Invitation - Premium Quality Template"
✗ NEVER: "Professional Grade Invitation - Ultimate Solution"

│ PHYSICAL PRODUCTS (General)                                     │
└─────────────────────────────────────────────────────────────────┘

ANALYSIS CHECKLIST:
✓ Identify material (stainless steel, cotton, leather, plastic, wood, etc.)
✓ Note dimensions/size (if provided - never invent)
✓ Identify key features (waterproof, foldable, adjustable, portable, etc.)
✓ Determine use case (gym, travel, office, home, outdoor, etc.)
✓ Note certifications (BPA-free, FDA approved, CE certified, etc.)

MATERIAL BENEFIT DATABASE:
• Stainless Steel → Durable, rust-resistant, easy to clean
• Silicone → Flexible, heat-resistant, non-stick, BPA-free
• Leather (Genuine) → Durable, ages well, premium feel
• Cotton (Organic) → Soft, breathable, hypoallergenic
• Aluminum → Lightweight, strong, corrosion-resistant
• Tempered Glass → Scratch-resistant, shatter-proof, clear
• Bamboo → Eco-friendly, sustainable, naturally antibacterial

TITLE FORMULA FOR PHYSICAL:
[Material] + [Product Type] + [Key Features] + [Size/Capacity if provided] + [Use Case]

EXAMPLE:
Input: "Stainless Steel Water Bottle, 32oz, Double Wall Insulated"
Output: "Stainless Steel Water Bottle - 32oz Double Wall Vacuum Insulated - Keeps Drinks Cold 24hrs Hot 12hrs - Leak-Proof Lid - BPA-Free - Gym Travel Office"

✗ NEVER: "Premium Quality Water Bottle - Best for All Your Needs"
✗ NEVER: "Professional Grade Bottle - Ultimate Hydration Solution"

═══════════════════════════════════════════════════════════════════

🎓 FINAL TRAINING REINFORCEMENT:

BEFORE YOU WRITE, ASK YOURSELF:

1. Did I complete STEP 1 (Analyze)?
   ✓ What is it? ✓ Real features? ✓ Why used? ✓ How it works?

2. Did I complete STEP 2 (Research)?
   ✓ Primary keyword? ✓ Secondary keywords? ✓ Long-tail? ✓ Technical terms?

3. Did I complete STEP 3 (Match)?
   ✓ Feature → Benefit mapping for each feature?

4. Am I about to use ANY of these BANNED words?
   ✗ Premium, Professional, Grade, Quality, Best, Ultimate, Perfect, Amazing
   ✗ Solve Your Problem, Best Value, Best For, Game Changer, Must Have
   
5. Am I inventing ANY specifications not in the input?
   ✗ Adding "1.7oz" when size not provided?
   ✗ Making up dimensions?
   ✗ Fabricating technical specs?

6. Is my title using 90-100% of character limit?
   ✓ Amazon: 180-200 chars
   ✓ Etsy: 126-140 chars
   ✓ Shopify/WooCommerce: 60-70 chars
   ✓ eBay: 72-80 chars
   ✓ Walmart: 68-75 chars

7. Does EVERY word provide SPECIFIC information?
   ✓ "Collagen Niacinamide" (specific ingredients)
   ✓ "2400 DPI Sensor" (specific technology)
   ✓ "Stainless Steel 304" (specific material)
   ✗ "High Quality" (meaningless generic)
   ✗ "Premium Grade" (meaningless generic)

IF YOU ANSWERED "NO" OR "✗" TO ANY QUESTION ABOVE:
→ STOP and revise your approach
→ Go back to the 4-step process
→ Remove all generic/prohibited words
→ Add more specific details from the input

═══════════════════════════════════════════════════════════════════

Now generate the PROFESSIONAL, TECHNICAL, SEO-OPTIMIZED listing for ${request.platform.toUpperCase()}.



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
  "keywords": [
    "primary-search-term",
    "secondary-feature-keyword",
    "technical-specification",
    "use-case-keyword",
    "material-or-compatibility"
  ],
  "platform_notes": "Brief summary of key optimization decisions made for ${request.platform.toUpperCase()} algorithm"
}

KEYWORD EXAMPLES FOR DIFFERENT PRODUCTS:
- Headphones: ["wireless bluetooth headphones", "noise cancelling", "40-hour battery", "over-ear design", "foldable portable"]
- Leather Jacket: ["genuine leather jacket", "motorcycle style", "cafe racer", "sheep skin leather", "black brown jacket"]
- Rice Cooker: ["6-cup rice cooker", "induction heating", "twin pressure system", "stainless steel pot", "voice navigation"]
- NOT: ["productdescription", "sizes", "features", "quality", "premium", "description"]`;

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
