/**
 * Compliance Checker Service
 * Automated validation against platform policies and prohibited content
 */

import {
  Platform,
  OptimizedContent,
  ComplianceResult,
  ProhibitedWordResult,
  TitleComplianceResult,
  PolicyComplianceResult,
  ComprehensiveListing,
  ComplianceViolation,
  ComplianceRecommendation,
  ComplianceStatus
} from '@/types';
import { PlatformEngineFactory } from '../engines';

export class ComplianceCheckerService {
  /**
   * Validate content against platform policies
   */
  async validateContent(content: OptimizedContent, platform: Platform): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];

    // Check title compliance
    const titleResult = await this.validateTitleCompliance(content.title, platform);
    if (!titleResult.isValid) {
      violations.push(...titleResult.violations.map(v => ({
        type: 'formatting' as const,
        severity: 'error' as const,
        message: v,
        location: 'title',
        suggestion: titleResult.suggestions[0]
      })));
    }

    // Check for prohibited words
    const prohibitedResult = await this.checkProhibitedWords(
      `${content.title} ${content.description}`,
      platform
    );
    if (prohibitedResult.found) {
      prohibitedResult.words.forEach(word => {
        violations.push({
          type: 'prohibited_word',
          severity: 'warning',
          message: `Contains prohibited word: "${word}"`,
          location: 'content',
          suggestion: prohibitedResult.replacements[word] || `Remove "${word}"`
        });
      });
    }

    // Check description compliance
    const descriptionViolations = this.validateDescriptionContent(content.description, platform);
    violations.push(...descriptionViolations);

    // Check tag compliance
    const tagViolations = this.validateTags(content.tags, platform);
    violations.push(...tagViolations);

    // Determine compliance status
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const isCompliant = errorCount === 0;
    const status: ComplianceStatus = isCompliant ? 'compliant' : 
                                     errorCount > 0 ? 'violation' : 'warning';

    // Generate recommendations
    const recommendations = await this.generateComplianceRecommendations(violations);

    // Calculate compliance score
    const score = this.calculateComplianceScore(violations);

    return {
      isCompliant,
      status,
      violations,
      recommendations,
      score
    };
  }

  /**
   * Check for prohibited words
   */
  async checkProhibitedWords(text: string, platform: Platform): Promise<ProhibitedWordResult> {
    const engine = PlatformEngineFactory.getEngine(platform);
    const rules = engine.getPlatformRules();
    const prohibitedWords = rules.prohibitedWords;

    const found: string[] = [];
    const replacements: Record<string, string> = {};
    const lowerText = text.toLowerCase();

    for (const word of prohibitedWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        found.push(word);
        replacements[word] = this.suggestReplacement(word);
      }
    }

    return {
      found: found.length > 0,
      words: found,
      replacements
    };
  }

  /**
   * Validate title compliance
   */
  async validateTitleCompliance(title: string, platform: Platform): Promise<TitleComplianceResult> {
    const engine = PlatformEngineFactory.getEngine(platform);
    const rules = engine.getPlatformRules();
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check length
    if (title.length > rules.titleRange.max) {
      violations.push(`Title exceeds maximum length of ${rules.titleRange.max} characters`);
      suggestions.push(`Reduce title to ${rules.titleRange.max} characters or less`);
    }

    if (title.length < rules.titleRange.min) {
      violations.push(`Title is below minimum length of ${rules.titleRange.min} characters`);
      suggestions.push(`Add more descriptive keywords to reach ${rules.titleRange.min} characters`);
    }

    // Check for HTML entities
    if (/&[a-z]+;/i.test(title)) {
      violations.push('Title contains HTML entities');
      suggestions.push('Remove HTML entities like &ndash;, &mdash;, etc.');
    }

    // Check for store names at end
    if (/[\s]*[\-–—]+[\s]*[A-Z][a-zA-Z0-9\.\s]+$/.test(title)) {
      violations.push('Title appears to contain store name at the end');
      suggestions.push('Remove store name or website suffix from title');
    }

    // Check for URLs or domains
    if (/\.(com|net|org|pk|co\.uk)/i.test(title)) {
      violations.push('Title contains domain or URL');
      suggestions.push('Remove all website URLs and domain names');
    }

    // Check for all caps (except eBay)
    if (platform !== 'ebay' && title === title.toUpperCase() && title.length > 10) {
      violations.push('Title is in ALL CAPS');
      suggestions.push('Use Title Case or sentence case instead');
    }

    // Check for special characters
    if (/[★©®™]/.test(title) && platform === 'amazon') {
      violations.push('Title contains prohibited special characters');
      suggestions.push('Remove special characters like ★, ©, ®, ™');
    }

    return {
      isValid: violations.length === 0,
      length: title.length,
      maxLength: rules.titleRange.max,
      violations,
      suggestions
    };
  }

  /**
   * Check policy compliance
   */
  async checkPolicyCompliance(listing: ComprehensiveListing, platform: Platform): Promise<PolicyComplianceResult> {
    const violations: ComplianceViolation[] = [];
    const categoryRestrictions: string[] = [];

    // Check for medical claims
    if (this.containsMedicalClaims(listing.optimizedContent.description)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Contains medical claims without FDA approval',
        location: 'description',
        suggestion: 'Remove medical claims or obtain FDA approval'
      });
    }

    // Check for contact information
    if (this.containsContactInfo(listing.optimizedContent.description)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Contains contact information',
        location: 'description',
        suggestion: 'Remove phone numbers, email addresses, and URLs'
      });
    }

    // Check for external links
    if (/https?:\/\/|www\./i.test(listing.optimizedContent.description)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Contains external links',
        location: 'description',
        suggestion: 'Remove all external URLs and links'
      });
    }

    // Platform-specific policy checks
    const platformViolations = this.checkPlatformSpecificPolicies(listing, platform);
    violations.push(...platformViolations);

    return {
      compliant: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      categoryRestrictions
    };
  }

  /**
   * Generate compliance recommendations
   */
  async generateComplianceRecommendations(violations: ComplianceViolation[]): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = [];
    const grouped = this.groupViolationsByType(violations);

    for (const [type, typeViolations] of Object.entries(grouped)) {
      if (typeViolations.length > 0) {
        const recommendation = this.createRecommendation(type, typeViolations);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations;
  }

  /**
   * Validate description content
   */
  private validateDescriptionContent(description: string, platform: Platform): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for external links
    if (/https?:\/\/|www\./i.test(description)) {
      violations.push({
        type: 'policy',
        severity: 'error',
        message: 'Description contains external links',
        location: 'description',
        suggestion: 'Remove all URLs and external links'
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

    // Check for promotional language (platform-specific)
    if (platform === 'amazon') {
      const promoWords = ['free shipping', 'sale', 'discount', 'limited time', 'buy now'];
      for (const word of promoWords) {
        if (description.toLowerCase().includes(word)) {
          violations.push({
            type: 'policy',
            severity: 'warning',
            message: `Contains promotional language: "${word}"`,
            location: 'description',
            suggestion: `Remove promotional terms like "${word}"`
          });
        }
      }
    }

    return violations;
  }

  /**
   * Validate tags
   */
  private validateTags(tags: string[], platform: Platform): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const engine = PlatformEngineFactory.getEngine(platform);
    const rules = engine.getPlatformRules();

    // Check tag count
    if (tags.length > rules.maxTags) {
      violations.push({
        type: 'formatting',
        severity: 'error',
        message: `Too many tags: ${tags.length} (maximum: ${rules.maxTags})`,
        location: 'tags',
        suggestion: `Reduce to ${rules.maxTags} most relevant tags`
      });
    }

    // Check individual tag length (Etsy has 20 char limit)
    if (platform === 'etsy') {
      tags.forEach((tag, index) => {
        if (tag.length > 20) {
          violations.push({
            type: 'formatting',
            severity: 'error',
            message: `Tag "${tag}" exceeds 20 character limit`,
            location: `tags[${index}]`,
            suggestion: `Shorten tag to 20 characters or less`
          });
        }
      });
    }

    return violations;
  }

  /**
   * Check for medical claims
   */
  private containsMedicalClaims(text: string): boolean {
    const medicalTerms = [
      'cure', 'treat', 'heal', 'therapy', 'medical', 'disease', 'diagnosis',
      'prevent illness', 'health benefits', 'FDA approved' // without actual approval
    ];

    const lowerText = text.toLowerCase();
    return medicalTerms.some(term => lowerText.includes(term));
  }

  /**
   * Check for contact information
   */
  private containsContactInfo(text: string): boolean {
    // Phone numbers
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) return true;
    
    // Email addresses
    if (/@[a-z0-9]+\.[a-z]+/i.test(text)) return true;
    
    // Social media handles
    if (/@[a-z0-9_]+/i.test(text)) return true;
    
    return false;
  }

  /**
   * Check platform-specific policies
   */
  private checkPlatformSpecificPolicies(listing: ComprehensiveListing, platform: Platform): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    switch (platform) {
      case 'amazon':
        // Check for Amazon-specific violations
        if (listing.optimizedContent.description.toLowerCase().includes('amazon')) {
          violations.push({
            type: 'policy',
            severity: 'warning',
            message: 'Mentions "Amazon" in description',
            location: 'description',
            suggestion: 'Avoid mentioning Amazon in product descriptions'
          });
        }
        break;

      case 'etsy':
        // Check for handmade/vintage compliance
        const text = listing.optimizedContent.description.toLowerCase();
        if (!text.includes('handmade') && !text.includes('vintage') && !text.includes('craft')) {
          violations.push({
            type: 'policy',
            severity: 'warning',
            message: 'Should indicate handmade, vintage, or craft supply nature',
            location: 'description',
            suggestion: 'Add information about handmade or vintage nature'
          });
        }
        break;

      case 'walmart':
        // Check for competitive pricing mentions
        const walmartText = listing.optimizedContent.description.toLowerCase();
        if (walmartText.includes('lowest price') || walmartText.includes('price match')) {
          violations.push({
            type: 'policy',
            severity: 'warning',
            message: 'Contains pricing claims',
            location: 'description',
            suggestion: 'Remove pricing claims and comparisons'
          });
        }
        break;
    }

    return violations;
  }

  /**
   * Group violations by type
   */
  private groupViolationsByType(violations: ComplianceViolation[]): Record<string, ComplianceViolation[]> {
    const grouped: Record<string, ComplianceViolation[]> = {};

    for (const violation of violations) {
      if (!grouped[violation.type]) {
        grouped[violation.type] = [];
      }
      grouped[violation.type].push(violation);
    }

    return grouped;
  }

  /**
   * Create recommendation from violations
   */
  private createRecommendation(type: string, violations: ComplianceViolation[]): ComplianceRecommendation | null {
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const priority = errorCount > 0 ? 'High' : violations.length > 2 ? 'Medium' : 'Low';

    const categoryMap: Record<string, string> = {
      'prohibited_word': 'Content Quality',
      'formatting': 'Formatting',
      'policy': 'Policy Compliance',
      'content_restriction': 'Content Restrictions'
    };

    const actionMap: Record<string, string> = {
      'prohibited_word': 'Remove prohibited marketing words and replace with specific product features',
      'formatting': 'Adjust formatting to meet platform requirements',
      'policy': 'Review and update content to comply with platform policies',
      'content_restriction': 'Remove restricted content and follow platform guidelines'
    };

    return {
      category: categoryMap[type] || 'General',
      description: `Found ${violations.length} ${type} issue(s)`,
      action: actionMap[type] || 'Review and correct the issues',
      priority
    };
  }

  /**
   * Suggest replacement for prohibited word
   */
  private suggestReplacement(word: string): string {
    const replacements: Record<string, string> = {
      'best': 'high-quality',
      'top': 'leading',
      'premium': 'high-grade',
      'luxury': 'upscale',
      'ultimate': 'comprehensive',
      'perfect': 'ideal',
      'amazing': 'impressive',
      'awesome': 'remarkable',
      'great': 'excellent',
      'excellent': 'superior'
    };

    return replacements[word.toLowerCase()] || 'specific feature';
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    let score = 100;

    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    const infoCount = violations.filter(v => v.severity === 'info').length;

    score -= errorCount * 15;  // -15 points per error
    score -= warningCount * 5; // -5 points per warning
    score -= infoCount * 2;    // -2 points per info

    return Math.max(0, score);
  }
}

// Export singleton instance
export const complianceChecker = new ComplianceCheckerService();
