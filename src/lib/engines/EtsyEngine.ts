/**
 * Etsy Platform Engine
 * Implements Etsy's relevance and quality score algorithm
 */

import { BasePlatformEngine } from './BasePlatformEngine';
import {
  BaseContent,
  AlgorithmFactors,
  EnhancedPlatformRules,
  ProductSpecification
} from '@/types';

export class EtsyEngine extends BasePlatformEngine {
  constructor() {
    super('etsy');
  }

  getPlatformRules(): EnhancedPlatformRules {
    return {
      name: 'Etsy',
      titleRange: { min: 60, max: 140 },
      minDescription: 800,
      maxTags: 13,
      tagFormat: 'multi-word-phrases',
      guidelines: [
        'Descriptive, keyword-rich, natural language',
        'Primary Keyword + Descriptive Details + Use Case + Style/Theme',
        'Front-load primary keywords but keep readable',
        'Conversational search terms (how people actually search)',
        'Emphasize handmade, vintage, or craft supply nature',
        'Personal, authentic descriptions valued'
      ],
      algorithmFactors: this.getAlgorithmFactors(),
      prohibitedWords: [
        'best', 'top', 'premium', 'luxury', 'ultimate', 'perfect'
      ],
      requiredFields: ['title', 'description', 'tags', 'category', 'materials'],
      optionalFields: ['occasion', 'recipient', 'style', 'color', 'size'],
      formatting: {
        titleFormat: 'Primary Keyword + Descriptive Details + Use Case + Style/Theme',
        descriptionFormat: 'Plain text (no HTML), use spacing for readability',
        tagFormat: '13 tags, 20 chars each, multi-word allowed',
        bulletPointFormat: 'Use line breaks and spacing, not HTML'
      },
      compliance: {
        contentRestrictions: [
          'Must be handmade, vintage (20+ years), or craft supplies',
          'No reselling manufactured goods unless you designed them',
          'Disclose production partners if manufactured',
          'Use inclusive, respectful language'
        ],
        categoryRestrictions: [
          'No replicas or counterfeits',
          'No recalled items',
          'No weapons or drugs',
          'Specify processing time clearly'
        ],
        imageRequirements: [
          'Show actual item or representative sample',
          'Multiple angles recommended',
          'Lifestyle photos encouraged',
          'Show scale and details'
        ]
      }
    };
  }

  getAlgorithmFactors(): AlgorithmFactors {
    return {
      platform: 'etsy',
      rankingFactors: {
        keywordRelevance: 0.25,
        titleOptimization: 0.20,
        descriptionQuality: 0.15,
        imageQuality: 0.10,
        priceCompetitiveness: 0.05,
        sellerPerformance: 0.10,
        customerReviews: 0.10,        // Higher for Etsy
        conversionRate: 0.05
      },
      optimizationWeights: {
        seoOptimization: 0.30,
        userExperience: 0.35,          // Higher for Etsy
        mobileOptimization: 0.20,
        complianceAdherence: 0.15
      }
    };
  }

  protected async optimizeTitle(title: string, keywords: string[]): Promise<string> {
    let optimized = this.cleanTitle(title);
    const rules = this.getPlatformRules();
    optimized = this.removeProhibitedWords(optimized, rules.prohibitedWords);
    
    // Etsy prefers sentence case or title case (natural)
    optimized = this.toSentenceCase(optimized);
    
    // Add pipe separators for readability
    if (!optimized.includes('|') && optimized.length < 120) {
      const parts = optimized.split(/\s-\s/);
      if (parts.length > 1) {
        optimized = parts.join(' | ');
      }
    }
    
    // Ensure within 140 character limit
    if (optimized.length > 140) {
      optimized = optimized.substring(0, 140).trim();
      optimized = optimized.substring(0, optimized.lastIndexOf(' '));
    }
    
    return optimized;
  }

  protected async optimizeDescription(
    description: string,
    keywords: string[],
    specifications: ProductSpecification[]
  ): Promise<string> {
    let optimized = '';
    
    // Opening statement (first 160 chars are SEO critical)
    optimized += this.createOpeningStatement(description);
    optimized += '\n\n';
    
    // Materials and craftsmanship
    optimized += '✨ MATERIALS & CRAFTSMANSHIP:\n';
    optimized += this.extractMaterialsInfo(description);
    optimized += '\n\n';
    
    // Dimensions and specifications
    if (specifications.length > 0) {
      optimized += '📏 DIMENSIONS & SPECIFICATIONS:\n';
      specifications.forEach(spec => {
        optimized += `• ${spec.name}: ${spec.value}${spec.unit ? ' ' + spec.unit : ''}\n`;
      });
      optimized += '\n';
    }
    
    // Customization options
    optimized += '🎨 CUSTOMIZATION:\n';
    optimized += 'This item can be personalized to make it uniquely yours. Please message me with your customization requests.\n\n';
    
    // Care instructions
    optimized += '🧼 CARE INSTRUCTIONS:\n';
    optimized += this.generateCareInstructions(description);
    optimized += '\n\n';
    
    // Production and shipping
    optimized += '📦 PRODUCTION & SHIPPING:\n';
    optimized += 'Each item is made to order with care. Processing time: 3-5 business days. Shipping time varies by location.\n\n';
    
    // Story/personal touch
    optimized += '💝 ABOUT THIS ITEM:\n';
    optimized += 'Handcrafted with attention to detail, this piece is perfect for those who appreciate quality and uniqueness. Makes a thoughtful gift for any occasion.\n\n';
    
    // Shop policies reminder
    optimized += 'Please review shop policies for returns and exchanges. Feel free to message with any questions!';
    
    return optimized;
  }

