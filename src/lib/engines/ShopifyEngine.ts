/**
 * Shopify Platform Engine
 * Implements Google/Bing SEO optimization for Shopify stores
 */

import { BasePlatformEngine } from './BasePlatformEngine';
import {
  BaseContent,
  AlgorithmFactors,
  EnhancedPlatformRules,
  ProductSpecification
} from '@/types';

export class ShopifyEngine extends BasePlatformEngine {
  constructor() {
    super('shopify');
  }

  getPlatformRules(): EnhancedPlatformRules {
    return {
      name: 'Shopify',
      titleRange: { min: 40, max: 70 },  // For Google SERP display
      minDescription: 150,
      maxTags: 250,  // Shopify allows many tags
      tagFormat: 'comma-separated',
      guidelines: [
        'Optimize for Google search, not internal marketplace',
        'Keyword + Product Type + Brand format',
        'Write for humans first, search engines second',
        'Include primary keyword user would Google',
        'Focus on long-tail keywords (less competition)',
        'Mobile-friendly and fast-loading essential'
      ],
      algorithmFactors: this.getAlgorithmFactors(),
      prohibitedWords: [
        'best', 'top', 'premium', 'luxury', 'ultimate', 'perfect'
      ],
      requiredFields: ['title', 'description', 'metaTitle', 'metaDescription', 'urlHandle'],
      optionalFields: ['tags', 'productType', 'vendor', 'collections'],
      formatting: {
        titleFormat: 'Keyword + Product Type + Brand (if recognized)',
        descriptionFormat: 'Rich text editor, HTML formatting available',
        tagFormat: 'Descriptive tags: color-black, size-large, material-cotton',
        bulletPointFormat: 'Use rich text formatting for lists'
      },
      compliance: {
        contentRestrictions: [
          'No misleading claims',
          'Accurate product descriptions',
          'Clear pricing and shipping info',
          'Privacy policy required'
        ],
        categoryRestrictions: [
          'Age-restricted products need verification',
          'Regulated items need proper licensing',
          'Follow payment processor guidelines'
        ],
        imageRequirements: [
          'High-quality product photos',
          'Multiple angles recommended',
          'Lifestyle images boost conversion',
          'Optimized for web (compressed, WebP format)'
        ]
      }
    };
  }

  getAlgorithmFactors(): AlgorithmFactors {
    return {
      platform: 'shopify',
      rankingFactors: {
        keywordRelevance: 0.30,        // Google SEO focused
        titleOptimization: 0.25,
        descriptionQuality: 0.20,
        imageQuality: 0.10,
        priceCompetitiveness: 0.05,
        sellerPerformance: 0.05,
        customerReviews: 0.03,
        conversionRate: 0.02
      },
      optimizationWeights: {
        seoOptimization: 0.45,         // Highest for Google ranking
        userExperience: 0.30,
        mobileOptimization: 0.15,
        complianceAdherence: 0.10
      }
    };
  }

  protected async optimizeTitle(title: string, keywords: string[]): Promise<string> {
    let optimized = this.cleanTitle(title);
    const rules = this.getPlatformRules();
    optimized = this.removeProhibitedWords(optimized, rules.prohibitedWords);
    
    // Keep natural, readable format
    optimized = this.toTitleCase(optimized);
    
    // Optimize for Google SERP (70 chars)
    if (optimized.length > 70) {
      optimized = optimized.substring(0, 70).trim();
      optimized = optimized.substring(0, optimized.lastIndexOf(' '));
    }
    
    // Ensure primary keyword is included
    if (keywords.length > 0 && !optimized.toLowerCase().includes(keywords[0].toLowerCase())) {
      if (optimized.length + keywords[0].length + 3 <= 70) {
        optimized = `${keywords[0]} - ${optimized}`;
      }
    }
    
    return optimized;
  }

  protected async optimizeDescription(
    description: string,
    keywords: string[],
    specifications: ProductSpecification[]
  ): Promise<string> {
    let optimized = '';
    
    // SEO-optimized opening paragraph (include main keywords)
    optimized += this.createSEOOpeningParagraph(description, keywords);
    optimized += '\n\n';
    
    // Product benefits and features
    optimized += '**Key Features:**\n\n';
    const features = this.extractFeatures(description);
    features.forEach(feature => {
      optimized += `• ${feature}\n`;
    });
    optimized += '\n';
    
    // Specifications and details
    if (specifications.length > 0) {
      optimized += '**Specifications:**\n\n';
      specifications.forEach(spec => {
        optimized += `• **${spec.name}:** ${spec.value}${spec.unit ? ' ' + spec.unit : ''}\n`;
      });
      optimized += '\n';
    }
    
    // Use cases and applications
    optimized += '**Perfect For:**\n\n';
    optimized += '• Everyday use and special occasions\n';
    optimized += '• Home, office, and travel\n';
    optimized += '• Makes a great gift\n\n';
    
    // Care instructions
    optimized += '**Care Instructions:**\n\n';
    optimized += 'Easy to clean and maintain. Follow care guidelines for best results.\n\n';
    
    // Brand story (if applicable)
    optimized += '**Why Choose Us:**\n\n';
    optimized += 'We are committed to providing high-quality products with excellent customer service. Your satisfaction is our priority.';
    
    return optimized;
  }

