/**
 * Base Platform Engine
 * Abstract class providing common optimization methods for all platform-specific engines
 */

import {
  Platform,
  BaseContent,
  PlatformOptimizedContent,
  ComplianceResult,
  AlgorithmFactors,
  FormattedListing,
  OptimizedContent,
  EnhancedPlatformRules,
  ComplianceViolation,
  ComplianceStatus
} from '@/types';

export abstract class BasePlatformEngine {
  protected platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  /**
   * Get platform-specific rules and requirements
   */
  abstract getPlatformRules(): EnhancedPlatformRules;

  /**
   * Get algorithm-specific ranking factors
   */
  abstract getAlgorithmFactors(): AlgorithmFactors;

  /**
   * Optimize content for specific platform
   */
  async optimizeForPlatform(content: BaseContent): Promise<PlatformOptimizedContent> {
    const rules = this.getPlatformRules();
    
    // Apply platform-specific title optimization
    const optimizedTitle = await this.optimizeTitle(content.title, content.keywords);
    
    // Apply platform-specific description optimization
    const optimizedDescription = await this.optimizeDescription(
      content.description,
      content.keywords,
      content.specifications
    );
    
    // Generate platform-specific tags
    const tags = await this.generateTags(content);
    
    // Generate platform-specific elements (bullet points, backend terms, etc.)
    const platformSpecificElements = await this.generatePlatformSpecificElements(content);
    
    return {
      platform: this.platform,
      title: optimizedTitle,
      description: optimizedDescription,
      tags,
      ...platformSpecificElements
    };
  }

  /**
   * Validate platform compliance
   */
  async validatePlatformCompliance(content: PlatformOptimizedContent): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    const rules = this.getPlatformRules();
    
    // Validate title compliance
    const titleViolations = this.validateTitle(content.title, rules);
    violations.push(...titleViolations);
    
    // Validate description compliance
    const descriptionViolations = this.validateDescription(content.description, rules);
    violations.push(...descriptionViolations);
    
    // Check for prohibited words
    const prohibitedWordViolations = this.checkProhibitedWords(
      `${content.title} ${content.description}`,
      rules.prohibitedWords
    );
    violations.push(...prohibitedWordViolations);
    
    // Validate tags
    const tagViolations = this.validateTags(content.tags, rules);
    violations.push(...tagViolations);
    
    const isCompliant = violations.filter(v => v.severity === 'error').length === 0;
    const status: ComplianceStatus = isCompliant ? 'compliant' : 
                                     violations.some(v => v.severity === 'error') ? 'violation' : 'warning';
    
