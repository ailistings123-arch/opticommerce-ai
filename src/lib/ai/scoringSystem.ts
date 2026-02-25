/**
 * Scoring System
 * Evaluates listing quality based on training data standards
 */

import { AIGenerationResponse } from './types';
import { Platform } from '@/types';
import { TrainingContext } from './trainingContext';

export interface QualityScore {
  total: number;
  maxScore: number;
  percentage: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  breakdown: {
    title: TitleScore;
    bullets: BulletsScore;
    description: DescriptionScore;
    compliance: ComplianceScore;
  };
  recommendations: string[];
}

export interface TitleScore {
  score: number;
  maxScore: number;
  characterUtilization: number;
  keywordPlacement: boolean;
  readability: boolean;
}

export interface BulletsScore {
  score: number;
  maxScore: number;
  benefitFirst: number;
  specificity: number;
  optimalLength: number;
}

export interface DescriptionScore {
  score: number;
  maxScore: number;
  meetsMinLength: boolean;
  hasStructure: boolean;
  seoOptimized: boolean;
}

export interface ComplianceScore {
  score: number;
  maxScore: number;
  noProhibitedWords: boolean;
  followsPlatformRules: boolean;
  violations: string[];
}

export class ScoringSystem {
  /**
   * Calculate comprehensive quality score
   */
  static calculateScore(
    response: AIGenerationResponse,
    platform: Platform,
    platformRules: any
  ): QualityScore {
    const titleScore = this.scoreTitleQuality(response.title, platform, platformRules);
    const bulletsScore = this.scoreBulletsQuality(response.bullets);
    const descriptionScore = this.scoreDescriptionQuality(response.description, platformRules);
    const complianceScore = this.scoreCompliance(response, platformRules);

    const total = titleScore.score + bulletsScore.score + descriptionScore.score + complianceScore.score;
    const maxScore = titleScore.maxScore + bulletsScore.maxScore + descriptionScore.maxScore + complianceScore.maxScore;
    const percentage = Math.round((total / maxScore) * 100);

    const grade = this.determineGrade(percentage);
    const recommendations = this.generateRecommendations(titleScore, bulletsScore, descriptionScore, complianceScore);

    return {
      total,
      maxScore,
      percentage,
      grade,
      breakdown: {
        title: titleScore,
        bullets: bulletsScore,
        description: descriptionScore,
        compliance: complianceScore
      },
      recommendations
    };
  }

  /**
   * Score title quality
   */
  private static scoreTitleQuality(title: string, platform: Platform, rules: any): TitleScore {
    let score = 0;
    const maxScore = 30;

    // Character utilization (10 points)
    const utilization = (title.length / rules.titleRange.max) * 100;
    const utilizationScore = utilization >= 90 ? 10 : utilization >= 80 ? 8 : utilization >= 70 ? 6 : utilization >= 60 ? 4 : 2;
    score += utilizationScore;

    // Keyword placement (10 points) - check if important words are front-loaded
    const first50Chars = title.substring(0, 50);
    const hasKeywordInFirst50 = /\b[A-Z][a-z]+\b/.test(first50Chars); // Simple check for capitalized words
    const keywordPlacement = hasKeywordInFirst50;
    score += keywordPlacement ? 10 : 5;

    // Readability (10 points) - natural flow, no keyword stuffing
    const words = title.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const repetitionRatio = uniqueWords.size / words.length;
    const readability = repetitionRatio > 0.7; // Less than 30% repetition
    score += readability ? 10 : 5;

    return {
      score,
      maxScore,
      characterUtilization: utilization,
      keywordPlacement,
      readability
    };
  }

  /**
   * Score bullets quality
   */
  private static scoreBulletsQuality(bullets: string[]): BulletsScore {
    let score = 0;
    const maxScore = 30;

    if (bullets.length === 0) {
      return { score: 0, maxScore, benefitFirst: 0, specificity: 0, optimalLength: 0 };
    }

    // Benefit-first structure (10 points)
    const benefitFirstPattern = /^[A-Z\s]+ - /; // Checks for "BENEFIT - " pattern
    const benefitFirstCount = bullets.filter(b => benefitFirstPattern.test(b)).length;
    const benefitFirstRatio = benefitFirstCount / bullets.length;
    const benefitFirstScore = benefitFirstRatio >= 0.8 ? 10 : benefitFirstRatio >= 0.6 ? 8 : benefitFirstRatio >= 0.4 ? 5 : 2;
    score += benefitFirstScore;

    // Specificity (10 points) - includes numbers, dimensions, materials
    const specificityPattern = /\d+|inch|cm|mm|oz|lb|kg|cotton|steel|plastic|aluminum|wood/i;
    const specificCount = bullets.filter(b => specificityPattern.test(b)).length;
    const specificityRatio = specificCount / bullets.length;
    const specificityScore = specificityRatio >= 0.6 ? 10 : specificityRatio >= 0.4 ? 7 : specificityRatio >= 0.2 ? 4 : 2;
    score += specificityScore;

    // Optimal length (10 points) - 50-150 characters per bullet
    const optimalLengthCount = bullets.filter(b => b.length >= 50 && b.length <= 150).length;
    const lengthRatio = optimalLengthCount / bullets.length;
    const lengthScore = lengthRatio >= 0.8 ? 10 : lengthRatio >= 0.6 ? 7 : lengthRatio >= 0.4 ? 4 : 2;
    score += lengthScore;

    return {
      score,
      maxScore,
      benefitFirst: benefitFirstRatio,
      specificity: specificityRatio,
      optimalLength: lengthRatio
    };
  }

