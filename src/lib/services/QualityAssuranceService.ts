/**
 * Quality Assurance Service
 * Comprehensive quality validation and improvement recommendations
 */

import {
  ComprehensiveListing,
  QualityReport,
  GrammarCheckResult,
  MobileOptimizationResult,
  ImprovementRecommendation,
  QualityScore,
  QualityIssue,
  QualityMetrics
} from '@/types';

export class QualityAssuranceService {
  /**
   * Validate overall quality of listing
   */
  async validateQuality(listing: ComprehensiveListing): Promise<QualityReport> {
    const issues: QualityIssue[] = [];

    // Check grammar and spelling
    const grammarResult = await this.checkGrammarAndSpelling(
      `${listing.optimizedContent.title} ${listing.optimizedContent.description}`
    );
    issues.push(...grammarResult.errors);

    // Check completeness
    const completenessIssues = this.checkCompleteness(listing);
    issues.push(...completenessIssues);

    // Check structure
    const structureIssues = this.checkStructure(listing.optimizedContent.description);
    issues.push(...structureIssues);

    // Check readability
    const readabilityIssues = this.checkReadability(listing.optimizedContent.description);
    issues.push(...readabilityIssues);

    // Validate mobile optimization
    const mobileOptimization = await this.validateMobileOptimization(listing);

    // Calculate overall quality metrics
    const overall: QualityMetrics = {
      qualityScore: await this.calculateOverallQualityScore(listing),
      grammarScore: grammarResult.score,
      completenessScore: this.calculateCompletenessScore(listing),
      professionalismScore: this.calculateProfessionalismScore(listing)
    };

    // Generate recommendations
    const recommendations = await this.generateImprovementRecommendations({
      overall,
      issues,
      recommendations: [],
      mobileOptimization
    });

    return {
      overall,
      issues,
      recommendations,
      mobileOptimization
    };
  }

