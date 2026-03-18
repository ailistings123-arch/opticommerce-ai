/**
 * Prompt Builder — 2026 Operational Protocol
 * Builds platform-specific AI prompts enforcing the Platform Logic Gate for each marketplace.
 * Phase A: URL Analysis (audit mode) | Phase B: New Listing Creation
 */

import { AIGenerationRequest } from './types';
import { PLATFORM_RULES } from '@/lib/utils/platform-rules';

export class PromptBuilder {
  /**
   * Alias used by AI providers — returns { systemInstruction, userPrompt }
   */
  static buildPrompt(request: AIGenerationRequest): { systemInstruction: string; userPrompt: string } {
    const { system, user } = PromptBuilder.build(request);
    return { systemInstruction: system, userPrompt: user };
  }

  /**
   * Build the full system + user prompt for a given request.
   */
  static build(request: AIGenerationRequest): { system: string; user: string } {
    const platform = request.platform.toLowerCase();
    const rules = PLATFORM_RULES[platform as keyof typeof PLATFORM_RULES];
    if (!rules) throw new Error(`Unknown platform: ${platform}`);

    const system = this.buildSystemPrompt(platform, rules);
    const user = this.buildUserPrompt(request, platform, rules);
    return { system, user };
  }

  // ─── SYSTEM PROMPT ────────────────────────────────────────────────────────

  private static buildSystemPrompt(platform: string, rules: any): string {
    const gate = this.getPlatformGate(platform, rules);
    return `You are an expert e-commerce SEO copywriter operating under the 2026 Platform Logic Gate protocol.
You MUST strictly follow the rules for ${rules.name} only. Do NOT mix rules from other platforms.

${gate}

OUTPUT FORMAT — respond with valid JSON only, no markdown fences:
{
  "title": "string",
  "bullets": ["string", "string", "string", "string", "string"],
  "description": "string (HTML with <h2>/<h3>/<ul>/<p> tags)",
  "keywords": ["string"],
  "platform_notes": "string",
  "analysisReport": "string (2-3 sentences on SEO improvements made)",
  "backendKeywordBank": ["string"] 
}`;
  }

  // ─── PLATFORM LOGIC GATES ─────────────────────────────────────────────────

  private static getPlatformGate(platform: string, rules: any): string {
    switch (platform) {
      case 'amazon':   return this.amazonGate(rules);
      case 'ebay':     return this.ebayGate(rules);
      case 'walmart':  return this.walmartGate(rules);
      case 'etsy':     return this.etsyGate(rules);
      case 'shopify':  return this.shopifyGate(rules);
      case 'woocommerce': return this.woocommerceGate(rules);
      default: return '';
    }
  }

  private static amazonGate(rules: any): string {
    return `=== AMAZON PLATFORM LOGIC GATE (A10 & RUFUS AI) ===
FOCUS: "Why buy this?" — benefit-driven, keyword-rich

TITLE RULES:
- Max 200 characters. Target 80-120 characters.
- Title Case: Capitalize The First Letter Of Every Word
- PROHIBITED symbols: ™ ! * © ® — remove all of them
- PROHIBITED phrases: "Best Seller", "Free Shipping", "#1", "Top Rated", "Award Winning"
- NO all-caps words (e.g., "BEST" is banned; "Best" is allowed)
- Front-load primary keyword in first 80 characters
- Include: Brand + Product Type + Key Specs + Size/Color

BULLET POINTS:
- Exactly 5 bullets. No more, no less.
- Max 250 characters per bullet
- Format: BOLD SUMMARY – Benefit-driven explanation with specifics
- No ending punctuation on any bullet
- Each bullet must answer a different customer question

DESCRIPTION:
- Minimum 1000 characters
- Use HTML: <h2>, <ul>, <li>, <p>
- Focus on benefits, use cases, compatibility

BACKEND KEYWORDS (keywords array):
- Max 249 bytes total
- NEVER repeat any word already used in the title
- Use long-tail variations, synonyms, misspellings`;
  }

  private static ebayGate(rules: any): string {
    return `=== EBAY PLATFORM LOGIC GATE (CASSINI ALGORITHM) ===
FOCUS: "What exactly is this?" — specs, brand, model, condition

TITLE RULES:
- STRICTLY 80 characters — maximize every single character
- Priority order: Brand + Model/MPN + Product + Key Spec (Size/Color) + Condition
- PROHIBITED fluff: "L@@K", "Wow", "Fast Shipping", "Must See", "Great Deal"
- No promotional language of any kind
- Be factual and keyword-dense

DESCRIPTION:
- Clean, mobile-optimized HTML only
- NO active content (no scripts, no iframes)
- Minimum 400 characters

ITEM SPECIFICS (keywords array):
- Prioritize: Brand, MPN, GTIN, Material
- These outrank narrative description for Cassini ranking
- Include condition: New / Used / Refurbished`;
  }

