/**
 * WooCommerce Platform Engine
 * Google SEO-focused optimization for WooCommerce stores
 */

import { BasePlatformEngine } from './BasePlatformEngine';
import {
  BaseContent,
  AlgorithmFactors,
  EnhancedPlatformRules,
  ProductSpecification
} from '@/types';

export class WooCommerceEngine extends BasePlatformEngine {
  constructor() {
    super('woocommerce' as any);
  }

  getPlatformRules(): EnhancedPlatformRules {
    return {
      name: 'WooCommerce',
      titleRange: { min: 55, max: 70 },
      minDescription: 300,
      maxTags: 12,
      tagFormat: 'comma-separated',
      guidelines: [
        'Optimize for Google search — title is the SEO title tag',
        'Natural, clickable language — write for humans first',
        'Include primary keyword user would Google',
        'Meta description in first 160 chars of description',
        'Focus on long-tail keywords with less competition',
        'Use schema-friendly structured data language',
      ],
      algorithmFactors: this.getAlgorithmFactors(),
      prohibitedWords: [
        'best', 'top', 'premium', 'luxury', 'ultimate', 'perfect',
        'amazing', 'awesome', 'great', 'excellent'
      ],
      requiredFields: ['title', 'description', 'metaTitle', 'metaDescription'],
      optionalFields: ['tags', 'productType', 'vendor', 'sku'],
      formatting: {
        titleFormat: 'Brand + Product Name + Key Feature — natural, Google-friendly',
        descriptionFormat: 'Rich text, HTML formatting available',
        tagFormat: 'Descriptive tags: color, size, material, use-case',
        bulletPointFormat: 'Use rich text formatting for lists'
      },
      compliance: {
        contentRestrictions: [
          'No misleading claims',
          'Accurate product descriptions',
          'Clear pricing and shipping info',
        ],
        categoryRestrictions: [],
        imageRequirements: [
          'High-quality product photos',
          'Multiple angles recommended',
          'Optimized for web (compressed)',
        ]
      }
    };
  }

  getAlgorithmFactors(): AlgorithmFactors {
    return {
      platform: 'woocommerce' as any,
      rankingFactors: {
        keywordRelevance: 0.25,
        titleOptimization: 0.25,
        descriptionQuality: 0.20,
        imageQuality: 0.10,
        priceCompetitiveness: 0.05,
        sellerPerformance: 0.05,
        customerReviews: 0.05,
        conversionRate: 0.05
      },
      optimizationWeights: {
        seoOptimization: 0.40,
        userExperience: 0.30,
        mobileOptimization: 0.20,
        complianceAdherence: 0.10
      }
    };
  }

  protected async optimizeTitle(title: string, keywords: string[]): Promise<string> {
    let optimized = this.cleanTitle(title);
    const rules = this.getPlatformRules();
    optimized = this.removeProhibitedWords(optimized, rules.prohibitedWords);

    if (optimized.length > 70) {
      optimized = optimized.substring(0, 70).trim();
      optimized = optimized.substring(0, optimized.lastIndexOf(' '));
    }

    return optimized;
  }

  protected async optimizeDescription(
    description: string,
    keywords: string[],
    specifications: ProductSpecification[]
  ): Promise<string> {
    let optimized = description;

    if (specifications.length > 0) {
      optimized += '\n\nSpecifications:\n';
      specifications.forEach(spec => {
        optimized += `- ${spec.name}: ${spec.value}${spec.unit ? ' ' + spec.unit : ''}\n`;
      });
    }

    return optimized;
  }

  protected async generateTags(content: BaseContent): Promise<string[]> {
    const tags: string[] = [];
    const text = `${content.title} ${content.description}`.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 4);
    const unique = [...new Set(words)].slice(0, 12);
    tags.push(...unique);
    return tags;
  }

  protected async generatePlatformSpecificElements(content: BaseContent): Promise<any> {
    return {};
  }
}
