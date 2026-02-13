/**
 * eBay Platform Engine
 * Implements Cassini algorithm optimization for eBay marketplace
 */

import { BasePlatformEngine } from './BasePlatformEngine';
import {
  BaseContent,
  AlgorithmFactors,
  EnhancedPlatformRules,
  ProductSpecification
} from '@/types';

export class EbayEngine extends BasePlatformEngine {
  constructor() {
    super('ebay');
  }

  getPlatformRules(): EnhancedPlatformRules {
    return {
      name: 'eBay',
      titleRange: { min: 40, max: 80 },
      minDescription: 300,
      maxTags: 20,
      tagFormat: 'item-specifics',
      guidelines: [
        'Keyword-dense, front-loaded important terms',
        'Title Case or ALL CAPS acceptable',
        'Brand + Product Type + Key Features + Size + Condition',
        'First 40 characters critical for mobile',
        'Fill ALL item specifics for better ranking',
        'Competitive pricing important for Best Match'
      ],
      algorithmFactors: this.getAlgorithmFactors(),
      prohibitedWords: [
        'best', 'top', 'premium', 'luxury', 'ultimate', 'amazing',
        'awesome', 'great', 'excellent', 'perfect'
      ],
      requiredFields: ['title', 'description', 'itemSpecifics', 'condition'],
      optionalFields: ['brand', 'model', 'type', 'color', 'size', 'material'],
      formatting: {
        titleFormat: 'Brand + Product Type + Key Features + Compatibility/Size + Condition',
        descriptionFormat: 'HTML encouraged - tables, bold, images allowed',
        tagFormat: 'Item Specifics: Up to 65 fields',
        bulletPointFormat: 'HTML bullet lists with detailed features'
      },
      compliance: {
        contentRestrictions: [
          'No keyword spamming (repeated words count as one)',
          'No "will fit" claims unless certain',
          'Avoid competitor brand names unless genuinely compatible',
          'State condition clearly for used items'
        ],
        categoryRestrictions: [
          'Describe ALL defects for used items',
          'Include item location for shipping calculations',
          'Mention return policy clearly'
        ],
        imageRequirements: [
          'Multiple angles recommended',
          'Show actual item condition',
          'Lifestyle images in additional slots'
        ]
      }
    };
  }

  getAlgorithmFactors(): AlgorithmFactors {
    return {
      platform: 'ebay',
      rankingFactors: {
        keywordRelevance: 0.20,
        titleOptimization: 0.20,
        descriptionQuality: 0.15,
        imageQuality: 0.10,
        priceCompetitiveness: 0.15,    // Higher weight for eBay
        sellerPerformance: 0.10,
        customerReviews: 0.05,
        conversionRate: 0.05
      },
      optimizationWeights: {
        seoOptimization: 0.35,
        userExperience: 0.25,
        mobileOptimization: 0.20,
        complianceAdherence: 0.20
      }
    };
  }

  protected async optimizeTitle(title: string, keywords: string[]): Promise<string> {
    let optimized = this.cleanTitle(title);
    const rules = this.getPlatformRules();
    optimized = this.removeProhibitedWords(optimized, rules.prohibitedWords);
    
    // eBay allows ALL CAPS or Title Case
    optimized = optimized.toUpperCase();
    
    // Strict 80 character limit
    if (optimized.length > 80) {
      optimized = optimized.substring(0, 80).trim();
      optimized = optimized.substring(0, optimized.lastIndexOf(' '));
    }
    
    return optimized;
  }

  protected async optimizeDescription(
    description: string,
    keywords: string[],
    specifications: ProductSpecification[]
  ): Promise<string> {
    let optimized = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">`;
    
    // Eye-catching headline
    optimized += `<h2 style="color: #333; border-bottom: 2px solid #0066c0; padding-bottom: 10px;">Product Description</h2>`;
    
    // Main description
    optimized += `<p style="font-size: 14px; line-height: 1.6;">${description}</p>`;
    
    // Key features as bullet points
    optimized += `<h3 style="color: #333; margin-top: 20px;">Key Features:</h3>`;
    optimized += `<ul style="font-size: 14px; line-height: 1.8;">`;
    const features = this.extractFeatures(description);
    features.forEach(feature => {
      optimized += `<li>${feature}</li>`;
    });
    optimized += `</ul>`;
    
    // Specifications table
    if (specifications.length > 0) {
      optimized += `<h3 style="color: #333; margin-top: 20px;">Specifications:</h3>`;
      optimized += `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">`;
      specifications.forEach(spec => {
        optimized += `<tr style="border-bottom: 1px solid #ddd;">`;
        optimized += `<td style="padding: 8px; font-weight: bold; width: 40%;">${spec.name}</td>`;
        optimized += `<td style="padding: 8px;">${spec.value}${spec.unit ? ' ' + spec.unit : ''}</td>`;
        optimized += `</tr>`;
      });
      optimized += `</table>`;
    }
    
    // Shipping and returns
    optimized += `<h3 style="color: #333; margin-top: 20px;">Shipping & Returns:</h3>`;
    optimized += `<p style="font-size: 14px;">Fast shipping available. 30-day return policy for buyer satisfaction.</p>`;
    
    optimized += `</div>`;
    
    return optimized;
  }

  protected async generateTags(content: BaseContent): Promise<string[]> {
    // eBay uses Item Specifics instead of tags
    return [];
  }

  protected async generatePlatformSpecificElements(content: BaseContent): Promise<any> {
    return {
      itemSpecifics: await this.generateItemSpecifics(content)
    };
  }

  private async generateItemSpecifics(content: BaseContent): Promise<Record<string, string>> {
    const specifics: Record<string, string> = {};
    
    // Extract from title and description
    const text = `${content.title} ${content.description}`.toLowerCase();
    
    // Brand
    specifics['Brand'] = this.extractBrand(content.title) || 'Unbranded';
    
    // Type
    specifics['Type'] = content.category || 'General';
    
    // Material
    const materials = ['stainless steel', 'leather', 'silicone', 'ceramic', 'plastic', 'metal'];
    for (const material of materials) {
      if (text.includes(material)) {
        specifics['Material'] = material.split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        break;
      }
    }
    
    // Color
    const colors = ['black', 'white', 'blue', 'red', 'green', 'brown', 'gray', 'silver'];
    for (const color of colors) {
      if (text.includes(color)) {
        specifics['Color'] = color.charAt(0).toUpperCase() + color.slice(1);
        break;
      }
    }
    
    // Features
    const features: string[] = [];
    if (text.includes('waterproof')) features.push('Waterproof');
    if (text.includes('insulated')) features.push('Insulated');
    if (text.includes('leak proof')) features.push('Leak-Proof');
    if (features.length > 0) {
      specifics['Features'] = features.join(', ');
    }
    
    // Condition
    specifics['Condition'] = 'New';
    
    return specifics;
  }

  private extractFeatures(description: string): string[] {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private extractBrand(title: string): string | null {
    const words = title.split(' ');
    // First word is often the brand
    if (words[0] && words[0].length > 2 && /^[A-Z]/.test(words[0])) {
      return words[0];
    }
    return null;
  }
}
