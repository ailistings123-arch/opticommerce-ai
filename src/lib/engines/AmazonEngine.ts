/**
 * Amazon Platform Engine
 * Implements A9/A10 algorithm optimization for Amazon marketplace
 */

import { BasePlatformEngine } from './BasePlatformEngine';
import {
  BaseContent,
  AlgorithmFactors,
  EnhancedPlatformRules,
  ProductSpecification
} from '@/types';

export class AmazonEngine extends BasePlatformEngine {
  constructor() {
    super('amazon');
  }

  getPlatformRules(): EnhancedPlatformRules {
    return {
      name: 'Amazon',
      titleRange: { min: 80, max: 200 },
      minDescription: 2000,
      maxTags: 10,
      tagFormat: 'lowercase-hyphenated',
      guidelines: [
        'Front-load important keywords in first 80 characters',
        'Use Title Case capitalization',
        'Include brand, key features, product type, size, and color',
        'No promotional language (Best, #1, Top Rated)',
        'No seller information or special characters',
        'Optimize for mobile display (first 60-80 chars visible)'
      ],
      algorithmFactors: this.getAlgorithmFactors(),
      prohibitedWords: [
        'best', 'top', '#1', 'premium', 'luxury', 'ultimate', 'amazing',
        'awesome', 'great', 'excellent', 'perfect', 'guaranteed', 'free shipping',
        'sale', 'discount', 'cheap', 'deal', 'offer', 'promotion'
      ],
      requiredFields: ['title', 'description', 'bulletPoints', 'backendSearchTerms'],
      optionalFields: ['brand', 'manufacturer', 'model', 'partNumber'],
      formatting: {
        titleFormat: 'Brand + Key Features + Product Type + Size/Quantity + Color',
        descriptionFormat: 'HTML allowed: <b>, <br>, <p>, <ul>, <li>',
        tagFormat: 'Backend search terms: 249 bytes max',
        bulletPointFormat: 'ALL CAPS FEATURE: Description with benefits (200-250 chars optimal)'
      },
      compliance: {
        contentRestrictions: [
          'No external links',
          'No contact information',
          'No promotional language',
          'No warranty details in certain categories',
          'No medical claims without FDA approval'
        ],
        categoryRestrictions: [
          'Baby products must meet CPSIA requirements',
          'Electronics need FCC/CE certifications',
          'Food contact items must state FDA approved materials'
        ],
        imageRequirements: [
          'Main image: Pure white background (RGB 255,255,255)',
          'Product fills 85% of frame',
          'Minimum 1000px on longest side (2000px+ recommended)',
          'At least 6 images total'
        ]
      }
    };
  }

  getAlgorithmFactors(): AlgorithmFactors {
    return {
      platform: 'amazon',
      rankingFactors: {
        keywordRelevance: 0.25,      // 25% - Most important
        titleOptimization: 0.20,      // 20% - Critical for CTR
        descriptionQuality: 0.15,     // 15% - Affects conversion
        imageQuality: 0.10,           // 10% - Visual appeal
        priceCompetitiveness: 0.10,   // 10% - Buy Box factor
        sellerPerformance: 0.10,      // 10% - Account health
        customerReviews: 0.05,        // 5% - Social proof
        conversionRate: 0.05          // 5% - Historical performance
      },
      optimizationWeights: {
        seoOptimization: 0.40,        // 40% - Keyword strategy
        userExperience: 0.30,         // 30% - Readability & clarity
        mobileOptimization: 0.20,     // 20% - Mobile-first
        complianceAdherence: 0.10     // 10% - Policy compliance
      }
    };
  }

  protected async optimizeTitle(title: string, keywords: string[]): Promise<string> {
    // Clean the title first
    let optimized = this.cleanTitle(title);
    
    // Remove prohibited words
    const rules = this.getPlatformRules();
    optimized = this.removeProhibitedWords(optimized, rules.prohibitedWords);
    
    // Apply Title Case
    optimized = this.toTitleCase(optimized);
    
    // Ensure it's within length limits
    if (optimized.length > rules.titleRange.max) {
      optimized = optimized.substring(0, rules.titleRange.max).trim();
      // Remove incomplete word at end
      optimized = optimized.substring(0, optimized.lastIndexOf(' '));
    }
    
    // Front-load important keywords if not already present
    if (keywords.length > 0 && optimized.length < rules.titleRange.max - 20) {
      const missingKeywords = keywords.filter(k => 
        !optimized.toLowerCase().includes(k.toLowerCase())
      ).slice(0, 2);
      
      if (missingKeywords.length > 0) {
        const keywordAddition = ` - ${missingKeywords.join(' ')}`;
        if (optimized.length + keywordAddition.length <= rules.titleRange.max) {
          optimized += keywordAddition;
        }
      }
    }
    
    return optimized;
  }

