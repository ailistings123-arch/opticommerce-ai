/**
 * SEO Optimizer Service
 * Advanced keyword research, integration, and search ranking optimization
 */

import {
  Platform,
  ProductInfo,
  KeywordSet,
  BaseContent,
  KeywordOptimizedContent,
  OptimizedContent,
  SEOScore,
  CompetitorKeywords
} from '@/types';

export class SEOOptimizerService {
  /**
   * Research keywords for product
   */
  async researchKeywords(productInfo: ProductInfo, platform: Platform): Promise<KeywordSet> {
    const primary: string[] = [];
    const secondary: string[] = [];
    const longTail: string[] = [];
    const synonyms: string[] = [];
    const competitors: string[] = [];

    // Extract primary keywords from title
    const titleWords = this.extractSignificantWords(productInfo.title);
    primary.push(...titleWords.slice(0, 3));

    // Extract secondary keywords from description
    const descWords = this.extractSignificantWords(productInfo.description);
    secondary.push(...descWords.slice(0, 5));

    // Generate long-tail keywords (3-5 word phrases)
    longTail.push(...this.generateLongTailKeywords(productInfo));

    // Generate synonyms
    synonyms.push(...this.generateSynonyms(primary));

    // Platform-specific keyword adjustments
    const platformKeywords = this.getPlatformSpecificKeywords(productInfo, platform);
    secondary.push(...platformKeywords);

    // Remove duplicates
    return {
      primary: [...new Set(primary)],
      secondary: [...new Set(secondary)],
      longTail: [...new Set(longTail)],
      synonyms: [...new Set(synonyms)],
      competitors: [...new Set(competitors)]
    };
  }

  /**
   * Integrate keywords naturally into content
   */
  async integrateKeywords(content: BaseContent, keywords: KeywordSet): Promise<KeywordOptimizedContent> {
    let optimizedTitle = content.title;
    let optimizedDescription = content.description;

    // Integrate primary keywords into title if not present
    for (const keyword of keywords.primary.slice(0, 2)) {
      if (!optimizedTitle.toLowerCase().includes(keyword.toLowerCase())) {
        if (optimizedTitle.length + keyword.length + 3 < 200) {
          optimizedTitle += ` ${keyword}`;
        }
      }
    }

    // Integrate keywords naturally into description
    const missingKeywords = [
      ...keywords.primary,
      ...keywords.secondary.slice(0, 3),
      ...keywords.longTail.slice(0, 2)
    ].filter(k => !optimizedDescription.toLowerCase().includes(k.toLowerCase()));

    for (const keyword of missingKeywords.slice(0, 5)) {
      // Add keyword in a natural sentence
      optimizedDescription += ` This ${keyword} provides excellent value and performance.`;
    }

    // Calculate keyword density
    const keywordDensity = this.calculateKeywordDensity(optimizedDescription, keywords);

    return {
      ...content,
      optimizedTitle,
      optimizedDescription,
      integratedKeywords: keywords,
      keywordDensity
    };
  }

  /**
   * Calculate SEO score for content
   */
  async calculateSEOScore(content: OptimizedContent, platform: Platform): Promise<SEOScore> {
    const scores = {
      overall: 0,
      keywordRelevance: 0,
      titleOptimization: 0,
      descriptionQuality: 0,
      tagEffectiveness: 0,
      mobileOptimization: 0
    };

    // Keyword Relevance (0-100)
    scores.keywordRelevance = this.scoreKeywordRelevance(content);

    // Title Optimization (0-100)
    scores.titleOptimization = this.scoreTitleOptimization(content.title, platform);

    // Description Quality (0-100)
    scores.descriptionQuality = this.scoreDescriptionQuality(content.description);

    // Tag Effectiveness (0-100)
    scores.tagEffectiveness = this.scoreTagEffectiveness(content.tags);

    // Mobile Optimization (0-100)
    scores.mobileOptimization = this.scoreMobileOptimization(content);

    // Calculate overall score (weighted average)
    scores.overall = Math.round(
      scores.keywordRelevance * 0.30 +
      scores.titleOptimization * 0.25 +
      scores.descriptionQuality * 0.20 +
      scores.tagEffectiveness * 0.15 +
      scores.mobileOptimization * 0.10
    );

    return scores;
  }

