/**
 * AI Response Validator
 * Validates and sanitizes AI-generated responses
 */

import { AIGenerationResponse } from './types';
import { Platform } from '@/types';
import { PlatformEngineFactory } from '@/lib/engines/PlatformEngineFactory';
import { TrainingContext } from './trainingContext';
import { ScoringSystem, QualityScore } from './scoringSystem';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedResponse?: AIGenerationResponse;
  qualityScore?: QualityScore;
}

export class ResponseValidator {
  /**
   * Validate and sanitize response
   */
  static validate(
    response: AIGenerationResponse,
    platform: Platform
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitized = { ...response };

    // Get platform rules
    const engine = PlatformEngineFactory.getEngine(platform);
    const rules = engine.getPlatformRules();

    // Validate title
    const titleValidation = this.validateTitle(sanitized.title, rules);
    errors.push(...titleValidation.errors);
    warnings.push(...titleValidation.warnings);
    if (titleValidation.sanitized) {
      sanitized.title = titleValidation.sanitized;
    }

    // Validate bullets
    const bulletsValidation = this.validateBullets(sanitized.bullets);
    errors.push(...bulletsValidation.errors);
    warnings.push(...bulletsValidation.warnings);
    if (bulletsValidation.sanitized) {
      sanitized.bullets = bulletsValidation.sanitized;
    }

    // Validate description
    const descValidation = this.validateDescription(sanitized.description, rules);
    errors.push(...descValidation.errors);
    warnings.push(...descValidation.warnings);
    if (descValidation.sanitized) {
      sanitized.description = descValidation.sanitized;
    }

    // Validate keywords
    const keywordsValidation = this.validateKeywords(sanitized.keywords, rules);
    errors.push(...keywordsValidation.errors);
    warnings.push(...keywordsValidation.warnings);
    if (keywordsValidation.sanitized) {
      sanitized.keywords = keywordsValidation.sanitized;
    }

    // Check for prohibited words using training context
    const prohibitedCheck = this.checkProhibitedWords(sanitized);
    warnings.push(...prohibitedCheck);

    // Calculate quality score
    let qualityScore: QualityScore | undefined;
    if (errors.length === 0) {
      qualityScore = ScoringSystem.calculateScore(sanitized, platform, rules);
      
      // Add quality warnings if score is below excellent
      if (qualityScore.percentage < 90) {
        warnings.push(`Quality score: ${qualityScore.percentage}% (${qualityScore.grade})`);
        qualityScore.recommendations.slice(0, 3).forEach(rec => {
          warnings.push(`Recommendation: ${rec}`);
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedResponse: errors.length === 0 ? sanitized : undefined,
      qualityScore
    };
  }

  /**
   * Validate title
   */
  private static validateTitle(title: string, rules: any): {
    errors: string[];
    warnings: string[];
    sanitized?: string;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = title.trim();

    // Check if empty
    if (!sanitized) {
      errors.push('Title is empty');
      return { errors, warnings };
    }

    // Check length
    if (sanitized.length > rules.titleRange.max) {
      errors.push(`Title exceeds maximum length of ${rules.titleRange.max} characters (current: ${sanitized.length})`);
      // Auto-fix: truncate
      sanitized = sanitized.substring(0, rules.titleRange.max).trim();
      sanitized = sanitized.substring(0, sanitized.lastIndexOf(' ')); // Remove incomplete word
    }

    if (sanitized.length < rules.titleRange.min) {
      warnings.push(`Title is below recommended minimum of ${rules.titleRange.min} characters (current: ${sanitized.length})`);
    }

    // Check for HTML entities
    if (/&[a-z]+;/i.test(sanitized)) {
      warnings.push('Title contains HTML entities');
      sanitized = sanitized.replace(/&[a-z]+;/gi, '');
    }

    // Check for special characters
    if (/[<>{}[\]\\]/.test(sanitized)) {
      warnings.push('Title contains special characters');
      sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
    }

    return { errors, warnings, sanitized };
  }

  /**
   * Validate bullets
   */
  private static validateBullets(bullets: string[]): {
    errors: string[];
    warnings: string[];
    sanitized?: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitized: string[] = [];

    if (!Array.isArray(bullets)) {
      errors.push('Bullets must be an array');
      return { errors, warnings };
    }

    if (bullets.length === 0) {
      errors.push('At least one bullet point is required');
      return { errors, warnings };
    }

    bullets.forEach((bullet, index) => {
      if (typeof bullet !== 'string') {
        errors.push(`Bullet ${index + 1} is not a string`);
        return;
      }

      const trimmed = bullet.trim();
      
      if (!trimmed) {
        warnings.push(`Bullet ${index + 1} is empty`);
        return;
      }

      if (trimmed.length < 20) {
        warnings.push(`Bullet ${index + 1} is too short (${trimmed.length} chars)`);
      }

      if (trimmed.length > 500) {
        warnings.push(`Bullet ${index + 1} is too long (${trimmed.length} chars)`);
      }

      sanitized.push(trimmed);
    });

    return { errors, warnings, sanitized };
  }

  /**
   * Validate description
   */
  private static validateDescription(description: string, rules: any): {
    errors: string[];
    warnings: string[];
    sanitized?: string;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = description.trim();

    if (!sanitized) {
      errors.push('Description is empty');
      return { errors, warnings };
    }

    if (sanitized.length < rules.minDescription) {
      warnings.push(`Description is below recommended minimum of ${rules.minDescription} characters (current: ${sanitized.length})`);
    }

    // Check for URLs
    if (/https?:\/\/|www\./i.test(sanitized)) {
      warnings.push('Description contains URLs');
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '');
      sanitized = sanitized.replace(/www\.[^\s]+/gi, '');
    }

    // Check for email addresses
    if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(sanitized)) {
      warnings.push('Description contains email addresses');
      sanitized = sanitized.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '');
    }

    // Check for phone numbers
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(sanitized)) {
      warnings.push('Description contains phone numbers');
      sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '');
    }

    return { errors, warnings, sanitized };
  }

  /**
   * Validate keywords
   */
  private static validateKeywords(keywords: string[], rules: any): {
    errors: string[];
    warnings: string[];
    sanitized?: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitized: string[] = [];

    if (!Array.isArray(keywords)) {
      errors.push('Keywords must be an array');
      return { errors, warnings };
    }

    keywords.forEach((keyword, index) => {
      if (typeof keyword !== 'string') {
        warnings.push(`Keyword ${index + 1} is not a string`);
        return;
      }

      const trimmed = keyword.trim().toLowerCase();
      
      if (!trimmed) {
        return; // Skip empty keywords
      }

      if (trimmed.length < 2) {
        warnings.push(`Keyword "${trimmed}" is too short`);
        return;
      }

      sanitized.push(trimmed);
    });

    // Remove duplicates
    const unique = [...new Set(sanitized)];

    if (unique.length > rules.maxTags) {
      warnings.push(`Too many keywords: ${unique.length} (maximum: ${rules.maxTags})`);
      return { errors, warnings, sanitized: unique.slice(0, rules.maxTags) };
    }

    return { errors, warnings, sanitized: unique };
  }

  /**
   * Check for prohibited words using training context
   */
  private static checkProhibitedWords(response: AIGenerationResponse): string[] {
    const warnings: string[] = [];
    const allText = `${response.title} ${response.description} ${response.bullets.join(' ')}`.toLowerCase();
    const prohibitedWords = TrainingContext.PROHIBITED_WORDS;

    prohibitedWords.forEach(word => {
      const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
      if (regex.test(allText)) {
        warnings.push(`Contains prohibited word: "${word}"`);
      }
    });

    return warnings;
  }

  /**
   * Sanitize user input to prevent prompt injection
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';

    let sanitized = input.trim();

    // Remove potential prompt injection attempts
    sanitized = sanitized.replace(/ignore previous instructions/gi, '');
    sanitized = sanitized.replace(/disregard all/gi, '');
    sanitized = sanitized.replace(/forget everything/gi, '');
    sanitized = sanitized.replace(/new instructions:/gi, '');

    // Remove excessive newlines
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    // Limit length
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;
  }
}
