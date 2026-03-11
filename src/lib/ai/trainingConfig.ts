/**
 * Enhanced Training Configuration
 * Optimized settings for maximum model performance
 */

export const TRAINING_CONFIG = {
  // Auto-training settings
  autoTraining: {
    enabled: true,
    minSeoScore: 85, // OPTIMIZED: Lowered from 90 to capture more quality examples
    maxExamplesPerCategory: 100,
    weightRecent: true, // Give higher weight to recent examples
    includeNegativeExamples: true // Learn from poor examples too
  },

  // Model configuration
  model: {
    temperature: 0.2, // OPTIMIZED: Lower for consistency (was 0.3)
    maxTokens: 12000, // OPTIMIZED: Increased for detailed content (was 8192)
    topP: 0.95,
    frequencyPenalty: 0.3, // Reduce repetition
    presencePenalty: 0.1, // Encourage diversity
    timeout: 90000 // 90 seconds
  },

  // Scoring weights (must sum to 1.0)
  scoringWeights: {
    keywordDensity: 0.20,      // 20% - Keyword optimization
    titleOptimization: 0.20,    // 20% - Title quality
    descriptionQuality: 0.15,   // 15% - Description completeness
    readability: 0.12,          // 12% - Readability score
    platformCompliance: 0.15,   // 15% - Platform rules
    mobileOptimization: 0.08,   // 8% - Mobile-first
    keywordPlacement: 0.05,     // 5% - Strategic placement
    contentStructure: 0.05      // 5% - Proper formatting
  },

  // Character utilization targets
  characterTargets: {
    title: {
      min: 90, // Minimum 90% utilization
      optimal: 95, // Optimal 95-100%
      max: 100
    },
    description: {
      min: 80,
      optimal: 90,
      max: 100
    }
  },

  // Keyword density targets
  keywordDensity: {
    primary: { min: 1.5, max: 2.5, optimal: 2.0 },
    secondary: { min: 0.8, max: 1.5, optimal: 1.0 },
    total: { min: 2.0, max: 4.0, optimal: 2.5 }
  },

  // Quality thresholds
  qualityThresholds: {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 0
  },

  // Training data categories (25 categories)
  categories: [
    'Electronics & Accessories',
    'Fashion & Apparel',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Toys & Games',
    'Books & Media',
    'Health & Wellness',
    'Pet Supplies',
    'Automotive',
    'Tools & Hardware',
    'Office Supplies',
    'Baby & Kids',
    'Jewelry & Watches',
    'Arts & Crafts',
    'Garden & Outdoor',
    'Food & Beverages',
    'Musical Instruments',
    'Collectibles & Antiques',
    'Industrial & Scientific',
    'Handmade & Artisan',
    'Vintage & Retro',
    'Digital Products',
    'Print-on-Demand',
    'Subscription Boxes'
  ],

  // Platform-specific optimization intensity
  platformIntensity: {
    amazon: 'heavy', // Most competitive, needs maximum optimization
    ebay: 'medium',
    etsy: 'medium',
    shopify: 'light',
    walmart: 'medium',
    woocommerce: 'light'
  },

  // Validation rules
  validation: {
    minTitleLength: 30,
    maxTitleLength: 200,
    minDescriptionLength: 100,
    maxDescriptionLength: 10000,
    minBullets: 3,
    maxBullets: 10,
    minKeywords: 3,
    maxKeywords: 20
  },

  // Performance optimization
  performance: {
    enableCaching: true,
    cacheTTL: 3600, // 1 hour
    maxConcurrentRequests: 10,
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // Provider fallback configuration
  providerFallback: {
    enabled: true,
    cooldownPeriod: 60000, // 60 seconds
    maxFailures: 3,
    providers: ['groq', 'cloudflare', 'gemini']
  },

  // A/B testing configuration
  abTesting: {
    enabled: true,
    variationsCount: 4,
    focusAreas: [
      'keyword-first',
      'benefit-first',
      'spec-first',
      'brand-first'
    ]
  },

  // Analytics tracking
  analytics: {
    trackPerformance: true,
    trackConversions: true,
    trackSEOScores: true,
    trackUserFeedback: true
  }
};

// Export individual configs for easy access
export const AUTO_TRAINING_CONFIG = TRAINING_CONFIG.autoTraining;
export const MODEL_CONFIG = TRAINING_CONFIG.model;
export const SCORING_WEIGHTS = TRAINING_CONFIG.scoringWeights;
export const CHARACTER_TARGETS = TRAINING_CONFIG.characterTargets;
export const KEYWORD_DENSITY_TARGETS = TRAINING_CONFIG.keywordDensity;
export const QUALITY_THRESHOLDS = TRAINING_CONFIG.qualityThresholds;
export const VALIDATION_RULES = TRAINING_CONFIG.validation;
export const PERFORMANCE_CONFIG = TRAINING_CONFIG.performance;
export const PROVIDER_FALLBACK_CONFIG = TRAINING_CONFIG.providerFallback;
export const AB_TESTING_CONFIG = TRAINING_CONFIG.abTesting;
export const ANALYTICS_CONFIG = TRAINING_CONFIG.analytics;
