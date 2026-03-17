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
    let sanitized = { ...response }; // Changed from const to let for reassignment

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

    // Auto-extend title if utilization < 90% — append keywords until we hit 90%
    const titleUtil = (sanitized.title.length / rules.titleRange.max) * 100;
    if (titleUtil < 90 && sanitized.keywords && sanitized.keywords.length > 0) {
      sanitized.title = this.extendTitle(sanitized.title, sanitized.keywords, rules.titleRange.max);
      const newUtil = Math.round((sanitized.title.length / rules.titleRange.max) * 100);
      if (newUtil > Math.round(titleUtil)) {
        warnings.push(`Auto-extended title to ${newUtil}% utilization (${sanitized.title.length}/${rules.titleRange.max} chars)`);
      }
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

    // Check for prohibited words using training context - CRITICAL ENFORCEMENT
    const prohibitedCheck = this.checkProhibitedWords(sanitized);
    if (prohibitedCheck.length > 0) {
      // Try to auto-fix by removing prohibited words
      console.warn('[Validator] Attempting to auto-fix prohibited words...');
      sanitized = this.removeProhibitedWords(sanitized);
      
      // Check again after auto-fix
      const recheckProhibited = this.checkProhibitedWords(sanitized);
      if (recheckProhibited.length > 0) {
        // Still has prohibited words after auto-fix - reject
        errors.push(...recheckProhibited.map(w => `CRITICAL: ${w} - This will cause rejection`));
      } else {
        warnings.push('Auto-fixed: Removed prohibited words from output');
      }
    }

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
      // Auto-fix: truncate to max, then back to last word boundary
      sanitized = sanitized.substring(0, rules.titleRange.max).trim();
      const lastSpace = sanitized.lastIndexOf(' ');
      if (lastSpace > rules.titleRange.max * 0.7) {
        sanitized = sanitized.substring(0, lastSpace);
      }
      warnings.push(`Title auto-truncated to ${sanitized.length}/${rules.titleRange.max} characters`);
    }

    if (sanitized.length < rules.titleRange.min) {
      warnings.push(`Title is below recommended minimum of ${rules.titleRange.min} characters (current: ${sanitized.length})`);
    }

    // CRITICAL: Check character utilization (must be 90-100%)
    const utilization = (sanitized.length / rules.titleRange.max) * 100;
    if (utilization < 90) {
      warnings.push(`Title utilization: ${Math.round(utilization)}% (target: 90-100%). Current: ${sanitized.length}/${rules.titleRange.max} chars`);
    }

    return { errors, warnings, sanitized };

    // Check for HTML entities and decode them
    if (/&[a-z]+;/i.test(sanitized)) {
      warnings.push('Title contains HTML entities - converting to plain text');
      // Decode common HTML entities
      sanitized = sanitized
        .replace(/&ndash;/g, '-')
        .replace(/&mdash;/g, '-')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z]+;/gi, ''); // Remove any remaining entities
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

      // Decode HTML entities
      let cleaned = trimmed
        .replace(/&ndash;/g, '-')
        .replace(/&mdash;/g, '-')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z]+;/gi, '');

      if (cleaned.length < 20) {
        warnings.push(`Bullet ${index + 1} is too short (${cleaned.length} chars)`);
      }

      if (cleaned.length > 500) {
        warnings.push(`Bullet ${index + 1} is too long (${cleaned.length} chars)`);
      }

      sanitized.push(cleaned);
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

    // Decode HTML entities
    sanitized = sanitized
      .replace(/&ndash;/g, '-')
      .replace(/&mdash;/g, '-')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/gi, '');

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
    const allText = `${response.title} ${response.description} ${response.bullets.join(' ')}`;
    const prohibitedWords = TrainingContext.PROHIBITED_WORDS;

    prohibitedWords.forEach(word => {
      // Escape special regex characters
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use word boundaries for single words, flexible matching for phrases
      const regex = word.includes(' ')
        ? new RegExp(escapedWord, 'gi')
        : new RegExp(`\\b${escapedWord}\\b`, 'gi');
      
      if (regex.test(allText)) {
        warnings.push(`Contains prohibited word: "${word}"`);
      }
    });

    return warnings;
  }

  /**
   * Remove prohibited words from response
   */
  private static removeProhibitedWords(response: AIGenerationResponse): AIGenerationResponse {
    const prohibitedWords = TrainingContext.PROHIBITED_WORDS;
    const sanitized = { ...response };

    // Sort by length (longest first) to handle multi-word phrases before single words
    const sortedWords = [...prohibitedWords].sort((a, b) => b.length - a.length);

    // Remove from title
    sortedWords.forEach(word => {
      // Escape special regex characters
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use word boundaries for single words, flexible matching for phrases
      const regex = word.includes(' ') 
        ? new RegExp(escapedWord, 'gi')
        : new RegExp(`\\b${escapedWord}\\b`, 'gi');
      sanitized.title = sanitized.title.replace(regex, '').replace(/\s+/g, ' ').trim();
      // Remove leading/trailing dashes or commas
      sanitized.title = sanitized.title.replace(/^[\s\-,]+|[\s\-,]+$/g, '');
    });

    // Remove from bullets
    sanitized.bullets = sanitized.bullets.map(bullet => {
      let cleaned = bullet;
      sortedWords.forEach(word => {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = word.includes(' ')
          ? new RegExp(escapedWord, 'gi')
          : new RegExp(`\\b${escapedWord}\\b`, 'gi');
        cleaned = cleaned.replace(regex, '').replace(/\s+/g, ' ').trim();
        cleaned = cleaned.replace(/^[\s\-,]+|[\s\-,]+$/g, '');
      });
      return cleaned;
    });

    // Remove from description
    sortedWords.forEach(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = word.includes(' ')
        ? new RegExp(escapedWord, 'gi')
        : new RegExp(`\\b${escapedWord}\\b`, 'gi');
      sanitized.description = sanitized.description.replace(regex, '').replace(/\s+/g, ' ').trim();
    });

    return sanitized;
  }

  /**
   * Extend title by appending keywords until 90% utilization is reached
   */
  private static extendTitle(title: string, keywords: string[], maxLength: number): string {
    const target = Math.floor(maxLength * 0.90);
    if (title.length >= target) return title;

    // Collect candidate phrases from keywords — prefer multi-word, title-cased
    const candidates: string[] = keywords
      .map(k => k.trim())
      .filter(k => k.length > 2)
      // Convert to Title Case for natural title flow
      .map(k => k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
      // Deduplicate against existing title words
      .filter(k => !title.toLowerCase().includes(k.toLowerCase()));

    let extended = title;
    for (const kw of candidates) {
      const separator = ' - ';
      const candidate = separator + kw;
      if (extended.length + candidate.length <= maxLength) {
        extended += candidate;
        if (extended.length >= target) break;
      }
    }

    return extended;
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
