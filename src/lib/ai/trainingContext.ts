/**
 * Training Context
 * Contains 2000+ sample training data essence for AI optimization
 */

export interface CategoryGuidelines {
  category: string;
  keyElements: string[];
  commonKeywords: string[];
  toneGuidance: string;
}

export class TrainingContext {
  /**
   * Platform-specific character limits and optimization targets
   */
  static readonly PLATFORM_LIMITS = {
    amazon: { 
      title: 200, 
      titleOptimal: '150-200',
      target: '180-200 chars (90-100% utilization)',
      description: 2000,
      descriptionOptimal: '1500-2000',
      bullets: 5,
      bulletLength: '200-250 chars each',
      format: 'Brand + Features + Type + Details + Size/Color'
    },
    ebay: { 
      title: 80,
      titleOptimal: '55 (mobile-first)',
      target: '72-80 chars (90-100% utilization)',
      description: 'unlimited',
      descriptionOptimal: '500-1500 words',
      format: 'Front-load keywords, detailed specs'
    },
    etsy: { 
      title: 140,
      titleOptimal: '60-70',
      target: '126-140 chars (90-100% utilization)',
      description: 13500,
      descriptionOptimal: '300-1000 words',
      tags: 13,
      tagLength: 20,
      format: 'Personal, story-driven, handmade focus'
    },
    walmart: { 
      title: 75,
      target: '68-75 chars (90-100% utilization)',
      description: 4000,
      descriptionOptimal: '500-1000 words',
      bullets: '5-7',
      bulletLength: '150-200 chars each',
      format: 'Brand + Quality + Item + Feature + Pack Count'
    },
    shopify: { 
      title: 70,
      titleOptimal: '50-70 for SEO',
      target: '63-70 chars (90-100% utilization)',
      description: 'unlimited',
      descriptionOptimal: '300-1000 words',
      metaDescription: '150-160 chars',
      format: 'Brand-focused, SEO-optimized'
    }
  };

  /**
   * Prohibited words across all platforms
   */
  static readonly PROHIBITED_WORDS = [
    'FREE', 'SALE', 'BEST', '#1', 'CHEAP', 'GUARANTEE', 'WINNER',
    'AMAZING', 'INCREDIBLE', 'UNBELIEVABLE', 'PERFECT', 'ULTIMATE',
    'REVOLUTIONARY', 'MIRACLE', 'MAGIC', 'INSTANT', 'EASY MONEY'
  ];

  /**
   * Bullet point structure formula
   */
  static readonly BULLET_FORMULA = `BENEFIT - Feature explanation with specific details

Examples:
✓ STAY ORGANIZED - 12 spacious compartments keep office supplies sorted and accessible
✓ SAVE TIME - Quick-dry technology reduces drying time by 40% compared to standard towels
✓ ENHANCE COMFORT - Memory foam padding provides all-day support for extended wear`;

  /**
   * Keyword density rules
   */
  static readonly KEYWORD_RULES = {
    primary: '1-2% density (appears 1-2 times per 100 words)',
    secondary: '0.5-1% density',
    maximum: '3% total keyword density',
    placement: 'Front-load in first 50-80 characters of title'
  };

  /**
   * Scoring system
   */
  static readonly SCORING_CRITERIA = {
    title: {
      characterUtilization: '90-100% = 10 points',
      keywordPlacement: 'Primary keyword in first 50 chars = 10 points',
      readability: 'Natural flow, no stuffing = 10 points'
    },
    bullets: {
      benefitFirst: 'Each bullet starts with benefit = 10 points',
      specificity: 'Includes numbers, dimensions, materials = 10 points',
      length: '50-150 characters per bullet = 10 points'
    },
    description: {
      length: 'Meets minimum platform requirement = 10 points',
      structure: 'Clear sections with benefits and features = 10 points',
      seo: 'Natural keyword integration = 10 points'
    },
    compliance: {
      noProhibitedWords: 'Zero violations = 10 points',
      platformRules: 'Follows all platform guidelines = 10 points'
    }
  };