    return {
      isCompliant,
      status,
      violations,
      recommendations: this.generateComplianceRecommendations(violations),
      score: this.calculateComplianceScore(violations)
    };
  }

  /**
   * Format content for platform
   */
  async formatForPlatform(content: OptimizedContent): Promise<FormattedListing> {
    const platformContent = await this.optimizeForPlatform(content);
    const compliance = await this.validatePlatformCompliance(platformContent);
    
    return {
      platform: this.platform,
      content: platformContent,
      formatting: {
        titleLength: platformContent.title.length,
        descriptionLength: platformContent.description.length,
        tagCount: platformContent.tags.length,
        bulletPointCount: platformContent.bulletPoints?.length
      },
      compliance
    };
  }

  /**
   * Optimize title for platform
   */
  protected abstract optimizeTitle(title: string, keywords: string[]): Promise<string>;

  /**
   * Optimize description for platform
   */
  protected abstract optimizeDescription(
    description: string,
    keywords: string[],
    specifications: any[]
  ): Promise<string>;

  /**
   * Generate platform-specific tags
   */
  protected abstract generateTags(content: BaseContent): Promise<string[]>;

  /**
   * Generate platform-specific elements (bullets, backend terms, etc.)
   */
  protected abstract generatePlatformSpecificElements(content: BaseContent): Promise<any>;

  /**
   * Validate title against platform rules
   */
  protected validateTitle(title: string, rules: EnhancedPlatformRules): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    // Check length
    if (title.length > rules.titleRange.max) {
      violations.push({
        type: 'formatting',
        severity: 'error',
        message: `Title exceeds maximum length of ${rules.titleRange.max} characters`,
        location: 'title',
        suggestion: `Reduce title to ${rules.titleRange.max} characters or less`
      });
    }
    
    if (title.length < rules.titleRange.min) {
      violations.push({
        type: 'formatting',
        severity: 'warning',
        message: `Title is below recommended minimum of ${rules.titleRange.min} characters`,
        location: 'title',
        suggestion: `Add more descriptive keywords to reach ${rules.titleRange.min} characters`
      });
    }
    
    // Check for HTML entities
    if (/&[a-z]+;/i.test(title)) {
      violations.push({
        type: 'formatting',
        severity: 'error',
        message: 'Title contains HTML entities',
        location: 'title',
        suggestion: 'Remove HTML entities like &ndash;, &mdash;, etc.'
      });
    }
    
    // Check for store names at end
    if (/[\s]*[\-–—]+[\s]*[A-Z][a-zA-Z0-9\.\s]+$/.test(title)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Title appears to contain store name at the end',
        location: 'title',
        suggestion: 'Remove store name or website suffix from title'
      });
    }
    
    return violations;
  }

  /**
   * Validate description against platform rules
   */
  protected validateDescription(description: string, rules: EnhancedPlatformRules): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    // Check minimum length
    if (description.length < rules.minDescription) {
      violations.push({
        type: 'formatting',
        severity: 'warning',
        message: `Description is below recommended minimum of ${rules.minDescription} characters`,
        location: 'description',
        suggestion: `Add more detailed product information to reach ${rules.minDescription} characters`
      });
    }
    
    // Check for external links
    if (/https?:\/\/|www\./i.test(description)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Description contains external links',
        location: 'description',
        suggestion: 'Remove all URLs and external links from description'
      });
    }
    
    // Check for contact information
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|@[a-z0-9]+\.[a-z]+/i.test(description)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Description contains contact information',
        location: 'description',
        suggestion: 'Remove phone numbers and email addresses'
      });
    }
    
    return violations;
  }

  /**
   * Check for prohibited words
   */
  protected checkProhibitedWords(text: string, prohibitedWords: string[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const lowerText = text.toLowerCase();
    
    for (const word of prohibitedWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        violations.push({
          type: 'prohibited_word',
          severity: 'warning',
          message: `Contains prohibited word: "${word}"`,
          location: 'content',
          suggestion: `Remove or replace "${word}" with specific product features`
        });
      }
    }
    
    return violations;
  }

  /**
   * Validate tags against platform rules
   */
  protected validateTags(tags: string[], rules: EnhancedPlatformRules): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    if (tags.length > rules.maxTags) {
      violations.push({
        type: 'formatting',
        severity: 'error',
        message: `Too many tags: ${tags.length} (maximum: ${rules.maxTags})`,
        location: 'tags',
        suggestion: `Reduce to ${rules.maxTags} most relevant tags`
      });
    }
    
    return violations;
  }

  /**
   * Generate compliance recommendations
   */
  protected generateComplianceRecommendations(violations: ComplianceViolation[]): any[] {
    return violations.map(v => ({
      category: v.type,
      description: v.message,
      action: v.suggestion || 'Review and correct the issue',
      priority: v.severity === 'error' ? 'High' : v.severity === 'warning' ? 'Medium' : 'Low'
    }));
  }

  /**
   * Calculate compliance score
   */
  protected calculateComplianceScore(violations: ComplianceViolation[]): number {
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    
    // Start with 100, deduct points for violations
    let score = 100;
    score -= errorCount * 15; // -15 points per error
    score -= warningCount * 5; // -5 points per warning
    
    return Math.max(0, score);
  }

  /**
   * Clean title by removing banned elements
   */
  protected cleanTitle(title: string): string {
    let cleaned = title;
    
    // Remove HTML entities
    cleaned = cleaned.replace(/&[a-z]+;/gi, '');
    
    // Remove store names and suffixes from the end
    cleaned = cleaned.replace(/[\s]*[\-–—]+[\s]*[A-Z][a-zA-Z0-9\.\s]+$/g, '');
    cleaned = cleaned.replace(/[\s]+(by|from)[\s]+[A-Z][a-zA-Z0-9\.\s]+$/gi, '');
    cleaned = cleaned.replace(/[\s]*[\-–—]+[\s]*[A-Z][a-zA-Z]+(\.[A-Z]{2,})?$/g, '');
    cleaned = cleaned.replace(/[\s]*[\-–—]*[\s]*(Phonecase\.PK|PhoneCase\.PK|phonecase\.pk)/gi, '');
    cleaned = cleaned.replace(/[\s]*[\-–—]*[\s]*[a-zA-Z0-9]+\.(com|pk|net|org|co|uk|in|us)$/gi, '');
    
    // Clean up extra spaces and trailing punctuation
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[\-–—\s]+$/g, '').trim();
    cleaned = cleaned.replace(/^[\-–—\s]+/g, '').trim();
    
    return cleaned;
  }

  /**
   * Remove prohibited words from text
   */
  protected removeProhibitedWords(text: string, prohibitedWords: string[]): string {
    let cleaned = text;
    
    for (const word of prohibitedWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    }
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }
}