  protected async generateTags(content: BaseContent): Promise<string[]> {
    const tags: string[] = [];
    
    // Product type tags
    if (content.category) {
      tags.push(content.category.toLowerCase());
    }
    
    // Descriptive attribute tags
    const text = `${content.title} ${content.description}`.toLowerCase();
    
    // Color tags
    const colors = ['black', 'white', 'blue', 'red', 'green', 'brown', 'gray', 'silver'];
    for (const color of colors) {
      if (text.includes(color)) {
        tags.push(`color-${color}`);
      }
    }
    
    // Material tags
    const materials = ['cotton', 'leather', 'metal', 'wood', 'plastic', 'glass'];
    for (const material of materials) {
      if (text.includes(material)) {
        tags.push(`material-${material}`);
      }
    }
    
    // Size tags (if applicable)
    const sizes = ['small', 'medium', 'large', 'xl', 'xxl'];
    for (const size of sizes) {
      if (text.includes(size)) {
        tags.push(`size-${size}`);
      }
    }
    
    // Feature tags
    if (text.includes('waterproof')) tags.push('waterproof');
    if (text.includes('wireless')) tags.push('wireless');
    if (text.includes('portable')) tags.push('portable');
    if (text.includes('eco-friendly')) tags.push('eco-friendly');
    
    // Use case tags
    tags.push('gift-idea', 'everyday-use', 'practical');
    
    return tags;
  }

  protected async generatePlatformSpecificElements(content: BaseContent): Promise<any> {
    return {
      metaTitle: await this.generateMetaTitle(content),
      metaDescription: await this.generateMetaDescription(content),
      urlHandle: this.generateURLHandle(content.title),
      productType: content.category || 'General',
      collections: this.suggestCollections(content)
    };
  }

  private async generateMetaTitle(content: BaseContent): Promise<string> {
    // 60-70 characters, include primary keyword
    let metaTitle = content.title;
    
    if (metaTitle.length > 70) {
      metaTitle = metaTitle.substring(0, 67) + '...';
    }
    
    return metaTitle;
  }

  private async generateMetaDescription(content: BaseContent): Promise<string> {
    // 155 characters, compelling with keyword
    const firstSentence = content.description.split(/[.!?]/)[0];
    let metaDesc = firstSentence;
    
    if (metaDesc.length > 155) {
      metaDesc = metaDesc.substring(0, 152) + '...';
    } else if (metaDesc.length < 120) {
      metaDesc += ' Shop now for fast shipping and great service.';
      if (metaDesc.length > 155) {
        metaDesc = metaDesc.substring(0, 152) + '...';
      }
    }
    
    return metaDesc;
  }

  private generateURLHandle(title: string): string {
    // Convert to URL-friendly slug
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  private suggestCollections(content: BaseContent): string[] {
    const collections: string[] = [];
    const text = `${content.title} ${content.description}`.toLowerCase();
    
    // Category-based collections
    if (content.category) {
      collections.push(content.category);
    }
    
    // Feature-based collections
    if (text.includes('new')) collections.push('New Arrivals');
    if (text.includes('sale') || text.includes('discount')) collections.push('Sale');
    if (text.includes('gift')) collections.push('Gift Ideas');
    
    // Season-based collections
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) collections.push('Spring Collection');
    else if (month >= 5 && month <= 7) collections.push('Summer Collection');
    else if (month >= 8 && month <= 10) collections.push('Fall Collection');
    else collections.push('Winter Collection');
    
    return collections;
  }

  private createSEOOpeningParagraph(description: string, keywords: string[]): string {
    const firstSentence = description.split(/[.!?]/)[0];
    let opening = firstSentence + '.';
    
    // Try to naturally include primary keyword if not present
    if (keywords.length > 0 && !opening.toLowerCase().includes(keywords[0].toLowerCase())) {
      opening += ` This ${keywords[0]} is designed for optimal performance and satisfaction.`;
    }
    
    return opening;
  }

  private extractFeatures(description: string): string[] {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private toTitleCase(text: string): string {
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}