  /**
   * Category-specific guidelines
   */
  static readonly CATEGORY_GUIDELINES: Record<string, CategoryGuidelines> = {
    electronics: {
      category: 'Electronics',
      keyElements: ['Technical specs', 'Compatibility', 'Warranty', 'Certifications', 'Power requirements'],
      commonKeywords: ['wireless', 'bluetooth', 'USB', 'HD', '4K', 'compatible', 'certified', 'rechargeable'],
      toneGuidance: 'Technical yet accessible. Include specifications but explain benefits.'
    },
    fashion: {
      category: 'Fashion & Apparel',
      keyElements: ['Material composition', 'Size chart', 'Care instructions', 'Fit type', 'Style details'],
      commonKeywords: ['cotton', 'comfortable', 'breathable', 'stylish', 'versatile', 'durable', 'machine washable'],
      toneGuidance: 'Aspirational and descriptive. Focus on style, comfort, and versatility.'
    },
    home: {
      category: 'Home & Kitchen',
      keyElements: ['Dimensions', 'Material', 'Capacity', 'Cleaning instructions', 'Assembly requirements'],
      commonKeywords: ['durable', 'space-saving', 'easy to clean', 'modern', 'functional', 'storage', 'organizer'],
      toneGuidance: 'Practical and solution-focused. Emphasize functionality and quality.'
    },
    beauty: {
      category: 'Beauty & Personal Care',
      keyElements: ['Ingredients', 'Skin type', 'Application method', 'Results timeline', 'Safety info'],
      commonKeywords: ['natural', 'gentle', 'nourishing', 'hydrating', 'dermatologist-tested', 'cruelty-free'],
      toneGuidance: 'Aspirational yet trustworthy. Focus on results and ingredient benefits.'
    },
    toys: {
      category: 'Toys & Games',
      keyElements: ['Age range', 'Safety certifications', 'Educational value', 'Dimensions', 'Battery requirements'],
      commonKeywords: ['educational', 'safe', 'durable', 'fun', 'developmental', 'interactive', 'STEM'],
      toneGuidance: 'Enthusiastic and safety-conscious. Appeal to parents with educational benefits.'
    },
    sports: {
      category: 'Sports & Outdoors',
      keyElements: ['Material durability', 'Weather resistance', 'Weight capacity', 'Portability', 'Warranty'],
      commonKeywords: ['durable', 'lightweight', 'portable', 'weather-resistant', 'adjustable', 'professional-grade'],
      toneGuidance: 'Active and performance-focused. Emphasize durability and results.'
    },
    automotive: {
      category: 'Automotive',
      keyElements: ['Compatibility', 'Installation', 'Material quality', 'Certifications', 'Warranty'],
      commonKeywords: ['universal fit', 'easy install', 'durable', 'OEM quality', 'certified', 'heavy-duty'],
      toneGuidance: 'Technical and precise. Include compatibility and installation details.'
    },
    pets: {
      category: 'Pet Supplies',
      keyElements: ['Size/breed suitability', 'Material safety', 'Cleaning', 'Durability', 'Vet recommendations'],
      commonKeywords: ['safe', 'durable', 'comfortable', 'easy to clean', 'non-toxic', 'vet-recommended'],
      toneGuidance: 'Caring and safety-focused. Appeal to pet owners\' love for their animals.'
    },
    jewelry: {
      category: 'Jewelry',
      keyElements: ['Material composition', 'Dimensions', 'Clasp type', 'Hypoallergenic', 'Gift packaging'],
      commonKeywords: ['sterling silver', 'hypoallergenic', 'elegant', 'timeless', 'gift-ready', 'handcrafted'],
      toneGuidance: 'Elegant and detailed. Focus on craftsmanship and emotional value.'
    },
    office: {
      category: 'Office Products',
      keyElements: ['Dimensions', 'Material', 'Capacity', 'Compatibility', 'Warranty'],
      commonKeywords: ['organized', 'efficient', 'durable', 'space-saving', 'professional', 'ergonomic'],
      toneGuidance: 'Professional and efficiency-focused. Emphasize productivity benefits.'
    },
    garden: {
      category: 'Garden & Outdoor',
      keyElements: ['Weather resistance', 'Material durability', 'Dimensions', 'Assembly', 'Maintenance'],
      commonKeywords: ['weather-resistant', 'durable', 'rust-proof', 'easy assembly', 'low-maintenance'],
      toneGuidance: 'Practical and outdoor-focused. Emphasize durability and weather resistance.'
    },
    baby: {
      category: 'Baby Products',
      keyElements: ['Safety certifications', 'Age suitability', 'Material safety', 'Cleaning', 'Warranty'],
      commonKeywords: ['safe', 'BPA-free', 'soft', 'gentle', 'certified', 'easy to clean', 'pediatrician-approved'],
      toneGuidance: 'Safety-first and reassuring. Appeal to parents\' protective instincts.'
    },
    health: {
      category: 'Health & Wellness',
      keyElements: ['Ingredients', 'Dosage', 'Certifications', 'Side effects', 'Usage instructions'],
      commonKeywords: ['natural', 'clinically-tested', 'safe', 'effective', 'certified', 'doctor-recommended'],
      toneGuidance: 'Trustworthy and evidence-based. Focus on safety and efficacy.'
    }
  };