  /**
   * Generate backend search terms for platforms that support them
   */
  async generateBackendSearchTerms(keywords: KeywordSet, platform: Platform): Promise<string[]> {
    const terms: Set<string> = new Set();

    // Add all keyword types
    keywords.primary.forEach(k => terms.add(k.toLowerCase()));
    keywords.secondary.forEach(k => terms.add(k.toLowerCase()));
    keywords.synonyms.forEach(k => terms.add(k.toLowerCase()));

    // Add variations
    Array.from(terms).forEach(term => {
      // Add plural forms
      if (!term.endsWith('s')) {
        terms.add(term + 's');
      }
      // Add singular forms
      if (term.endsWith('s') && term.length > 3) {
        terms.add(term.slice(0, -1));
      }
    });

    // Platform-specific limits
    const termsArray = Array.from(terms);
    
    if (platform === 'amazon') {
      // Amazon: 249 bytes max
      const joined = termsArray.join(' ');
      if (joined.length > 249) {
        let truncated = '';
        for (const term of termsArray) {
          if ((truncated + ' ' + term).length <= 249) {
            truncated += (truncated ? ' ' : '') + term;
          } else {
            break;
          }
        }
        return truncated.split(' ');
      }
    }

    return termsArray.slice(0, 50); // Reasonable limit
  }

  /**
   * Analyze competitor keywords
   */
  async analyzeCompetitorKeywords(productCategory: string, platform: Platform): Promise<CompetitorKeywords> {
    // This would typically call an external API or database
    // For now, return mock data based on category
    const keywords = this.getCommonKeywordsForCategory(productCategory);
    
    return {
      platform,
      keywords,
      frequency: this.generateFrequencyMap(keywords),
      trends: this.generateTrendMap(keywords)
    };
  }

