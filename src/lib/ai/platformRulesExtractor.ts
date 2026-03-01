/**
 * Platform Rules Extractor
 * Extracts platform-specific rules for AI prompt injection
 */

import { PlatformEngineFactory } from '@/lib/engines/PlatformEngineFactory';
import { Platform } from '@/types';

export interface PlatformRulesForAI {
  platform: string;
  titleLength: { min: number; max: number };
  descriptionMinLength: number;
  maxTags: number;
  tone: string;
  keyGuidelines: string[];
  prohibitedWords: string[];
  requiredElements: string[];
  formattingStyle: string;
}

export class PlatformRulesExtractor {
  /**
   * Extract rules for AI prompt
   */
  static extractRules(platform: Platform): PlatformRulesForAI {
    const engine = PlatformEngineFactory.getEngine(platform);
    const rules = engine.getPlatformRules();
    const algorithmFactors = engine.getAlgorithmFactors();

    return {
      platform: rules.name,
      titleLength: rules.titleRange,
      descriptionMinLength: rules.minDescription,
      maxTags: rules.maxTags,
      tone: this.determineTone(platform),
      keyGuidelines: rules.guidelines,
      prohibitedWords: rules.prohibitedWords,
      requiredElements: rules.requiredFields,
      formattingStyle: this.getFormattingStyle(platform, rules)
    };
  }

  /**
   * Determine tone based on platform
   */
  private static determineTone(platform: Platform): string {
    const toneMap: Record<Platform, string> = {
      amazon: 'Professional, feature-focused, benefit-driven',
      ebay: 'Conversational, detailed, trust-building',
      etsy: 'Creative, artisanal, story-driven',
      shopify: 'Brand-aligned, engaging, conversion-focused',
      walmart: 'Value-focused, family-friendly, practical',
      woocommerce: 'Brand-aligned, engaging, conversion-focused, SEO-optimized'
    };

    return toneMap[platform] || 'Professional and clear';
  }

  /**
   * Get formatting style
   */
  private static getFormattingStyle(platform: Platform, rules: any): string {
    if (rules.formatting?.titleFormat) {
      return rules.formatting.titleFormat;
    }

    const styleMap: Record<Platform, string> = {
      amazon: 'Title Case, keyword-rich, front-loaded',
      ebay: 'Descriptive, includes condition and specifics',
      etsy: 'Creative, includes materials and style',
      shopify: 'Brand-focused, benefit-oriented',
      walmart: 'Clear, value-focused, family-friendly',
      woocommerce: 'SEO-optimized, brand-focused, Google-friendly'
    };

    return styleMap[platform] || 'Clear and descriptive';
  }

  /**
   * Format rules as text for prompt
   */
  static formatRulesForPrompt(rules: PlatformRulesForAI): string {
    return `
PLATFORM: ${rules.platform}

TITLE REQUIREMENTS:
- Length: ${rules.titleLength.min}-${rules.titleLength.max} characters
- Style: ${rules.formattingStyle}
- Tone: ${rules.tone}

DESCRIPTION REQUIREMENTS:
- Minimum length: ${rules.descriptionMinLength} characters
- Must be detailed, informative, and engaging

KEY GUIDELINES:
${rules.keyGuidelines.map(g => `- ${g}`).join('\n')}

PROHIBITED WORDS (DO NOT USE):
${rules.prohibitedWords.join(', ')}

REQUIRED ELEMENTS:
${rules.requiredElements.join(', ')}

TAGS/KEYWORDS:
- Maximum: ${rules.maxTags} tags
- Must be relevant and specific
`.trim();
  }
}
