/**
 * DeepSeek Response Validation Module
 * 
 * Validates DeepSeek API responses for structure, completeness, and quality.
 * Implements quality checklist validation and keyword density calculation.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1-7.7
 */

import { Platform } from '@/types';
import { PLATFORM_RULES, QUALITY_CHECKLIST } from './prompts';

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  expected?: any;
  actual?: any;
}

/**
 * Quality check result for a single criterion
 */
export interface QualityCheckItem {
  passed: boolean;
  actual: number;
  required?: number;
  range?: { min: number; max: number };
  message: string;
}

/**
 * Complete quality check result
 * Requirements: 7.1-7.7
 */
export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  checks: {
    titleCharUtilization: QualityCheckItem;
    bulletCharCount: QualityCheckItem;
    descriptionCharCount: QualityCheckItem;
    keywordCount: QualityCheckItem;
    keywordDensity: QualityCheckItem;
  };
  warnings: string[];
  suggestions: string[];
}

/**
 * DeepSeek optimized content interface
 */
export interface DeepSeekOptimizedContent {
  seoScore: {
    overall: number;
    keywordOptimization: number;
    titleEffectiveness: number;
    descriptionQuality: number;
    beforeScore?: number;
  };
  title: string;
  bullets: string[];
  description: string;
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
    backend: string;
  };
  recommendations: string[];
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Extract JSON from response text
 * 
 * Handles multiple formats:
 * 1. Plain JSON
 * 2. JSON in markdown code blocks (```json...```)
 * 3. JSON with surrounding text
 * 
 * Requirements: 6.4, 9.4
 */
export function extractJsonFromResponse(text: string): any {
  // Try parsing as plain JSON first
  try {
    return JSON.parse(text);
  } catch {
    // Not plain JSON, continue to other methods
  }

  // Try extracting from markdown code blocks
  const markdownJsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (markdownJsonMatch) {
    try {
      return JSON.parse(markdownJsonMatch[1]);
    } catch {
      // Failed to parse markdown JSON
    }
  }

  // Try extracting from generic code blocks
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // Failed to parse code block
    }
  }

  // Try finding JSON object with regex
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]);
    } catch {
      // Failed to parse extracted JSON
    }
  }

  // All extraction methods failed
  throw new Error('Could not extract valid JSON from response');
}

/**
 * Validate response structure
 * 
 * Checks if the response has the expected JSON structure.
 * Requirements: 6.1
 */
export function validateResponseStructure(response: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!response || typeof response !== 'object') {
    errors.push({
      field: 'response',
      message: 'Response must be a valid JSON object',
      expected: 'object',
      actual: typeof response
    });
    return { valid: false, errors, warnings: [] };
  }

  return { valid: true, errors: [], warnings: [] };
}

/**
 * Validate required fields
 * 
 * Ensures all required fields are present in the response.
 * Requirements: 6.2
 */