  protected async generateTags(content: BaseContent): Promise<string[]> {
    const tags: string[] = [];
    
    // Extract multi-word phrases from title
    const titlePhrases = this.extractPhrases(content.title);
    tags.push(...titlePhrases.slice(0, 5));
    
    // Add category-based tags
    if (content.category) {
      tags.push(content.category.toLowerCase());
    }
    
    // Add material tags
    const materials = this.extractMaterials(content.description);
    tags.push(...materials.slice(0, 2));
    
    // Add use case tags
    tags.push('gift idea', 'handmade', 'unique gift');
    
    // Add style tags
    const styles = ['boho', 'modern', 'rustic', 'vintage', 'minimalist'];
    const text = `${content.title} ${content.description}`.toLowerCase();
    for (const style of styles) {
      if (text.includes(style) && tags.length < 13) {
        tags.push(style);
      }
    }
    
    // Ensure all tags are under 20 characters and we have exactly 13
    const validTags = tags
      .filter(t => t.length <= 20)
      .slice(0, 13);
    
    // Fill remaining slots with generic tags
    while (validTags.length < 13) {
      const fillers = ['home decor', 'gift for her', 'gift for him', 'birthday gift', 'custom made'];
      const filler = fillers[validTags.length % fillers.length];
      if (!validTags.includes(filler)) {
        validTags.push(filler);
      }
    }
    
    return validTags;
  }

  protected async generatePlatformSpecificElements(content: BaseContent): Promise<any> {
    return {
      attributes: {
        primaryColor: this.extractColor(content.title, content.description),
        occasion: 'Any Occasion',
        recipient: 'Anyone',
        style: this.extractStyle(content.title, content.description)
      }
    };
  }

  private toSentenceCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      .replace(/\.\s+([a-z])/g, (match, p1) => '. ' + p1.toUpperCase());
  }

  private createOpeningStatement(description: string): string {
    const firstSentence = description.split(/[.!?]/)[0];
    if (firstSentence.length > 160) {
      return firstSentence.substring(0, 157) + '...';
    }
    return firstSentence + '.';
  }

  private extractMaterialsInfo(description: string): string {
    const materials = ['leather', 'wood', 'metal', 'ceramic', 'cotton', 'silk', 'wool'];
    const text = description.toLowerCase();
    
    for (const material of materials) {
      if (text.includes(material)) {
        return `Crafted from high-quality ${material} with careful attention to detail. Each piece is unique and made with love.`;
      }
    }
    
    return 'Made with carefully selected materials to ensure quality and durability.';
  }

  private generateCareInstructions(description: string): string {
    return 'Handle with care. Clean gently as needed. Store in a cool, dry place when not in use.';
  }

  private extractPhrases(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length <= 20 && !this.isCommonPhrase(phrase)) {
        phrases.push(phrase);
      }
    }
    
    return phrases;
  }

  private extractMaterials(text: string): string[] {
    const materials = ['leather', 'wood', 'metal', 'ceramic', 'cotton', 'silk', 'wool', 'glass', 'stone'];
    const found: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const material of materials) {
      if (lowerText.includes(material)) {
        found.push(material);
      }
    }
    
    return found;
  }

  private extractColor(title: string, description: string): string {
    const colors = ['black', 'white', 'blue', 'red', 'green', 'brown', 'gray', 'silver', 'gold', 'pink'];
    const text = `${title} ${description}`.toLowerCase();
    
    for (const color of colors) {
      if (text.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    
    return 'Multi-color';
  }

  private extractStyle(title: string, description: string): string {
    const styles = ['boho', 'modern', 'rustic', 'vintage', 'minimalist', 'classic', 'contemporary'];
    const text = `${title} ${description}`.toLowerCase();
    
    for (const style of styles) {
      if (text.includes(style)) {
        return style.charAt(0).toUpperCase() + style.slice(1);
      }
    }
    
    return 'Classic';
  }

  private isCommonPhrase(phrase: string): boolean {
    const common = ['the the', 'and and', 'for for', 'with with', 'this this'];
    return common.includes(phrase);
  }
}