  protected async optimizeDescription(
    description: string,
    keywords: string[],
    specifications: ProductSpecification[]
  ): Promise<string> {
    // Amazon allows HTML formatting
    let optimized = description;
    
    // Ensure minimum length
    if (optimized.length < 2000) {
      optimized = this.expandDescription(optimized, specifications);
    }
    
    // Add HTML formatting for better readability
    optimized = this.formatDescriptionWithHTML(optimized);
    
    // Integrate keywords naturally
    optimized = this.integrateKeywords(optimized, keywords);
    
    return optimized;
  }

  protected async generateTags(content: BaseContent): Promise<string[]> {
    const tags: string[] = [];
    
    // Extract from title
    const titleWords = content.title.toLowerCase().split(/\s+/)
      .filter(w => w.length > 3 && !this.isCommonWord(w));
    tags.push(...titleWords.slice(0, 5));
    
    // Extract from keywords
    if (content.keywords.length > 0) {
      tags.push(...content.keywords.slice(0, 5));
    }
    
    // Extract from category
    if (content.category) {
      tags.push(content.category.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // Remove duplicates and limit to 10
    return [...new Set(tags)].slice(0, 10);
  }

  protected async generatePlatformSpecificElements(content: BaseContent): Promise<any> {
    return {
      bulletPoints: await this.generateBulletPoints(content),
      backendSearchTerms: await this.generateBackendSearchTerms(content)
    };
  }

  /**
   * Generate 5 bullet points for Amazon listing
   */
  private async generateBulletPoints(content: BaseContent): Promise<string[]> {
    const bullets: string[] = [];
    
    // Bullet 1: Primary feature with benefit
    bullets.push(
      `PREMIUM CONSTRUCTION: ${this.extractMainFeature(content)} providing ${this.extractMainBenefit(content)}`
    );
    
    // Bullet 2: Material/Quality
    bullets.push(
      `HIGH-QUALITY MATERIALS: ${this.extractMaterialInfo(content)} ensuring durability and long-lasting performance`
    );
    
    // Bullet 3: Functionality
    bullets.push(
      `VERSATILE FUNCTIONALITY: ${this.extractFunctionalityInfo(content)} suitable for multiple applications`
    );
    
    // Bullet 4: Specifications
    const specs = this.formatSpecifications(content.specifications);
    bullets.push(
      `DETAILED SPECIFICATIONS: ${specs} - carefully designed for optimal performance`
    );
    
    // Bullet 5: Guarantee/Support
    bullets.push(
      `SATISFACTION GUARANTEED: Backed by quality assurance and responsive customer support for peace of mind`
    );
    
    return bullets;
  }

  /**
   * Generate backend search terms (249 bytes max)
   */
  private async generateBackendSearchTerms(content: BaseContent): Promise<string[]> {
    const terms: Set<string> = new Set();
    
    // Add variations of title words
    const titleWords = content.title.toLowerCase().split(/\s+/)
      .filter(w => w.length > 3 && !this.isCommonWord(w));
    titleWords.forEach(w => terms.add(w));
    
    // Add keywords
    content.keywords.forEach(k => terms.add(k.toLowerCase()));
    
    // Add synonyms and related terms
    const synonyms = this.generateSynonyms(content.title, content.description);
    synonyms.forEach(s => terms.add(s));
    
    // Convert to array and join with spaces (not commas)
    const termsArray = Array.from(terms);
    const joined = termsArray.join(' ');
    
    // Ensure it's under 249 bytes
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
    
    return termsArray;
  }

  /**
   * Convert to Title Case
   */
  private toTitleCase(text: string): string {
    const exceptions = ['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'];
    
    return text.split(' ').map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0 || !exceptions.includes(lower)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return lower;
    }).join(' ');
  }