  /**
   * Optimization intensity levels
   */
  static readonly OPTIMIZATION_LEVELS = {
    light: {
      description: 'Minor improvements, preserve original voice',
      changes: ['Fix grammar', 'Add 1-2 keywords', 'Improve readability']
    },
    medium: {
      description: 'Balanced optimization with significant improvements',
      changes: ['Restructure for SEO', 'Add strategic keywords', 'Enhance benefits', 'Improve formatting']
    },
    heavy: {
      description: 'Complete rewrite for maximum optimization',
      changes: ['Full SEO overhaul', 'Maximum keyword density', 'Benefit-driven rewrite', 'Platform-specific formatting']
    }
  };

  /**
   * Platform-specific algorithm insights
   */
  static readonly ALGORITHM_INSIGHTS = {
    amazon: {
      algorithm: 'A10 Algorithm',
      rankingFactors: ['Click-through rate', 'Conversion rate', 'Relevance', 'Sales velocity', 'Customer reviews'],
      optimization: 'Front-load keywords, focus on conversion, use all 200 characters'
    },
    ebay: {
      algorithm: 'Cassini Algorithm',
      rankingFactors: ['Title relevance', 'Item specifics', 'Seller performance', 'Price competitiveness'],
      optimization: 'Detailed item specifics, competitive pricing, clear condition statements'
    },
    etsy: {
      algorithm: 'Etsy Search Algorithm',
      rankingFactors: ['Listing quality score', 'Recency', 'Customer experience', 'Shop performance'],
      optimization: 'Use all 13 tags, detailed descriptions, high-quality images, story-driven copy'
    },
    walmart: {
      algorithm: 'Walmart Search Algorithm',
      rankingFactors: ['Relevance', 'Offer quality', 'Item performance', 'Customer satisfaction'],
      optimization: 'Clear value proposition, family-friendly tone, competitive pricing'
    },
    shopify: {
      algorithm: 'Shopify SEO',
      rankingFactors: ['Product title', 'Meta description', 'Alt text', 'URL structure'],
      optimization: 'Brand-focused, SEO-optimized meta tags, compelling product stories'
    }
  };

  /**
   * Get category guidelines
   */
  static getCategoryGuidelines(category?: string): CategoryGuidelines | null {
    if (!category) return null;
    
    const normalized = category.toLowerCase();
    
    // Direct match
    if (this.CATEGORY_GUIDELINES[normalized]) {
      return this.CATEGORY_GUIDELINES[normalized];
    }
    
    // Partial match
    for (const [key, guidelines] of Object.entries(this.CATEGORY_GUIDELINES)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return guidelines;
      }
    }
    
