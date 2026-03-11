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
  
  // Generic filler words - add NO value
  'PREMIUM QUALITY', 'HIGH QUALITY', 'TOP QUALITY', 'SUPERIOR QUALITY',
  'PROFESSIONAL', 'PRO', 'ELITE', 'DELUXE', 'PLUS', 'MAX', 'ULTRA',
  'SUPER', 'EXTRA', 'SPECIAL', 'UNIQUE', 'EXCEPTIONAL', 'OUTSTANDING',
  'REMARKABLE', 'IMPRESSIVE', 'STUNNING', 'BEAUTIFUL', 'ELEGANT',
  'STYLISH', 'MODERN', 'CONTEMPORARY', 'CLASSIC', 'TRADITIONAL',
  'INNOVATIVE', 'ADVANCED', 'ENHANCED', 'IMPROVED', 'UPGRADED',
  'NEXT GENERATION', 'LATEST', 'NEWEST', 'BRAND NEW', 'ALL NEW',
  'GRADE A', 'GRADE B', 'FIRST CLASS', 'WORLD CLASS', 'TOP TIER',
  'HIGH END', 'UPSCALE', 'REFINED', 'SOPHISTICATED', 'EXQUISITE'
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
    const productType = (productData as any).productType || this.detectProductType(productData, request.platform);
    const typeGuidance = PRODUCT_TYPE_GUIDANCE[productType] || PRODUCT_TYPE_GUIDANCE['physical'];
    
    prompt += `=== PRODUCT TYPE: ${productType.toUpperCase()} ===\n`;
    
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

    // Enhanced chain-of-thought
    prompt += `
=== PROFESSIONAL SEO ANALYSIS (Think deeply before writing) ===

CRITICAL INSTRUCTION: You are writing for AMAZON/E-COMMERCE, not for marketing brochures.
- Write like a TECHNICAL SPECIFICATION SHEET, not an advertisement
- Use FACTUAL LANGUAGE only - no hype, no exaggeration, no marketing fluff
- Every word must provide SPECIFIC INFORMATION about the product
- If you cannot state a SPECIFIC FACT, do not write that sentence

⚠️ ABSOLUTE RULES: 
1. DO NOT INVENT SPECIFICATIONS
   - If size/weight/dimensions are NOT in the product data → DO NOT add them
   - If quantity/volume is NOT provided → DO NOT add "1.7oz", "12oz", "50ml", etc.
   - If technical specs are NOT given → DO NOT make up numbers
   - ONLY use information explicitly provided in the input data below

2. DO NOT USE GENERIC FILLER WORDS
   - BANNED: Premium, Professional, Grade, Quality, High-Quality, Superior, Advanced, Enhanced, Improved, Elite, Pro, Plus, Max, Ultra, Super, Deluxe
   - These words are MEANINGLESS and add NO value
   - Instead, describe ACTUAL product features and benefits
   - Example: Instead of "Premium Moisturizer" → "Collagen Niacinamide Moisturizer with Hyaluronic Acid"

3. DEEPLY ANALYZE THE ACTUAL PRODUCT
   - Read the product title carefully - what is it REALLY?
   - Read the description - what are the ACTUAL ingredients/features/materials?
   - Extract REAL, SPECIFIC information, not generic adjectives
   - If it says "Collagen Niacinamide Jelly Cream" → use those EXACT ingredients
   - If it says "Wireless Mouse" → describe the ACTUAL features (wireless, bluetooth, ergonomic, etc.)

STEP 1 - DEEP PRODUCT ANALYSIS (MOST IMPORTANT):
- What is this product ACTUALLY called? (use the exact name from input)
- What are the REAL ingredients/materials/components? (extract from title/description)
- What are the ACTUAL features mentioned? (not generic words, but real features)
- What is the SPECIFIC use case? (face moisturizer, computer mouse, water bottle, etc.)
- What makes THIS product different from others? (specific ingredients, technology, design)

STEP 2 - KEYWORD RESEARCH (BASED ON ACTUAL PRODUCT):
- What is the PRIMARY keyword buyers use to find this product? (high-volume, exact match)
- What are 3-5 SECONDARY keywords? (related searches, variations)
- What are 2-3 LONG-TAIL keywords? (specific phrases, lower competition)
- What LSI keywords should be included? (semantically related terms)

STEP 3 - EXTRACT REAL FEATURES (FROM PROVIDED DATA ONLY):
- What INGREDIENTS are mentioned? (collagen, niacinamide, hyaluronic acid, etc.)
- What MATERIALS are stated? (stainless steel, silicone, leather, cotton, etc.)
- What TECHNOLOGY is described? (bluetooth, wireless, induction, pressure, etc.)
- What DESIGN features exist? (ergonomic, foldable, adjustable, portable, etc.)
- What FUNCTIONS are listed? (hydrating, moisturizing, anti-aging, silent click, etc.)
- What CERTIFICATIONS are mentioned? (FDA, CE, UL, organic, cruelty-free, etc.)

STEP 4 - IDENTIFY SPECIFIC BENEFITS (NOT GENERIC WORDS):
- What SPECIFIC problem does it solve? (dry skin → hydrating; wrist pain → ergonomic)
- What ACTUAL results does it provide? (anti-aging, silent operation, leak-proof, etc.)
- What REAL advantages does it have? (double-wall insulation, 2400 DPI sensor, etc.)
- DO NOT use generic words like "premium quality" or "professional grade"
- USE specific benefits like "reduces fine lines" or "silent click technology"

STEP 5 - BUILD TITLE STRATEGY (NO FILLER WORDS):
- Start with EXACT product name from input (e.g., "Collagen Niacinamide Jelly Cream")
- Add SPECIFIC features/ingredients (e.g., "with Hyaluronic Acid")
- Include ACTUAL use case (e.g., "for Dry Skin", "for Gaming", "for Travel")
- Add REAL benefits (e.g., "Anti-Aging", "Ergonomic Design", "Leak-Proof")
- DO NOT add generic words like "Premium", "Professional", "Quality", "Grade"

STEP 6 - OPTIMIZATION STRATEGY:
- How can we maximize character usage (90-100%) with FACTUAL information FROM THE INPUT?
- Where should technical keywords be placed for maximum impact?
- What specific numbers and measurements FROM THE PROVIDED DATA will drive conversions?
- How can we stand out with TECHNICAL SUPERIORITY using ONLY PROVIDED INFORMATION?

Now generate the PROFESSIONAL, TECHNICAL, SEO-OPTIMIZED listing for ${request.platform.toUpperCase()}.

REMEMBER: 
- NO generic filler words (Premium, Professional, Grade, Quality, etc.)
- NO marketing fluff or meaningless adjectives
- ONLY use REAL, SPECIFIC features from the product data
- DEEPLY ANALYZE what the product actually is
- Extract ACTUAL ingredients, materials, features, and benefits
- DO NOT add measurements like "1.7oz" unless explicitly provided
- When in doubt, leave it out
- EVERY word must add SPECIFIC value and information

FINAL CHECK BEFORE WRITING:
✓ Did I analyze what this product REALLY is?
✓ Did I extract ACTUAL features from the input?
✓ Did I avoid generic words like "Premium", "Professional", "Quality"?
✓ Did I use SPECIFIC ingredients/materials/features?
✓ Does every word provide REAL information?
✓ Would this title help someone understand what this SPECIFIC product is?

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
    const combined = `${title} ${description}`;
    
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