export function validateRequiredFields(response: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  const requiredFields = [
    'seoScore',
    'title',
    'bullets',
    'description',
    'keywords',
    'recommendations'
  ];

  for (const field of requiredFields) {
    if (!(field in response)) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        expected: 'present',
        actual: 'missing'
      });
    }
  }

  // Check nested seoScore fields
  if (response.seoScore && typeof response.seoScore === 'object') {
    const seoScoreFields = ['overall', 'keywordOptimization', 'titleEffectiveness', 'descriptionQuality'];
    for (const field of seoScoreFields) {
      if (!(field in response.seoScore)) {
        warnings.push(`SEO score field '${field}' is missing`);
      }
    }
  }

  // Check nested keywords fields
  if (response.keywords && typeof response.keywords === 'object') {
    const keywordFields = ['primary', 'secondary', 'longTail', 'backend'];
    for (const field of keywordFields) {
      if (!(field in response.keywords)) {
        warnings.push(`Keywords field '${field}' is missing`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate field types and ranges
 * 
 * Ensures fields have correct types and values are within acceptable ranges.
 * Requirements: 6.3, 6.5, 6.6, 6.7
 */
export function validateFieldTypes(response: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Validate seoScore
  if (response.seoScore) {
    if (typeof response.seoScore !== 'object') {
      errors.push({
        field: 'seoScore',
        message: 'seoScore must be an object',
        expected: 'object',
        actual: typeof response.seoScore
      });
    } else {
      // Validate seoScore.overall (Requirement 6.5)
      if (typeof response.seoScore.overall !== 'number') {
        errors.push({
          field: 'seoScore.overall',
          message: 'seoScore.overall must be a number',
          expected: 'number',
          actual: typeof response.seoScore.overall
        });
      } else if (response.seoScore.overall < 0 || response.seoScore.overall > 100) {
        errors.push({
          field: 'seoScore.overall',
          message: 'seoScore.overall must be between 0 and 100',
          expected: '0-100',
          actual: response.seoScore.overall
        });
      }

      // Validate other seoScore fields
      const seoFields = ['keywordOptimization', 'titleEffectiveness', 'descriptionQuality'];
      for (const field of seoFields) {
        if (response.seoScore[field] !== undefined) {
          if (typeof response.seoScore[field] !== 'number') {
            warnings.push(`seoScore.${field} should be a number`);
          } else if (response.seoScore[field] < 0 || response.seoScore[field] > 100) {
            warnings.push(`seoScore.${field} should be between 0 and 100`);
          }
        }
      }
    }
  }

  // Validate title
  if (response.title !== undefined && typeof response.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'title must be a string',
      expected: 'string',
      actual: typeof response.title
    });
  }

  // Validate bullets (Requirement 6.6)
  if (response.bullets !== undefined) {
    if (!Array.isArray(response.bullets)) {
      errors.push({
        field: 'bullets',
        message: 'bullets must be an array',
        expected: 'array',
        actual: typeof response.bullets
      });
    } else {
      for (let i = 0; i < response.bullets.length; i++) {
        if (typeof response.bullets[i] !== 'string') {
          errors.push({
            field: `bullets[${i}]`,
            message: `bullets[${i}] must be a string`,
            expected: 'string',
            actual: typeof response.bullets[i]
          });
        }
      }
    }
  }

  // Validate description
  if (response.description !== undefined && typeof response.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'description must be a string',
      expected: 'string',
      actual: typeof response.description
    });
  }

  // Validate keywords (Requirement 6.7)
  if (response.keywords !== undefined) {
    if (typeof response.keywords !== 'object') {
      errors.push({
        field: 'keywords',
        message: 'keywords must be an object',
        expected: 'object',
        actual: typeof response.keywords
      });
    } else {
      const keywordArrays = ['primary', 'secondary', 'longTail'];
      for (const field of keywordArrays) {
        if (response.keywords[field] !== undefined) {
          if (!Array.isArray(response.keywords[field])) {
            errors.push({
              field: `keywords.${field}`,
              message: `keywords.${field} must be an array`,
              expected: 'array',
              actual: typeof response.keywords[field]
            });
          } else {
            for (let i = 0; i < response.keywords[field].length; i++) {
              if (typeof response.keywords[field][i] !== 'string') {
                errors.push({
                  field: `keywords.${field}[${i}]`,
                  message: `keywords.${field}[${i}] must be a string`,
                  expected: 'string',
                  actual: typeof response.keywords[field][i]
                });
              }
            }
          }
        }
      }

      // Validate backend keywords
      if (response.keywords.backend !== undefined && typeof response.keywords.backend !== 'string') {
        warnings.push('keywords.backend should be a string');
      }
    }
  }

  // Validate recommendations
  if (response.recommendations !== undefined) {
    if (!Array.isArray(response.recommendations)) {
      warnings.push('recommendations should be an array');
    } else {
      for (let i = 0; i < response.recommendations.length; i++) {
        if (typeof response.recommendations[i] !== 'string') {
          warnings.push(`recommendations[${i}] should be a string`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate keyword density
 * 
 * Calculates the percentage of content composed of target keywords.
 * Requirements: 7.5, 11.5
 */
export function calculateKeywordDensity(text: string, keywords: string[]): number {
  if (!text || keywords.length === 0) {
    return 0;
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  if (totalWords === 0) {
    return 0;
  }

  let keywordCount = 0;
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    const keywordWords = lowerKeyword.split(/\s+/);
    
    // Count single-word keywords
    if (keywordWords.length === 1) {
      keywordCount += words.filter(w => w === lowerKeyword).length;
    } else {
      // Count multi-word keywords
      const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        keywordCount += matches.length * keywordWords.length;
      }
    }
  }

  return keywordCount / totalWords;
}

/**
 * Run quality checklist validation
 * 
 * Validates content against quality standards for the platform.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */
export function runQualityChecklist(
  content: DeepSeekOptimizedContent,
  platform: Platform
): QualityCheckResult {
  const platformRules = PLATFORM_RULES[platform];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check title character utilization (Requirement 7.1)
  const titleLength = content.title.length;
  const titleMaxLength = platformRules.titleLimit.max;
  const titleUtilization = titleLength / titleMaxLength;
  const titleCheck: QualityCheckItem = {
    passed: titleUtilization >= QUALITY_CHECKLIST.titleCharUtilization,
    actual: titleUtilization,
    required: QUALITY_CHECKLIST.titleCharUtilization,
    message: titleUtilization >= QUALITY_CHECKLIST.titleCharUtilization
      ? `Title uses ${Math.round(titleUtilization * 100)}% of character limit (${titleLength}/${titleMaxLength} chars)`
      : `Title only uses ${Math.round(titleUtilization * 100)}% of character limit (${titleLength}/${titleMaxLength} chars). Aim for 90%+`
  };

  if (!titleCheck.passed) {
    warnings.push(titleCheck.message);
    suggestions.push(`Expand title to use at least ${Math.ceil(titleMaxLength * 0.9)} characters`);
  }

  // Check bullet points character count (Requirement 7.2)
  const totalBulletChars = content.bullets.reduce((sum, bullet) => sum + bullet.length, 0);
  const bulletCheck: QualityCheckItem = {
    passed: totalBulletChars >= QUALITY_CHECKLIST.bulletCharRange.min && 
            totalBulletChars <= QUALITY_CHECKLIST.bulletCharRange.max,
    actual: totalBulletChars,
    range: QUALITY_CHECKLIST.bulletCharRange,
    message: totalBulletChars >= QUALITY_CHECKLIST.bulletCharRange.min && 
             totalBulletChars <= QUALITY_CHECKLIST.bulletCharRange.max
      ? `Bullet points total ${totalBulletChars} characters (optimal range)`
      : `Bullet points total ${totalBulletChars} characters. Target: ${QUALITY_CHECKLIST.bulletCharRange.min}-${QUALITY_CHECKLIST.bulletCharRange.max} chars`
  };

  if (!bulletCheck.passed) {
    warnings.push(bulletCheck.message);
    if (totalBulletChars < QUALITY_CHECKLIST.bulletCharRange.min) {
      suggestions.push('Add more detail to bullet points to reach 400-500 characters total');
    } else {
      suggestions.push('Condense bullet points to stay within 400-500 characters total');
    }
  }

  // Check description character count (Requirement 7.3)
  const descriptionLength = content.description.length;
  const descriptionCheck: QualityCheckItem = {
    passed: descriptionLength >= QUALITY_CHECKLIST.descriptionCharRange.min && 
            descriptionLength <= QUALITY_CHECKLIST.descriptionCharRange.max,
    actual: descriptionLength,
    range: QUALITY_CHECKLIST.descriptionCharRange,
    message: descriptionLength >= QUALITY_CHECKLIST.descriptionCharRange.min && 
             descriptionLength <= QUALITY_CHECKLIST.descriptionCharRange.max
      ? `Description is ${descriptionLength} characters (optimal range)`
      : `Description is ${descriptionLength} characters. Target: ${QUALITY_CHECKLIST.descriptionCharRange.min}-${QUALITY_CHECKLIST.descriptionCharRange.max} chars`
  };

  if (!descriptionCheck.passed) {
    warnings.push(descriptionCheck.message);
    if (descriptionLength < QUALITY_CHECKLIST.descriptionCharRange.min) {
      suggestions.push('Expand description with more details, use cases, and benefits');
    } else {
      suggestions.push('Condense description to stay within 1500-2000 characters');
    }
  }

  // Check keyword count (Requirement 7.4)
  const allKeywords = [
    ...content.keywords.primary,
    ...content.keywords.secondary,
    ...content.keywords.longTail
  ];
  const keywordCount = allKeywords.length;
  const keywordCountCheck: QualityCheckItem = {
    passed: keywordCount >= QUALITY_CHECKLIST.keywordCount.min && 
            keywordCount <= QUALITY_CHECKLIST.keywordCount.max,
    actual: keywordCount,
    range: QUALITY_CHECKLIST.keywordCount,
    message: keywordCount >= QUALITY_CHECKLIST.keywordCount.min && 
             keywordCount <= QUALITY_CHECKLIST.keywordCount.max
      ? `${keywordCount} keywords provided (optimal range)`
      : `${keywordCount} keywords provided. Target: ${QUALITY_CHECKLIST.keywordCount.min}-${QUALITY_CHECKLIST.keywordCount.max} keywords`
  };

  if (!keywordCountCheck.passed) {
    warnings.push(keywordCountCheck.message);
    if (keywordCount < QUALITY_CHECKLIST.keywordCount.min) {
      suggestions.push('Add more relevant keywords to reach 40-60 total');
    } else {
      suggestions.push('Reduce keyword count to stay within 40-60 total');
    }
  }

  // Check keyword density (Requirement 7.5)
  const fullText = `${content.title} ${content.bullets.join(' ')} ${content.description}`;
  const keywordDensity = calculateKeywordDensity(fullText, allKeywords);
  const keywordDensityCheck: QualityCheckItem = {
    passed: keywordDensity >= QUALITY_CHECKLIST.keywordDensity.min && 
            keywordDensity <= QUALITY_CHECKLIST.keywordDensity.max,
    actual: keywordDensity,
    range: QUALITY_CHECKLIST.keywordDensity,
    message: keywordDensity >= QUALITY_CHECKLIST.keywordDensity.min && 
             keywordDensity <= QUALITY_CHECKLIST.keywordDensity.max
      ? `Keyword density is ${(keywordDensity * 100).toFixed(2)}% (optimal range)`
      : `Keyword density is ${(keywordDensity * 100).toFixed(2)}%. Target: ${QUALITY_CHECKLIST.keywordDensity.min * 100}-${QUALITY_CHECKLIST.keywordDensity.max * 100}%`
  };

  if (!keywordDensityCheck.passed) {
    warnings.push(keywordDensityCheck.message);
    if (keywordDensity < QUALITY_CHECKLIST.keywordDensity.min) {
      suggestions.push('Integrate keywords more naturally throughout the content');
    } else {
      suggestions.push('Reduce keyword usage to avoid keyword stuffing (aim for 1-2% density)');
    }
  }

  // Calculate overall quality score
  const checks = [titleCheck, bulletCheck, descriptionCheck, keywordCountCheck, keywordDensityCheck];
  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    passed: passedChecks === checks.length,
    score,
    checks: {
      titleCharUtilization: titleCheck,
      bulletCharCount: bulletCheck,
      descriptionCharCount: descriptionCheck,
      keywordCount: keywordCountCheck,
      keywordDensity: keywordDensityCheck
    },
    warnings,
    suggestions
  };
}

/**
 * Validate complete DeepSeek response
 * 
 * Runs all validation checks on a DeepSeek API response.
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 6.7
 */
export function validateDeepSeekResponse(response: any): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: string[] = [];

  // Validate structure
  const structureResult = validateResponseStructure(response);
  allErrors.push(...structureResult.errors);
  allWarnings.push(...structureResult.warnings);

  if (!structureResult.valid) {
    return { valid: false, errors: allErrors, warnings: allWarnings };
  }

  // Validate required fields
  const fieldsResult = validateRequiredFields(response);
  allErrors.push(...fieldsResult.errors);
  allWarnings.push(...fieldsResult.warnings);

  // Validate field types
  const typesResult = validateFieldTypes(response);
  allErrors.push(...typesResult.errors);
  allWarnings.push(...typesResult.warnings);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}