  /**
   * Check grammar and spelling
   */
  async checkGrammarAndSpelling(text: string): Promise<GrammarCheckResult> {
    const errors: QualityIssue[] = [];
    const suggestions: string[] = [];

    // Check for common grammar issues
    
    // Double spaces
    if (/\s{2,}/.test(text)) {
      errors.push({
        type: 'grammar',
        severity: 'suggestion',
        message: 'Multiple consecutive spaces found',
        location: 'content',
        suggestion: 'Remove extra spaces'
      });
      suggestions.push('Remove extra spaces between words');
    }

    // Missing punctuation at end of sentences
    const sentences = text.split(/[.!?]+/);
    if (sentences.length > 1 && !text.trim().match(/[.!?]$/)) {
      errors.push({
        type: 'grammar',
        severity: 'warning',
        message: 'Missing punctuation at end of text',
        location: 'content',
        suggestion: 'Add appropriate punctuation'
      });
    }

    // Check for common spelling mistakes
    const commonMistakes: Record<string, string> = {
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definately': 'definitely',
      'accomodate': 'accommodate'
    };

    const lowerText = text.toLowerCase();
    for (const [wrong, correct] of Object.entries(commonMistakes)) {
      if (lowerText.includes(wrong)) {
        errors.push({
          type: 'spelling',
          severity: 'error',
          message: `Possible spelling error: "${wrong}"`,
          location: 'content',
          suggestion: `Did you mean "${correct}"?`
        });
        suggestions.push(`Replace "${wrong}" with "${correct}"`);
      }
    }

    // Check for repeated words
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] === words[i + 1] && words[i].length > 3) {
        errors.push({
          type: 'grammar',
          severity: 'warning',
          message: `Repeated word: "${words[i]}"`,
          location: 'content',
          suggestion: 'Remove duplicate word'
        });
      }
    }

    // Calculate grammar score
    const score = Math.max(0, 100 - errors.length * 10);

    return {
      errors,
      suggestions,
      score
    };
  }

  /**
   * Validate mobile optimization
   */
  async validateMobileOptimization(listing: ComprehensiveListing): Promise<MobileOptimizationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check title mobile-friendliness
    const titleMobileFriendly = listing.optimizedContent.title.length <= 80;
    if (!titleMobileFriendly) {
      issues.push('Title exceeds 80 characters (may be truncated on mobile)');
      recommendations.push('Keep first 60-80 characters most important for mobile display');
    }

    // Check description formatting
    const descriptionFormatted = this.checkMobileDescriptionFormat(listing.optimizedContent.description);
    if (!descriptionFormatted) {
      issues.push('Description lacks mobile-friendly formatting');
      recommendations.push('Use short paragraphs and bullet points for mobile readability');
    }

    // Check readability
    const readabilityScore = this.calculateReadabilityScore(listing.optimizedContent.description);

    // Calculate mobile optimization score
    let score = 100;
    score -= issues.length * 15;
    score = Math.max(0, score);

    return {
      score,
      titleMobileFriendly,
      descriptionFormatted,
      readabilityScore,
      issues,
      recommendations
    };
  }

  /**
   * Generate improvement recommendations
   */
  async generateImprovementRecommendations(qualityReport: QualityReport): Promise<ImprovementRecommendation[]> {
    const recommendations: ImprovementRecommendation[] = [];

    // Grammar recommendations
    const grammarIssues = qualityReport.issues.filter(i => i.type === 'grammar' || i.type === 'spelling');
    if (grammarIssues.length > 0) {
      recommendations.push({
        category: 'Quality',
        description: `Found ${grammarIssues.length} grammar or spelling issue(s)`,
        impact: grammarIssues.some(i => i.severity === 'error') ? 'High' : 'Medium',
        implementation: 'Review and correct grammar and spelling errors',
        priority: grammarIssues.some(i => i.severity === 'error') ? 1 : 2
      });
    }

    // Completeness recommendations
    const completenessIssues = qualityReport.issues.filter(i => i.type === 'completeness');
    if (completenessIssues.length > 0) {
      recommendations.push({
        category: 'Quality',
        description: 'Missing required product information',
        impact: 'High',
        implementation: 'Add missing specifications, care instructions, or package contents',
        priority: 1
      });
    }

    // Structure recommendations
    const structureIssues = qualityReport.issues.filter(i => i.type === 'structure');
    if (structureIssues.length > 0) {
      recommendations.push({
        category: 'Quality',
        description: 'Description structure could be improved',
        impact: 'Medium',
        implementation: 'Add clear sections with headers and bullet points',
        priority: 2
      });
    }

    // Mobile optimization recommendations
    if (qualityReport.mobileOptimization.score < 80) {
      recommendations.push({
        category: 'Quality',
        description: 'Mobile optimization needs improvement',
        impact: 'High',
        implementation: qualityReport.mobileOptimization.recommendations.join('; '),
        priority: 1
      });
    }

    // Readability recommendations
    const readabilityIssues = qualityReport.issues.filter(i => i.type === 'readability');
    if (readabilityIssues.length > 0) {
      recommendations.push({
        category: 'Quality',
        description: 'Readability could be improved',
        impact: 'Medium',
        implementation: 'Use shorter sentences and simpler language',
        priority: 3
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate quality score
   */
  async calculateQualityScore(listing: ComprehensiveListing): Promise<QualityScore> {
    const grammarResult = await this.checkGrammarAndSpelling(
      `${listing.optimizedContent.title} ${listing.optimizedContent.description}`
    );

    return {
      overall: await this.calculateOverallQualityScore(listing),
      grammar: grammarResult.score,
      structure: this.calculateStructureScore(listing.optimizedContent.description),
      completeness: this.calculateCompletenessScore(listing),
      readability: this.calculateReadabilityScore(listing.optimizedContent.description),
      mobile: (await this.validateMobileOptimization(listing)).score
    };
  }

  /**
   * Check completeness of listing
   */
  private checkCompleteness(listing: ComprehensiveListing): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for specifications
    if (!listing.optimizedContent.productSpecifications || listing.optimizedContent.productSpecifications.length === 0) {
      issues.push({
        type: 'completeness',
        severity: 'warning',
        message: 'Missing product specifications',
        location: 'specifications',
        suggestion: 'Add detailed product specifications'
      });
    }

    // Check for care instructions
    if (!listing.optimizedContent.careInstructions) {
      issues.push({
        type: 'completeness',
        severity: 'suggestion',
        message: 'Missing care instructions',
        location: 'description',
        suggestion: 'Add care and maintenance instructions'
      });
    }

    // Check for package contents
    if (!listing.optimizedContent.packageContents || listing.optimizedContent.packageContents.length === 0) {
      issues.push({
        type: 'completeness',
        severity: 'suggestion',
        message: 'Missing package contents information',
        location: 'description',
        suggestion: 'List what is included in the package'
      });
    }

    // Check description length
    if (listing.optimizedContent.description.length < 500) {
      issues.push({
        type: 'completeness',
        severity: 'warning',
        message: 'Description is too short',
        location: 'description',
        suggestion: 'Expand description to at least 500 characters'
      });
    }

    return issues;
  }

  /**
   * Check structure of description
   */
  private checkStructure(description: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for paragraphs
    if (!description.includes('\n')) {
      issues.push({
        type: 'structure',
        severity: 'warning',
        message: 'Description lacks paragraph breaks',
        location: 'description',
        suggestion: 'Break content into clear paragraphs'
      });
    }

    // Check for bullet points
    if (!/[•\-\*]/.test(description)) {
      issues.push({
        type: 'structure',
        severity: 'suggestion',
        message: 'Description lacks bullet points',
        location: 'description',
        suggestion: 'Use bullet points to highlight key features'
      });
    }

    // Check for sections/headers
    const hasHeaders = /[A-Z\s]{5,}:/.test(description) || /\*\*[A-Z]/.test(description);
    if (!hasHeaders && description.length > 500) {
      issues.push({
        type: 'structure',
        severity: 'suggestion',
        message: 'Description lacks clear sections',
        location: 'description',
        suggestion: 'Add section headers to organize content'
      });
    }

    return issues;
  }

  /**
   * Check readability
   */
  private checkReadability(description: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Calculate average sentence length
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = description.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;

    if (avgWordsPerSentence > 25) {
      issues.push({
        type: 'readability',
        severity: 'warning',
        message: 'Sentences are too long on average',
        location: 'description',
        suggestion: 'Break long sentences into shorter ones (aim for 15-20 words per sentence)'
      });
    }

    // Check for very long paragraphs
    const paragraphs = description.split('\n\n');
    const longParagraphs = paragraphs.filter(p => p.length > 500);
    if (longParagraphs.length > 0) {
      issues.push({
        type: 'readability',
        severity: 'suggestion',
        message: 'Some paragraphs are too long',
        location: 'description',
        suggestion: 'Break long paragraphs into smaller chunks'
      });
    }

    return issues;
  }

  /**
   * Check mobile description format
   */
  private checkMobileDescriptionFormat(description: string): boolean {
    // Check for paragraph breaks
    const hasParagraphs = description.includes('\n');
    
    // Check for bullet points
    const hasBullets = /[•\-\*]/.test(description);
    
    // Check average paragraph length
    const paragraphs = description.split('\n\n');
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
    const reasonableLength = avgParagraphLength < 400;

    return hasParagraphs && hasBullets && reasonableLength;
  }

  /**
   * Calculate readability score (Flesch Reading Ease approximation)
   */
  private calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word (approximation)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      count--;
    }

    return Math.max(1, count);
  }

  /**
   * Calculate overall quality score
   */
  private async calculateOverallQualityScore(listing: ComprehensiveListing): Promise<number> {
    const qualityScore = await this.calculateQualityScore(listing);
    
    return Math.round(
      qualityScore.grammar * 0.25 +
      qualityScore.structure * 0.20 +
      qualityScore.completeness * 0.25 +
      qualityScore.readability * 0.15 +
      qualityScore.mobile * 0.15
    );
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(description: string): number {
    let score = 100;

    // Check for paragraphs
    if (!description.includes('\n')) score -= 20;

    // Check for bullet points
    if (!/[•\-\*]/.test(description)) score -= 20;

    // Check for sections
    const hasHeaders = /[A-Z\s]{5,}:/.test(description);
    if (!hasHeaders && description.length > 500) score -= 15;

    // Check for formatting
    const hasFormatting = /\*\*|__|\*|_/.test(description) || /<[a-z]+>/.test(description);
    if (!hasFormatting) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(listing: ComprehensiveListing): number {
    let score = 100;

    // Check specifications
    if (!listing.optimizedContent.productSpecifications || listing.optimizedContent.productSpecifications.length === 0) {
      score -= 25;
    }

    // Check care instructions
    if (!listing.optimizedContent.careInstructions) {
      score -= 15;
    }

    // Check package contents
    if (!listing.optimizedContent.packageContents || listing.optimizedContent.packageContents.length === 0) {
      score -= 15;
    }

    // Check description length
    if (listing.optimizedContent.description.length < 500) {
      score -= 20;
    } else if (listing.optimizedContent.description.length < 800) {
      score -= 10;
    }

    // Check tags
    if (listing.optimizedContent.tags.length < 5) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate professionalism score
   */
  private calculateProfessionalismScore(listing: ComprehensiveListing): number {
    let score = 100;
    const text = `${listing.optimizedContent.title} ${listing.optimizedContent.description}`.toLowerCase();

    // Check for informal language
    const informalWords = ['gonna', 'wanna', 'gotta', 'yeah', 'nope', 'yep'];
    for (const word of informalWords) {
      if (text.includes(word)) score -= 10;
    }

    // Check for excessive exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 3) score -= 15;

    // Check for all caps words (except acronyms)
    const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
    if (allCapsWords.length > 5) score -= 10;

    // Check for emojis (may be unprofessional on some platforms)
    if (/[\u{1F600}-\u{1F64F}]/u.test(text)) score -= 5;

    return Math.max(0, score);
  }
}

// Export singleton instance
export const qualityAssurance = new QualityAssuranceService();
