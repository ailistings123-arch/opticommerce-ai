/**
 * Walmart Platform Engine
 * Implements Walmart Marketplace optimization with focus on data quality and competitive pricing
 */

import { BasePlatformEngine } from './BasePlatformEngine';
import {
  BaseContent,
  AlgorithmFactors,
  EnhancedPlatformRules,
  ProductSpecification
} from '@/types';

export class WalmartEngine extends BasePlatformEngine {
  constructor() {
    super('walmart');
  }

  getPlatformRules(): EnhancedPlatformRules {
    return {
      name: 'Walmart',
      titleRange: { min: 40, max: 75 },
      minDescription: 400,
      maxTags: 10,
      tagFormat: 'product-attributes',
      guidelines: [
        'Brand Name FIRST (Walmart emphasizes brand authenticity)',
        'Format: Brand + Defining Characteristics + Product Type + Key Specs + Size/Quantity',
        'Concise, feature-focused, no fluff',
        'Title Case Only',
        'Product data quality heavily weighted',
        'Competitive pricing crucial'
      ],
      algorithmFactors: this.getAlgorithmFactors(),
      prohibitedWords: [
        'best', 'top', 'premium', 'luxury', 'ultimate', 'perfect',
        'amazing', 'awesome', 'great', 'excellent'
      ],
      requiredFields: ['title', 'description', 'brand', 'productAttributes', 'gtin'],
      optionalFields: ['model', 'mpn', 'manufacturer', 'warranty'],
      formatting: {
        titleFormat: 'Brand + Defining Characteristics + Product Type + Key Specs + Size/Quantity',
        descriptionFormat: 'Plain text with bullet points (dashes or asterisks)',
        tagFormat: 'Product attributes: Brand, Model, Type, Color, Size, Material',
        bulletPointFormat: 'Short, punchy statements (Feature + Benefit)'
      },
      compliance: {
        contentRestrictions: [
          'No promotional text',
          'No seller information',
          'No special characters',
          'No all caps',
          'No dropshipping language visible to customer'
        ],
        categoryRestrictions: [
          'Electronics, grocery, pharmacy need approval',
          'No medical claims without FDA approval',
          'No pesticide claims without EPA registration',
          'No weapons or ammunition',
          'No counterfeit or unauthorized products'
        ],
        imageRequirements: [
          'White or neutral background',
          '1000px minimum',
          'Product only (no watermarks)',
          'No text overlays on main image',
          'Lifestyle images in additional slots'
        ]
      }
    };
  }

  getAlgorithmFactors(): AlgorithmFactors {
    return {
      platform: 'walmart',
      rankingFactors: {
        keywordRelevance: 0.20,
        titleOptimization: 0.20,
        descriptionQuality: 0.15,
        imageQuality: 0.10,
        priceCompetitiveness: 0.20,    // Very important for Walmart
        sellerPerformance: 0.10,
        customerReviews: 0.03,
        conversionRate: 0.02
      },
      optimizationWeights: {
        seoOptimization: 0.30,
        userExperience: 0.25,
        mobileOptimization: 0.20,
        complianceAdherence: 0.25      // High compliance focus
      }
    };
  }