  /**
   * Expand description to meet minimum length
   */
  private expandDescription(description: string, specifications: ProductSpecification[]): string {
    let expanded = description;
    
    // Add specifications section if not present
    if (specifications.length > 0 && !description.includes('Specifications')) {
      expanded += '\n\nSPECIFICATIONS:\n';
      specifications.forEach(spec => {
        expanded += `${spec.name}: ${spec.value}${spec.unit ? ' ' + spec.unit : ''}\n`;
      });
    }
    
    // Add use cases section
    if (!description.includes('Use Cases') && !description.includes('Applications')) {
      expanded += '\n\nIDEAL USE CASES:\n';
      expanded += '• Perfect for everyday use and special occasions\n';
      expanded += '• Suitable for home, office, and travel\n';
      expanded += '• Great for personal use or as a thoughtful gift\n';
    }
    
    // Add care instructions
    if (!description.includes('Care') && !description.includes('Maintenance')) {
      expanded += '\n\nCARE INSTRUCTIONS:\n';
      expanded += 'Easy to clean and maintain for long-lasting use. Follow care guidelines for best results.\n';
    }
    
    return expanded;
  }

  /**
   * Format description with HTML
   */
  private formatDescriptionWithHTML(description: string): string {
    let formatted = description;
    
    // Wrap paragraphs in <p> tags
    formatted = formatted.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n');
    
    // Convert bullet points to <ul><li>
    formatted = formatted.replace(/•\s*(.+)/g, '<li>$1</li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');
    }
    
    // Bold section headers
    formatted = formatted.replace(/([A-Z\s]{3,}:)/g, '<b>$1</b>');
    
    return formatted;
  }

  /**
   * Integrate keywords naturally
   */
  private integrateKeywords(text: string, keywords: string[]): string {
    let integrated = text;
    
    for (const keyword of keywords) {
      if (!integrated.toLowerCase().includes(keyword.toLowerCase())) {
        // Try to add keyword naturally in a sentence
        integrated += ` This ${keyword} is designed for optimal performance.`;
      }
    }
    
    return integrated;
  }

  /**
   * Helper methods for bullet point generation
   */
  private extractMainFeature(content: BaseContent): string {
    // Extract from title or description
    const words = content.title.split(' ');
    return words.slice(0, 5).join(' ');
  }

  private extractMainBenefit(content: BaseContent): string {
    return 'enhanced functionality and user satisfaction';
  }

  private extractMaterialInfo(content: BaseContent): string {
    const materialKeywords = ['steel', 'leather', 'silicone', 'ceramic', 'plastic', 'metal', 'glass', 'wood', 'cotton'];
    const text = `${content.title} ${content.description}`.toLowerCase();
    
    for (const material of materialKeywords) {
      if (text.includes(material)) {
        return `Premium ${material} construction`;
      }
    }
    
    return 'High-grade materials';
  }

  private extractFunctionalityInfo(content: BaseContent): string {
    return 'Designed for practical everyday use with attention to detail';
  }

  private formatSpecifications(specifications: ProductSpecification[]): string {
    if (specifications.length === 0) {
      return 'Carefully crafted with precision';
    }
    
    return specifications.slice(0, 3).map(s => 
      `${s.name}: ${s.value}${s.unit ? s.unit : ''}`
    ).join(', ');
  }

  private generateSynonyms(title: string, description: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'bottle': ['flask', 'container', 'vessel'],
      'case': ['cover', 'protector', 'shell'],
      'bag': ['tote', 'carrier', 'sack'],
      'mug': ['cup', 'tumbler', 'glass'],
      'wallet': ['billfold', 'purse', 'holder']
    };
    
    const synonyms: string[] = [];
    const text = `${title} ${description}`.toLowerCase();
    
    for (const [word, syns] of Object.entries(synonymMap)) {
      if (text.includes(word)) {
        synonyms.push(...syns);
      }
    }
    
    return synonyms;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been',
      'your', 'their', 'what', 'which', 'when', 'where', 'who', 'how'
    ];
    return commonWords.includes(word.toLowerCase());
  }
}