  /**
   * Extract significant words from text
   */
  private extractSignificantWords(text: string): string[] {
    const commonWords = [
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been',
      'your', 'their', 'what', 'which', 'when', 'where', 'who', 'how', 'will',
      'can', 'are', 'was', 'were', 'been', 'has', 'had', 'does', 'did'
    ];

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !commonWords.includes(word) &&
        /^[a-z]+$/.test(word)
      );
  }

  /**
   * Generate long-tail keywords
   */
  private generateLongTailKeywords(productInfo: ProductInfo): string[] {
    const longTail: string[] = [];
    const words = this.extractSignificantWords(`${productInfo.title} ${productInfo.description}`);

    // Generate 3-word combinations
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase.length <= 50) {
        longTail.push(phrase);
      }
    }

    // Add category-based long-tail
    if (productInfo.category) {
      longTail.push(`${productInfo.category} for sale`);
      longTail.push(`best ${productInfo.category}`);
      longTail.push(`${productInfo.category} online`);
    }

    return longTail.slice(0, 10);
  }

  /**
   * Generate synonyms for keywords
   */
  private generateSynonyms(keywords: string[]): string[] {
    const synonymMap: Record<string, string[]> = {
      'bottle': ['flask', 'container', 'vessel', 'canteen'],
      'case': ['cover', 'protector', 'shell', 'sleeve'],
      'bag': ['tote', 'carrier', 'sack', 'pouch'],
      'mug': ['cup', 'tumbler', 'glass', 'beaker'],
      'wallet': ['billfold', 'purse', 'holder', 'organizer'],
      'phone': ['mobile', 'smartphone', 'cell', 'device'],
      'laptop': ['notebook', 'computer', 'pc', 'macbook'],
      'watch': ['timepiece', 'wristwatch', 'chronograph'],
      'headphone': ['earphone', 'earbud', 'headset'],
      'charger': ['adapter', 'power supply', 'charging cable']
    };

    const synonyms: string[] = [];
    
    for (const keyword of keywords) {
      const lower = keyword.toLowerCase();
      for (const [word, syns] of Object.entries(synonymMap)) {
        if (lower.includes(word)) {
          synonyms.push(...syns);
        }
      }
    }

    return synonyms;
  }

  /**
   * Get platform-specific keywords
   */
  private getPlatformSpecificKeywords(productInfo: ProductInfo, platform: Platform): string[] {
    const keywords: string[] = [];

    switch (platform) {
      case 'amazon':
        keywords.push('prime eligible', 'fast shipping', 'amazon choice');
        break;
      case 'etsy':
        keywords.push('handmade', 'custom', 'personalized', 'unique gift');
        break;
      case 'ebay':
        keywords.push('free shipping', 'best offer', 'buy it now');
        break;
      case 'shopify':
        keywords.push('online store', 'shop now', 'free delivery');
        break;
      case 'walmart':
        keywords.push('everyday low price', 'value', 'quality');
        break;
    }

    return keywords;
  }

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(text: string, keywords: KeywordSet): Record<string, number> {
    const density: Record<string, number> = {};
    const lowerText = text.toLowerCase();
    const totalWords = text.split(/\s+/).length;

    const allKeywords = [
      ...keywords.primary,
      ...keywords.secondary,
      ...keywords.longTail
    ];

    for (const keyword of allKeywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      const matches = lowerText.match(regex);
      const count = matches ? matches.length : 0;
      density[keyword] = (count / totalWords) * 100;
    }

    return density;
  }

  /**
   * Score keyword relevance
   */
  private scoreKeywordRelevance(content: OptimizedContent): number {
    let score = 0;
    const text = `${content.title} ${content.description}`.toLowerCase();

    // Check if keywords are present
    const keywordCount = content.keywords.filter(k => 
      text.includes(k.toLowerCase())
    ).length;

    score = (keywordCount / Math.max(content.keywords.length, 1)) * 100;

    return Math.min(100, score);
  }

  /**
   * Score title optimization
   */
  private scoreTitleOptimization(title: string, platform: Platform): number {
    let score = 100;

    // Check length
    const optimalLengths: Record<Platform, { min: number; max: number }> = {
      amazon: { min: 80, max: 200 },
      ebay: { min: 40, max: 80 },
      etsy: { min: 60, max: 140 },
      shopify: { min: 40, max: 70 },
      walmart: { min: 40, max: 75 },
      woocommerce: { min: 50, max: 120 }
    };

    const optimal = optimalLengths[platform];
    if (title.length < optimal.min) {
      score -= 20;
    } else if (title.length > optimal.max) {
      score -= 30;
    }

    // Check for numbers (specifications)
    if (!/\d/.test(title)) {
      score -= 10;
    }

    // Check for capital letters (proper formatting)
    if (title === title.toUpperCase() && platform !== 'ebay') {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Score description quality
   */
  private scoreDescriptionQuality(description: string): number {
    let score = 0;

    // Length score (0-40 points)
    if (description.length >= 800) {
      score += 40;
    } else if (description.length >= 400) {
      score += 30;
    } else if (description.length >= 200) {
      score += 20;
    } else {
      score += 10;
    }

    // Structure score (0-30 points)
    if (description.includes('\n')) score += 10; // Has paragraphs
    if (/[•\-\*]/.test(description)) score += 10; // Has bullet points
    if (/\d+/.test(description)) score += 10; // Has specifications

    // Readability score (0-30 points)
    const sentences = description.split(/[.!?]+/).length;
    const words = description.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
      score += 30; // Optimal readability
    } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
      score += 20;
    } else {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Score tag effectiveness
   */
  private scoreTagEffectiveness(tags: string[]): number {
    let score = 0;

    // Quantity score (0-40 points)
    if (tags.length >= 7) {
      score += 40;
    } else if (tags.length >= 5) {
      score += 30;
    } else if (tags.length >= 3) {
      score += 20;
    } else {
      score += 10;
    }

    // Quality score (0-60 points)
    const avgLength = tags.reduce((sum, tag) => sum + tag.length, 0) / tags.length;
    if (avgLength >= 5 && avgLength <= 15) {
      score += 30; // Optimal tag length
    } else {
      score += 15;
    }

    // Check for multi-word tags (better for long-tail)
    const multiWordTags = tags.filter(t => t.includes(' ') || t.includes('-')).length;
    score += Math.min(30, multiWordTags * 10);

    return Math.min(100, score);
  }

  /**
   * Score mobile optimization
   */
  private scoreMobileOptimization(content: OptimizedContent): number {
    let score = 100;

    // Title mobile-friendliness
    if (content.title.length > 80) {
      score -= 20; // First 80 chars critical for mobile
    }

    // Description formatting
    const paragraphs = content.description.split('\n\n');
    if (paragraphs.length < 3) {
      score -= 15; // Need clear sections for mobile
    }

    // Check for long paragraphs (hard to read on mobile)
    const longParagraphs = paragraphs.filter(p => p.length > 500).length;
    score -= longParagraphs * 10;

    return Math.max(0, score);
  }

  /**
   * Get common keywords for category
   */
  private getCommonKeywordsForCategory(category: string): string[] {
    const categoryKeywords: Record<string, string[]> = {
      'electronics': ['wireless', 'bluetooth', 'rechargeable', 'portable', 'smart'],
      'clothing': ['comfortable', 'stylish', 'durable', 'breathable', 'fashionable'],
      'home': ['modern', 'decorative', 'functional', 'space-saving', 'elegant'],
      'kitchen': ['stainless steel', 'dishwasher safe', 'non-stick', 'durable', 'easy clean'],
      'accessories': ['versatile', 'compact', 'lightweight', 'practical', 'stylish']
    };

    const lowerCategory = category.toLowerCase();
    for (const [key, keywords] of Object.entries(categoryKeywords)) {
      if (lowerCategory.includes(key)) {
        return keywords;
      }
    }

    return ['quality', 'durable', 'practical', 'affordable', 'reliable'];
  }

  /**
   * Generate frequency map for keywords
   */
  private generateFrequencyMap(keywords: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    keywords.forEach((keyword, index) => {
      frequency[keyword] = Math.max(10, 100 - index * 5);
    });
    return frequency;
  }

  /**
   * Generate trend map for keywords
   */
  private generateTrendMap(keywords: string[]): Record<string, number> {
    const trends: Record<string, number> = {};
    keywords.forEach((keyword, index) => {
      trends[keyword] = Math.random() > 0.5 ? 1 : -1; // Trending up or down
    });
    return trends;
  }
}

// Export singleton instance
export const seoOptimizer = new SEOOptimizerService();