  private static walmartGate(rules: any): string {
    return `=== WALMART MARKETPLACE PLATFORM LOGIC GATE ===
FOCUS: Value, quantity, family-friendly — maximize Listing Quality Score

TITLE RULES:
- STRICTLY 50-75 characters (outside this range = Search Suppressed)
- Brand name MUST be the first word
- Title Case only
- PROHIBITED: retailer-specific info ("sold on Shopify", "Amazon exclusive")

KEY FEATURES (bullets):
- 3 to 10 bullets (generate 5)
- Maximum 80 characters per bullet
- Focus on value, quantity, family use

DESCRIPTION:
- MANDATORY 150-word minimum in paragraph format
- Walmart rewards detailed, helpful long-form content for Listing Quality Scores
- Write naturally — no bullet lists in description, use paragraphs
- Minimum 500 characters`;
  }

  private static etsyGate(rules: any): string {
    return `=== ETSY PLATFORM LOGIC GATE (GIFT & INTENT AI) ===
FOCUS: "Who is this for?" — gifting intent, occasion, recipient

TITLE RULES:
- Max 140 characters (STRICT — never exceed)
- Lead with primary keyword in the FIRST 40 characters
- Use natural gifting language: "Personalized Anniversary Gift for Him"
- PROHIBITED: repeating the same keyword multiple times in the title
- Use pipe (|) separators between keyword phrases

TAGS:
- Exactly 13 tags — no more, no less
- Every tag MUST be a multi-word long-tail phrase (e.g., "personalized gift for mom")
- NO single-word tags
- Max 20 characters per tag

ATTRIBUTES (include in platform_notes):
- Suggest: Occasion, Recipient, and Style attributes

DESCRIPTION:
- Minimum 500 characters
- Conversational, warm tone
- Mention gifting occasions and who it's perfect for`;
  }

  private static shopifyGate(rules: any): string {
    return `=== SHOPIFY PLATFORM LOGIC GATE (GENERAL SEO) ===
FOCUS: Human-readable H1 + Google SEO

TITLE (H1):
- Clear and readable for humans
- Under 70 characters for H1
- SEO Meta Title: under 60 characters (put in platform_notes)
- Slug suggestion: short, keyword-only (e.g., /blue-denim-jacket/) — put in platform_notes

DESCRIPTION:
- Use H2/H3 subheadings for structure
- First 160 characters = Meta Description — make them compelling
- Minimum 300 characters
- Focus on benefits and long-tail keywords

ALT TEXT:
- Generate descriptive alt text for main product image in platform_notes`;
  }

  private static woocommerceGate(rules: any): string {
    return `=== WOOCOMMERCE PLATFORM LOGIC GATE (GENERAL SEO) ===
FOCUS: Google SEO — schema-friendly structured data

TITLE (H1):
- Clear and readable for humans
- Under 70 characters for H1
- SEO Meta Title: under 60 characters (put in platform_notes)
- Slug suggestion: short, keyword-only — put in platform_notes

DESCRIPTION:
- Use H2/H3 subheadings for structure
- First 160 characters = Meta Description
- Minimum 300 characters
- Use schema-friendly language

ALT TEXT:
- Generate descriptive alt text for main product image in platform_notes`;
  }

  // ─── USER PROMPT ──────────────────────────────────────────────────────────