  /**
   * Score description quality
   */
  private static scoreDescriptionQuality(description: string, rules: any): DescriptionScore {
    let score = 0;
    const maxScore = 30;

    // Meets minimum length (10 points)
    const meetsMinLength = description.length >= rules.minDescription;
    score += meetsMinLength ? 10 : 5;

    // Has clear structure (10 points) - multiple paragraphs or sections
    const paragraphs = description.split(/\n\n+/).filter(p => p.trim().length > 0);
    const hasStructure = paragraphs.length >= 2;
    score += hasStructure ? 10 : 5;

    // SEO optimized (10 points) - natural keyword integration
    const words = description.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const repetitionRatio = uniqueWords.size / words.length;
    const seoOptimized = repetitionRatio > 0.6; // Good keyword variety
    score += seoOptimized ? 10 : 5;

    return {
      score,
      maxScore,
      meetsMinLength,
      hasStructure,
      seoOptimized
    };
  }

  /**
   * Score compliance
   */
  private static scoreCompliance(response: AIGenerationResponse, rules: any): ComplianceScore {
    let score = 0;
    const maxScore = 10;
    const violations: string[] = [];

    // Check for prohibited words (5 points)
    const allText = `${response.title} ${response.description} ${response.bullets.join(' ')}`.toLowerCase();
    const prohibitedWords = TrainingContext.PROHIBITED_WORDS;
    
    let hasProhibitedWords = false;
    prohibitedWords.forEach(word => {
      const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
      if (regex.test(allText)) {
        hasProhibitedWords = true;
        violations.push(`Contains prohibited word: "${word}"`);
      }
    });

    const noProhibitedWords = !hasProhibitedWords;
    score += noProhibitedWords ? 5 : 0;

    // Follows platform rules (5 points)
    const titleInRange = response.title.length >= rules.titleRange.min && response.title.length <= rules.titleRange.max;
    const descriptionMeetsMin = response.description.length >= rules.minDescription;
    const keywordsInLimit = response.keywords.length <= rules.maxTags;

    const followsPlatformRules = titleInRange && descriptionMeetsMin && keywordsInLimit;
    score += followsPlatformRules ? 5 : 3;

    if (!titleInRange) violations.push('Title length out of range');
    if (!descriptionMeetsMin) violations.push('Description too short');
    if (!keywordsInLimit) violations.push('Too many keywords');

    return {
      score,
      maxScore,
      noProhibitedWords,
      followsPlatformRules,
      violations
    };
  }

  /**
   * Determine grade based on percentage
   */
  private static determineGrade(percentage: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Poor';
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    title: TitleScore,
    bullets: BulletsScore,
    description: DescriptionScore,
    compliance: ComplianceScore
  ): string[] {
    const recommendations: string[] = [];

    // Title recommendations
    if (title.characterUtilization < 90) {
      recommendations.push(`Increase title length to 90-100% of limit (currently ${Math.round(title.characterUtilization)}%)`);
    }
    if (!title.keywordPlacement) {
      recommendations.push('Front-load primary keywords in first 50 characters');
    }
    if (!title.readability) {
      recommendations.push('Improve title readability - reduce keyword repetition');
    }

    // Bullets recommendations
    if (bullets.benefitFirst < 0.8) {
      recommendations.push('Use BENEFIT-FIRST structure: "BENEFIT - Feature with details"');
    }
    if (bullets.specificity < 0.6) {
      recommendations.push('Add specific details: numbers, dimensions, materials');
    }
    if (bullets.optimalLength < 0.8) {
      recommendations.push('Optimize bullet length to 50-150 characters each');
    }

    // Description recommendations
    if (!description.meetsMinLength) {
      recommendations.push('Expand description to meet minimum length requirement');
    }
    if (!description.hasStructure) {
      recommendations.push('Add clear structure with multiple paragraphs or sections');
    }
    if (!description.seoOptimized) {
      recommendations.push('Improve keyword variety and natural integration');
    }

    // Compliance recommendations
    if (compliance.violations.length > 0) {
      recommendations.push(...compliance.violations.map(v => `Fix: ${v}`));
    }

    return recommendations;
  }
}
