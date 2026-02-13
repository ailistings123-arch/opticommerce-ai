import {
  Platform,
  BaseContent,
  PlatformOptimizedContent,
  ComplianceResult,
  AlgorithmFactors,
  OptimizedContent,
  FormattedListing,
  EnhancedPlatformRules,
  ComplianceViolation,
  ComplianceRecommendation,
  ProductSpecification
} from '@/types';

/**
 * Abstract base class for platform-specific optimization engines.
 * Each platform implementation handles algorithm-specific optimization,
 * formatting requirements, and compliance validation.
 */
export abstract class PlatformEngine {
  protected platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  /**
   * Optimize content for the specific platform's algorithm and requirements
   */
  abstract optimizeForPlatform(content: BaseContent): Promise<PlatformOptimizedContent>;

  /**
   * Validate content against platform-specific compliance rules
   */
  abstract validatePlatformCompliance(content: PlatformOptimizedContent): Promise<ComplianceResult>;

  /**
   * Get algorithm-specific ranking factors for the platform
   */
  abstract getAlgorithmFactors(): AlgorithmFactors;

  /**
   * Format optimized content according to platform requirements
   */
  abstract formatForPlatform(content: OptimizedContent): Promise<FormattedListing>;

  /**
   * Get comprehensive platform rules and requirements
   */
  abstract getPlatformRules(): EnhancedPlatformRules;

  /**
   * Common method to validate title length against platform limits
   */
  protected validateTitleLength(title: string, maxLength: number): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    if (title.length > maxLength) {
      violations.push({
        type: 'formatting',
        severity: 'error',
        message: `Title exceeds maximum length of ${maxLength} characters (current: ${title.length})`,
        location: 'title',
        suggestion: `Shorten title to ${maxLength} characters or less`
      });
    }

    return violations;
  }

  /**
   * Common method to validate description minimum length
   */
  protected validateDescriptionLength(description: string, minLength: number): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    if (description.length < minLength) {
      violations.push({
        type: 'formatting',
        severity: 'warning',
        message: `Description is below recommended minimum of ${minLength} characters (current: ${description.length})`,
        location: 'description',
        suggestion: `Expand description to at least ${minLength} characters for better optimization`
      });
    }

    return violations;
  }

  /**
   * Common method to validate tag count against platform limits
   */
  protected validateTagCount(tags: string[], maxTags: number): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    if (tags.length > maxTags) {
      violations.push({
        type: 'formatting',
        severity: 'error',
        message: `Too many tags: ${tags.length} (maximum: ${maxTags})`,
        location: 'tags',
        suggestion: `Reduce to ${maxTags} most relevant tags`
      });
    }

    return violations;
  }

  /**
   * Common method to check for prohibited words
   */
  protected checkProhibitedWords(text: string, prohibitedWords: string[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const lowerText = text.toLowerCase();
    
    for (const word of prohibitedWords) {
      if (lowerText.includes(word.toLowerCase())) {
        violations.push({
          type: 'prohibited_word',
          severity: 'error',
          message: `Contains prohibited word: "${word}"`,
          location: 'content',
          suggestion: `Remove or replace "${word}" with alternative phrasing`
        });
      }
    }

    return violations;
  }

  /**
   * Common method to generate compliance recommendations
   */
  protected generateComplianceRecommendations(violations: ComplianceViolation[]): ComplianceRecommendation[] {
    return violations.map(violation => ({
      category: violation.type,
      description: violation.message,
      action: violation.suggestion || 'Review and correct the identified issue',
      priority: violation.severity === 'error' ? 'High' : violation.severity === 'warning' ? 'Medium' : 'Low'
    }));
  }

  /**
   * Common method to optimize title for mobile display
   */
  protected optimizeTitleForMobile(title: string, frontLoadLength: number = 60): string {
    if (title.length <= frontLoadLength) {
      return title;
    }

    // Find the best break point near the front-load length
    const words = title.split(' ');
    let optimizedTitle = '';
    let currentLength = 0;

    for (const word of words) {
      if (currentLength + word.length + 1 > frontLoadLength) {
        break;
      }
      optimizedTitle += (optimizedTitle ? ' ' : '') + word;
      currentLength = optimizedTitle.length;
    }

    // If we couldn't fit any words, just truncate
    if (!optimizedTitle) {
      optimizedTitle = title.substring(0, frontLoadLength - 3) + '...';
    }

    return optimizedTitle;
  }

  /**
   * Common method to structure description for mobile readability
   */
  protected formatDescriptionForMobile(description: string): string {
    // Split into paragraphs and ensure they're not too long
    const paragraphs = description.split('\n\n');
    const formattedParagraphs = paragraphs.map(paragraph => {
      // If paragraph is too long, break it into shorter sentences
      if (paragraph.length > 200) {
        const sentences = paragraph.split('. ');
        let currentParagraph = '';
        const result = [];

        for (const sentence of sentences) {
          if (currentParagraph.length + sentence.length > 200) {
            if (currentParagraph) {
              result.push(currentParagraph.trim());
              currentParagraph = sentence;
            } else {
              result.push(sentence);
            }
          } else {
            currentParagraph += (currentParagraph ? '. ' : '') + sentence;
          }
        }

        if (currentParagraph) {
          result.push(currentParagraph.trim());
        }

        return result.join('\n\n');
      }
      return paragraph;
    });

    return formattedParagraphs.join('\n\n');
  }

  /**
   * Common method to extract key specifications for platform-specific formatting
   */
  protected extractKeySpecifications(specifications: ProductSpecification[]): Record<string, string> {
    const keySpecs: Record<string, string> = {};
    
    for (const spec of specifications) {
      const key = spec.name.toLowerCase().replace(/\s+/g, '_');
      const value = spec.unit ? `${spec.value} ${spec.unit}` : spec.value;
      keySpecs[key] = value;
    }

    return keySpecs;
  }
}