  protected async optimizeTitle(title: string, keywords: string[]): Promise<string> {
    let optimized = this.cleanTitle(title);
    const rules = this.getPlatformRules();
    optimized = this.removeProhibitedWords(optimized, rules.prohibitedWords);
    
    // Extract or add brand at the beginning
    const brand = this.extractBrand(optimized);
    if (brand && !optimized.startsWith(brand)) {
      optimized = `${brand} ${optimized.replace(brand, '').trim()}`;
    }
    
    // Title Case Only
    optimized = this.toTitleCase(optimized);
    
    // Strict 75 character limit
    if (optimized.length > 75) {
      optimized = optimized.substring(0, 75).trim();
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
    
    // Brief overview (1-2 sentences)
    optimized += this.createBriefOverview(description);
    optimized += '\n\n';
    
    // Key features (4-6 bullets)
    optimized += 'KEY FEATURES:\n';
    const features = this.extractKeyFeatures(description);
    features.forEach(feature => {
      optimized += `- ${feature}\n`;
    });
    optimized += '\n';
    
    // Specifications
    if (specifications.length > 0) {
      optimized += 'SPECIFICATIONS:\n';
      specifications.forEach(spec => {
        optimized += `- ${spec.name}: ${spec.value}${spec.unit ? ' ' + spec.unit : ''}\n`;
      });
      optimized += '\n';
    }
    
    // What's included
    optimized += 'WHAT\'S INCLUDED:\n';
    optimized += '- 1x Product as described\n';
    optimized += '- User manual and documentation\n\n';
    
    // Basic care/usage instructions
    optimized += 'CARE INSTRUCTIONS:\n';
    optimized += 'Follow care guidelines for optimal performance and longevity.';
    
    return optimized;
  }

  protected async generateTags(content: BaseContent): Promise<string[]> {
    // Walmart uses product attributes instead of traditional tags
    return [];
  }

  protected async generatePlatformSpecificElements(content: BaseContent): Promise<any> {
    return {
      productAttributes: await this.generateProductAttributes(content)
    };
  }

  private async generateProductAttributes(content: BaseContent): Promise<Record<string, string>> {
    const attributes: Record<string, string> = {};
    const text = `${content.title} ${content.description}`.toLowerCase();
    
    // Brand (required)
    attributes['Brand'] = this.extractBrand(content.title) || 'Generic';
    
    // Model Number (if applicable)
    const modelMatch = content.title.match(/\b([A-Z0-9]{3,})\b/);
    if (modelMatch) {
      attributes['Model'] = modelMatch[1];
    }
    
    // Product Type
    attributes['Product Type'] = content.category || 'General Merchandise';
    
    // Color
    const colors = ['black', 'white', 'blue', 'red', 'green', 'brown', 'gray', 'silver', 'gold'];
    for (const color of colors) {
      if (text.includes(color)) {
        attributes['Color'] = color.charAt(0).toUpperCase() + color.slice(1);
        break;
      }
    }
    
    // Material
    const materials = ['stainless steel', 'plastic', 'metal', 'wood', 'glass', 'ceramic', 'leather'];
    for (const material of materials) {
      if (text.includes(material)) {
        attributes['Material'] = material.split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        break;
      }
    }
    
    // Size/Capacity (if applicable)
    const sizeMatch = text.match(/(\d+\.?\d*)\s*(oz|ml|inch|cm|gb|l|ft)/i);
    if (sizeMatch) {
      attributes['Size'] = `${sizeMatch[1]} ${sizeMatch[2]}`;
    }
    
    // Features
    const features: string[] = [];
    if (text.includes('waterproof')) features.push('Waterproof');
    if (text.includes('wireless')) features.push('Wireless');
    if (text.includes('rechargeable')) features.push('Rechargeable');
    if (features.length > 0) {
      attributes['Features'] = features.join(', ');
    }
    
    // GTIN/UPC (note: actual value would need to be provided)
    attributes['GTIN'] = 'Exemption required - Contact seller';
    
    // Manufacturer Part Number
    if (content.specifications.length > 0) {
      const mpnSpec = content.specifications.find(s => 
        s.name.toLowerCase().includes('mpn') || s.name.toLowerCase().includes('part number')
      );
      if (mpnSpec) {
        attributes['MPN'] = mpnSpec.value;
      }
    }
    
    return attributes;
  }

  private extractBrand(title: string): string | null {
    const words = title.split(' ');
    // First word is often the brand if it starts with capital letter
    if (words[0] && /^[A-Z]/.test(words[0]) && words[0].length > 2) {
      return words[0];
    }
    
    // Check for known brand patterns
    const brandPatterns = ['Apple', 'Samsung', 'Sony', 'HP', 'Dell', 'Nike', 'Adidas'];
    for (const brand of brandPatterns) {
      if (title.includes(brand)) {
        return brand;
      }
    }
    
    return null;
  }

  private createBriefOverview(description: string): string {
    const firstSentence = description.split(/[.!?]/)[0];
    return firstSentence + '.';
  }

  private extractKeyFeatures(description: string): string[] {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 15);
    return sentences.slice(0, 6).map(s => s.trim());
  }

  private toTitleCase(text: string): string {
    return text.split(' ').map(word => {
      if (word.length <= 2) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }
}