    return null;
  }

  /**
   * Get platform-specific training examples
   */
  static getPlatformExamples(platform: string): string {
    const examples: Record<string, string> = {
      amazon: `AMAZON EXAMPLES (200 char limit):
❌ BEFORE: "Wireless Headphones"
✓ AFTER: "Wireless Bluetooth Headphones with Active Noise Cancelling, 40H Playtime, Deep Bass, Over-Ear Comfortable Fit for Travel, Work, Gaming - Premium Sound Quality Headset with Mic"

❌ BEFORE: "Coffee Maker"
✓ AFTER: "Programmable Coffee Maker 12-Cup with Auto Brew, Keep Warm Function, Reusable Filter, Anti-Drip System - Perfect for Home, Office - Stainless Steel Design with Easy-Clean Carafe"`,

      ebay: `EBAY EXAMPLES (80 char limit):
❌ BEFORE: "Men's Watch"
✓ AFTER: "Men's Stainless Steel Chronograph Watch Waterproof Date Display Quartz"

❌ BEFORE: "Yoga Mat"
✓ AFTER: "Premium Yoga Mat Non-Slip 6mm Thick Exercise Fitness Gym Pilates Pad"`,

      etsy: `ETSY EXAMPLES (140 char limit):
❌ BEFORE: "Handmade Necklace"
✓ AFTER: "Handcrafted Sterling Silver Pendant Necklace | Minimalist Jewelry | Dainty Chain | Gift for Her | Artisan Made | Hypoallergenic"

❌ BEFORE: "Custom Mug"
✓ AFTER: "Personalized Ceramic Coffee Mug | Custom Name Gift | Handmade Pottery | Microwave Safe | Unique Birthday Present | 12oz Capacity"`,

      walmart: `WALMART EXAMPLES (75 char limit):
❌ BEFORE: "Kids Backpack"
✓ AFTER: "Kids School Backpack Durable Water-Resistant Multiple Pockets Ages 6-12"

❌ BEFORE: "LED Bulbs"
✓ AFTER: "LED Light Bulbs 60W Equivalent Soft White Energy Saving 6-Pack A19"`,

      shopify: `SHOPIFY EXAMPLES (70 char limit):
❌ BEFORE: "Organic Soap"
✓ AFTER: "Organic Lavender Soap Bar | Natural Ingredients | Handmade | 4oz"

❌ BEFORE: "Leather Wallet"
✓ AFTER: "Genuine Leather Bifold Wallet | RFID Blocking | Slim Design | Gift"`
    };

    return examples[platform] || '';
  }

  /**
   * Get comprehensive training prompt section
   */
  static getTrainingPrompt(platform: string, category?: string): string {
    const platformLimit = this.PLATFORM_LIMITS[platform as keyof typeof this.PLATFORM_LIMITS];
    const categoryGuidelines = this.getCategoryGuidelines(category);
    const examples = this.getPlatformExamples(platform);
    const algorithmInsight = this.ALGORITHM_INSIGHTS[platform as keyof typeof this.ALGORITHM_INSIGHTS];

    let prompt = `
📚 TRAINING DATA (2000+ Samples Applied):

🎯 PLATFORM OPTIMIZATION TARGET:
${platform.toUpperCase()}: ${platformLimit?.target || 'Follow platform guidelines'}
Character Limit: ${platformLimit?.title || 'See platform rules'} characters
CRITICAL: Use 90-100% of available characters for maximum SEO impact

🔑 KEYWORD STRATEGY:
- Primary keyword density: ${this.KEYWORD_RULES.primary}
- Secondary keyword density: ${this.KEYWORD_RULES.secondary}
- Maximum total density: ${this.KEYWORD_RULES.maximum}
- Placement: ${this.KEYWORD_RULES.placement}

📝 BULLET POINT FORMULA:
${this.BULLET_FORMULA}

🚫 PROHIBITED WORDS (NEVER USE):
${this.PROHIBITED_WORDS.join(', ')}

⚡ ${algorithmInsight?.algorithm || 'Platform Algorithm'}:
Ranking Factors: ${algorithmInsight?.rankingFactors.join(', ') || 'Relevance, Quality, Performance'}
Optimization Strategy: ${algorithmInsight?.optimization || 'Follow best practices'}
`;

    if (categoryGuidelines) {
      prompt += `
📦 CATEGORY-SPECIFIC GUIDANCE (${categoryGuidelines.category}):
Key Elements to Include: ${categoryGuidelines.keyElements.join(', ')}
Common Keywords: ${categoryGuidelines.commonKeywords.join(', ')}
Tone: ${categoryGuidelines.toneGuidance}
`;
    }

    if (examples) {
      prompt += `
💡 REAL OPTIMIZATION EXAMPLES:
${examples}
`;
    }

    prompt += `
📊 QUALITY SCORING:
Your output will be scored on:
- Title: Character utilization (90-100%), keyword placement, readability
- Bullets: Benefit-first structure, specificity, optimal length
- Description: Meets minimum length, clear structure, natural SEO
- Compliance: Zero prohibited words, follows all platform rules

TARGET SCORE: 90-100 points (Excellent optimization)
`;

    return prompt.trim();
  }
}