  private static buildUserPrompt(request: AIGenerationRequest, platform: string, rules: any): string {
    const { productData, imageAnalysis, gapAnalysis, mode } = request;

    const phase = mode === 'analyze' ? 'Phase A: URL Analysis & Audit'
      : mode === 'optimize' ? 'Phase A+B: Optimize Existing Listing'
      : 'Phase B: New Listing Creation';

    let prompt = `${phase} for ${rules.name}\n\n`;

    // Product data
    prompt += `PRODUCT DATA:\n`;
    if (productData.brand) prompt += `Brand: ${productData.brand}\n`;
    if (productData.title) prompt += `Current Title: ${productData.title}\n`;
    if (productData.category) prompt += `Category: ${productData.category}\n`;
    if (productData.price) prompt += `Price: $${productData.price}\n`;
    if (productData.productType) prompt += `Product Type: ${productData.productType}\n`;
    if (productData.description) prompt += `Current Description: ${productData.description.substring(0, 500)}...\n`;

    // Specifications
    if (productData.specifications?.length) {
      prompt += `\nSPECIFICATIONS:\n`;
      productData.specifications.slice(0, 15).forEach(s => {
        prompt += `- ${s.name}: ${s.value}${s.unit ? ' ' + s.unit : ''}\n`;
      });
    }

    // Keywords
    if (productData.keywords?.length) {
      prompt += `\nEXTRACTED KEYWORDS: ${productData.keywords.join(', ')}\n`;
    }

    // Image analysis
    if (imageAnalysis) {
      prompt += `\nIMAGE ANALYSIS:\n`;
      prompt += `- Main features: ${imageAnalysis.mainFeatures.join(', ')}\n`;
      prompt += `- Colors: ${imageAnalysis.colors.join(', ')}\n`;
      prompt += `- Style: ${imageAnalysis.style}\n`;
      prompt += `- Quality: ${imageAnalysis.quality}\n`;
    }

    // Gap analysis
    if (gapAnalysis) {
      prompt += `\nGAP ANALYSIS (Stage 1 findings):\n`;
      prompt += `- Title utilization: ${gapAnalysis.titleUtilization}% (${gapAnalysis.currentTitleLength}/${gapAnalysis.titleLimit} chars)\n`;
      if (gapAnalysis.missingElements.length) {
        prompt += `- Missing: ${gapAnalysis.missingElements.join(', ')}\n`;
      }
      if (gapAnalysis.seoIssues.length) {
        prompt += `- SEO Issues:\n`;
        gapAnalysis.seoIssues.forEach(i => prompt += `  • ${i}\n`);
      }
      prompt += `- Summary: ${gapAnalysis.summary}\n`;
    }

    // Platform-specific instructions
    prompt += `\nINSTRUCTIONS:\n`;
    prompt += this.getPlatformInstructions(platform, rules, productData);

    return prompt;
  }

  private static getPlatformInstructions(platform: string, rules: any, productData: any): string {
    const brand = productData.brand || '[Brand]';

    switch (platform) {
      case 'amazon':
        return `Generate an Amazon A10-optimized listing:
1. Title: Title Case, 80-200 chars, no symbols (™!*©®), no ALL-CAPS words, no promotional phrases
2. Exactly 5 bullets: "BOLD SUMMARY – benefit explanation" format, max 250 chars each, no ending punctuation
3. Description: HTML with <h2>/<ul>/<p>, min 1000 chars, benefit-focused
4. Keywords: backend search terms, 249 bytes max, ZERO words repeated from title
5. Focus: Why should a customer buy this? Answer with specs, benefits, use cases.`;

      case 'ebay':
        return `Generate an eBay Cassini-optimized listing:
1. Title: EXACTLY 80 characters — count carefully and maximize every character
   Format: ${brand} [Model/MPN] [Product] [Key Spec] [Condition]
   No fluff words (L@@K, Wow, Fast Shipping, Must See)
2. Bullets: 3-5 spec-focused points
3. Description: clean mobile HTML, no scripts, min 400 chars
4. Keywords (item specifics): Brand, MPN, GTIN, Material — these rank above description
5. Focus: What exactly is this product? Be factual and spec-driven.`;

      case 'walmart':
        return `Generate a Walmart Marketplace listing optimized for Listing Quality Score:
1. Title: STRICTLY 50-75 characters, "${brand}" must be first word, Title Case
2. Key Features: exactly 5 bullets, max 80 chars each, value/quantity focused
3. Description: paragraph format, MINIMUM 150 words, detailed and helpful
4. No retailer-specific language
5. Focus: Value, quantity, family-friendly appeal.`;

      case 'etsy':
        return `Generate an Etsy Gift & Intent AI-optimized listing:
1. Title: max 140 chars, primary keyword in FIRST 40 chars, natural gifting language
   Example: "Personalized [Product] | [Occasion] Gift for [Recipient] | [Material/Style]"
   Never repeat the same keyword twice
2. Exactly 13 tags — all multi-word long-tail phrases, no single words
3. Description: warm, conversational, min 500 chars, mention gifting occasions
4. In platform_notes: suggest Occasion, Recipient, and Style attributes
5. Focus: Who is this for? What occasion? What makes it a perfect gift?`;

      case 'shopify':
        return `Generate a Shopify SEO-optimized listing:
1. Title (H1): human-readable, under 70 chars
2. In platform_notes: provide SEO Meta Title (under 60 chars), URL slug, and image alt text
3. Description: H2/H3 subheadings, first 160 chars = meta description, min 300 chars
4. Keywords: long-tail Google search phrases
5. Focus: Natural language for humans, optimized for Google.`;

      case 'woocommerce':
        return `Generate a WooCommerce SEO-optimized listing:
1. Title (H1): human-readable, under 70 chars
2. In platform_notes: provide SEO Meta Title (under 60 chars), URL slug, and image alt text
3. Description: H2/H3 subheadings, first 160 chars = meta description, min 300 chars, schema-friendly
4. Keywords: long-tail Google search phrases
5. Focus: Google SEO with schema-friendly structured content.`;

      default:
        return rules.guidelines.join('\n');
    }
  }
}
