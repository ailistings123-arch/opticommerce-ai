import { Timestamp } from 'firebase/firestore';

export type Platform = 'amazon' | 'shopify' | 'etsy' | 'ebay' | 'walmart';
export type Tier = 'free' | 'basic' | 'premium' | 'enterprise';
export type OptimizationGoal = 'seo' | 'conversion' | 'compliance' | 'mobile' | 'competitive';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type ComplianceStatus = 'compliant' | 'warning' | 'violation';
export type QualityLevel = 'poor' | 'fair' | 'good' | 'excellent';
export type ImprovementCategory = 'SEO' | 'Compliance' | 'Quality' | 'Platform-Specific' | 'Competitive';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type ImplementationStatus = 'Implemented' | 'Partially Implemented' | 'Not Implemented';

// Enhanced Product Information Types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface BrandInfo {
  name: string;
  description?: string;
  website?: string;
  established?: number;
}

// Enhanced User Model
export interface UserPreferences {
  defaultPlatform?: Platform;
  optimizationGoals: OptimizationGoal[];
  industryFocus?: string;
  experienceLevel: ExperienceLevel;
}

export interface UserAnalytics {
  totalOptimizations: number;
  averageSEOScore: number;
  platformUsage: Record<Platform, number>;
  improvementTrends: ImprovementTrend[];
}

export interface ImprovementTrend {
  date: Date;
  seoScore: number;
  qualityScore: number;
  complianceScore: number;
}

export interface UsageStats {
  currentPeriodUsage: number;
  totalUsage: number;
  lastUsageDate?: Date;
  averageOptimizationsPerDay: number;
}

export interface BillingInfo {
  customerId?: string;
  subscriptionId?: string;
  nextBillingDate?: Date;
  paymentMethod?: string;
}

export interface UserSubscription {
  tier: Tier;
  features: string[];
  usageStats: UsageStats;
  billingInfo?: BillingInfo;
}

// Base User interface (maintaining backward compatibility)
export interface User {
  email: string;
  displayName: string;
  photoURL?: string | null;
  tier: Tier;
  usageCount: number;
  usageLimit: number;
  resetDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Enhanced User interface extending base User
export interface EnhancedUser extends User {
  preferences: UserPreferences;
  analytics: UserAnalytics;
  subscription: UserSubscription;
}

// Enhanced Optimization Input
export interface EnhancedOptimizationInput {
  title: string;
  description: string;
  platform: Platform;
  keywords?: string;
  productImages?: ProductImage[];
  productCategory: string;
  targetAudience?: string;
  competitorUrls?: string[];
  priceRange?: PriceRange;
  productSpecifications?: ProductSpecification[];
  brandInformation?: BrandInfo;
  optimizationGoals?: OptimizationGoal[];
}

// Basic Optimization Input (maintaining backward compatibility)
export interface OptimizationInput {
  title: string;
  description: string;
  platform: Platform;
  keywords?: string;
  engine?: 'gemini' | 'deepseek'; // AI engine selection
}
// SEO and Keyword Types
export interface KeywordSet {
  primary: string[];
  secondary: string[];
  longTail: string[];
  synonyms: string[];
  competitors: string[];
}

export interface SEOMetrics {
  seoScore: number;
  keywordDensity: number;
  readabilityScore: number;
  mobileOptimizationScore: number;
}

export interface SEOScore {
  overall: number;
  keywordRelevance: number;
  titleOptimization: number;
  descriptionQuality: number;
  tagEffectiveness: number;
  mobileOptimization: number;
}

export interface CompetitorKeywords {
  platform: Platform;
  keywords: string[];
  frequency: Record<string, number>;
  trends: Record<string, number>;
}

// Compliance Types
export interface ComplianceViolation {
  type: 'prohibited_word' | 'formatting' | 'policy' | 'content_restriction';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
  suggestion?: string;
}

export interface ComplianceRecommendation {
  category: string;
  description: string;
  action: string;
  priority: ImpactLevel;
}

export interface ComplianceResult {
  isCompliant: boolean;
  status: ComplianceStatus;
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
  score: number;
}

export interface ProhibitedWordResult {
  found: boolean;
  words: string[];
  replacements: Record<string, string>;
}

export interface TitleComplianceResult {
  isValid: boolean;
  length: number;
  maxLength: number;
  violations: string[];
  suggestions: string[];
}

export interface PolicyComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  categoryRestrictions: string[];
}

// Quality Assurance Types
export interface QualityMetrics {
  qualityScore: number;
  grammarScore: number;
  completenessScore: number;
  professionalismScore: number;
}

export interface QualityReport {
  overall: QualityMetrics;
  issues: QualityIssue[];
  recommendations: ImprovementRecommendation[];
  mobileOptimization: MobileOptimizationResult;
}

export interface QualityIssue {
  type: 'grammar' | 'spelling' | 'structure' | 'completeness' | 'readability';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  location?: string;
  suggestion?: string;
}

export interface GrammarCheckResult {
  errors: QualityIssue[];
  suggestions: string[];
  score: number;
}

export interface MobileOptimizationResult {
  score: number;
  titleMobileFriendly: boolean;
  descriptionFormatted: boolean;
  readabilityScore: number;
  issues: string[];
  recommendations: string[];
}

export interface ImprovementRecommendation {
  category: ImprovementCategory;
  description: string;
  impact: ImpactLevel;
  implementation: string;
  priority: number;
}

export interface QualityScore {
  overall: number;
  grammar: number;
  structure: number;
  completeness: number;
  readability: number;
  mobile: number;
}

// Platform-Specific Types
export interface AlgorithmFactors {
  platform: Platform;
  rankingFactors: {
    keywordRelevance: number;
    titleOptimization: number;
    descriptionQuality: number;
    imageQuality: number;
    priceCompetitiveness: number;
    sellerPerformance: number;
    customerReviews: number;
    conversionRate: number;
  };
  optimizationWeights: {
    seoOptimization: number;
    userExperience: number;
    mobileOptimization: number;
    complianceAdherence: number;
  };
}

export interface PlatformOptimizedContent {
  platform: Platform;
  title: string;
  description: string;
  tags: string[];
  bulletPoints?: string[];
  backendSearchTerms?: string[];
  itemSpecifics?: Record<string, string>;
  categoryPath?: string[];
}

export interface FormattedListing {
  platform: Platform;
  content: PlatformOptimizedContent;
  formatting: {
    titleLength: number;
    descriptionLength: number;
    tagCount: number;
    bulletPointCount?: number;
  };
  compliance: ComplianceResult;
}

// Enhanced Content Types
export interface BaseContent {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  specifications: ProductSpecification[];
}

export interface KeywordOptimizedContent extends BaseContent {
  optimizedTitle: string;
  optimizedDescription: string;
  integratedKeywords: KeywordSet;
  keywordDensity: Record<string, number>;
}

export interface OptimizedContent extends KeywordOptimizedContent {
  tags: string[];
  seoScore: number;
  improvements: string[];
  backendSearchTerms?: string[];
  bulletPoints?: string[];
}

// Comprehensive Listing Output
export interface ComprehensiveListing {
  id: string;
  platform: Platform;
  optimizedContent: {
    title: string;
    description: string;
    bulletPoints?: string[];
    tags: string[];
    backendSearchTerms?: string[];
    productSpecifications: ProductSpecification[];
    careInstructions?: string;
    packageContents?: string[];
  };
  seoMetrics: SEOMetrics;
  complianceStatus: {
    isCompliant: boolean;
    violations: ComplianceViolation[];
    recommendations: ComplianceRecommendation[];
  };
  qualityMetrics: QualityMetrics;
  improvements: DetailedImprovement[];
  competitiveAnalysis?: CompetitiveAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface DetailedImprovement {
  category: ImprovementCategory;
  description: string;
  impact: ImpactLevel;
  implementation: string;
  beforeValue?: string;
  afterValue?: string;
  metrics?: {
    seoImpact?: number;
    complianceImpact?: number;
    qualityImpact?: number;
  };
}

// Competitive Analysis Types
export interface CompetitiveAnalysis {
  uniqueSellingPropositions: string[];
  competitiveAdvantages: string[];
  marketPositioning: string;
  pricingStrategy: string;
  differentiationFactors: string[];
  recommendations: string[];
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface RecommendationSet {
  seo: ImprovementRecommendation[];
  compliance: ComplianceRecommendation[];
  quality: ImprovementRecommendation[];
  competitive: ImprovementRecommendation[];
}

// Enhanced Platform Rules
export interface EnhancedPlatformRules extends PlatformRules {
  algorithmFactors: AlgorithmFactors;
  prohibitedWords: string[];
  requiredFields: string[];
  optionalFields: string[];
  formatting: {
    titleFormat: string;
    descriptionFormat: string;
    tagFormat: string;
    bulletPointFormat?: string;
  };
  compliance: {
    contentRestrictions: string[];
    categoryRestrictions: string[];
    imageRequirements: string[];
  };
}

// Enhanced Optimization History
export interface OptimizationHistory {
  id: string;
  userId: string;
  originalListing: {
    title: string;
    description: string;
    platform: Platform;
  };
  optimizedListing: ComprehensiveListing;
  performanceMetrics?: {
    viewsIncrease?: number;
    clickThroughRateImprovement?: number;
    conversionRateImprovement?: number;
    rankingImprovement?: number;
  };
  userFeedback?: {
    rating: number;
    comments?: string;
    implementationStatus: ImplementationStatus;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Existing interfaces (maintaining backward compatibility)
export interface Optimization {
  id?: string;
  userId: string;
  platform: Platform;
  original: {
    title: string;
    description: string;
    keywords?: string;
  };
  optimized: OptimizedContent;
  createdAt: Timestamp;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'QUOTA_EXCEEDED' | 'UNAUTHORIZED' | 'INVALID_INPUT' | 'AI_ERROR' | 'SERVER_ERROR' | 'CONFIG_ERROR';
}

export interface PlatformRules {
  name: string;
  titleRange: { min: number; max: number };
  minDescription: number;
  maxTags: number;
  tagFormat: string;
  guidelines: string[];
}

export interface TierLimits {
  free: number;
  basic: number;
  premium: number;
  enterprise?: number;
}
// Service Interface Definitions

// Listing Generator Service Interface
export interface ListingGeneratorService {
  generateOptimizedListing(input: EnhancedOptimizationInput): Promise<ComprehensiveListing>;
  bulkOptimize(inputs: EnhancedOptimizationInput[]): Promise<ComprehensiveListing[]>;
  validateListing(listing: ComprehensiveListing, platform: Platform): Promise<ValidationResult>;
  getOptimizationRecommendations(listing: ComprehensiveListing): Promise<RecommendationSet>;
}

// Platform Engine Interface
export interface PlatformEngine {
  optimizeForPlatform(content: BaseContent, platform: Platform): Promise<PlatformOptimizedContent>;
  validatePlatformCompliance(content: PlatformOptimizedContent, platform: Platform): Promise<ComplianceResult>;
  getAlgorithmFactors(platform: Platform): AlgorithmFactors;
  formatForPlatform(content: OptimizedContent, platform: Platform): Promise<FormattedListing>;
  getPlatformRules(platform: Platform): EnhancedPlatformRules;
}

// SEO Optimizer Interface
export interface SEOOptimizer {
  researchKeywords(productInfo: ProductInfo, platform: Platform): Promise<KeywordSet>;
  integrateKeywords(content: BaseContent, keywords: KeywordSet): Promise<KeywordOptimizedContent>;
  calculateSEOScore(content: OptimizedContent, platform: Platform): Promise<SEOScore>;
  generateBackendSearchTerms(keywords: KeywordSet, platform: Platform): Promise<string[]>;
  analyzeCompetitorKeywords(productCategory: string, platform: Platform): Promise<CompetitorKeywords>;
}

// Compliance Checker Interface
export interface ComplianceChecker {
  validateContent(content: OptimizedContent, platform: Platform): Promise<ComplianceResult>;
  checkProhibitedWords(text: string, platform: Platform): Promise<ProhibitedWordResult>;
  validateTitleCompliance(title: string, platform: Platform): Promise<TitleComplianceResult>;
  checkPolicyCompliance(listing: ComprehensiveListing, platform: Platform): Promise<PolicyComplianceResult>;
  generateComplianceRecommendations(violations: ComplianceViolation[]): Promise<ComplianceRecommendation[]>;
}

// Quality Assurance Service Interface
export interface QualityAssuranceService {
  validateQuality(listing: ComprehensiveListing): Promise<QualityReport>;
  checkGrammarAndSpelling(text: string): Promise<GrammarCheckResult>;
  validateMobileOptimization(listing: ComprehensiveListing): Promise<MobileOptimizationResult>;
  generateImprovementRecommendations(qualityReport: QualityReport): Promise<ImprovementRecommendation[]>;
  calculateQualityScore(listing: ComprehensiveListing): Promise<QualityScore>;
}

// Analytics Service Interface
export interface AnalyticsService {
  trackOptimization(optimization: OptimizationHistory): Promise<void>;
  getPerformanceMetrics(userId: string, timeRange?: DateRange): Promise<PerformanceMetrics>;
  generateInsights(userId: string): Promise<AnalyticsInsights>;
  getCompetitiveAnalysis(productCategory: string, platform: Platform): Promise<CompetitiveAnalysis>;
  trackUserBehavior(userId: string, action: string, metadata?: Record<string, any>): Promise<void>;
}

// Additional Supporting Types
export interface ProductInfo {
  title: string;
  description: string;
  category: string;
  specifications: ProductSpecification[];
  images?: ProductImage[];
  brand?: BrandInfo;
  priceRange?: PriceRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PerformanceMetrics {
  totalOptimizations: number;
  averageSEOScore: number;
  averageQualityScore: number;
  complianceRate: number;
  platformBreakdown: Record<Platform, number>;
  improvementTrends: ImprovementTrend[];
}

export interface AnalyticsInsights {
  topPerformingKeywords: string[];
  bestPlatforms: Platform[];
  improvementOpportunities: string[];
  competitiveAdvantages: string[];
  recommendations: string[];
}

// Error Types
export interface ListingGeneratorError {
  code: 'INVALID_INPUT' | 'PLATFORM_UNSUPPORTED' | 'AI_SERVICE_ERROR' | 'COMPLIANCE_VIOLATION' | 'QUALITY_FAILURE';
  message: string;
  details?: {
    field?: string;
    violations?: ComplianceViolation[];
    suggestions?: string[];
  };
  recoverable: boolean;
}

export interface ServiceError {
  service: string;
  operation: string;
  error: ListingGeneratorError;
  timestamp: Date;
  userId?: string;
}

// Bulk Processing Types
export interface BulkOptimizationRequest {
  inputs: EnhancedOptimizationInput[];
  options?: {
    parallel?: boolean;
    batchSize?: number;
    progressCallback?: (progress: BulkProgress) => void;
  };
}

export interface BulkOptimizationResult {
  results: ComprehensiveListing[];
  errors: BulkError[];
  summary: BulkSummary;
}

export interface BulkProgress {
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
  estimatedTimeRemaining?: number;
}

export interface BulkError {
  index: number;
  input: EnhancedOptimizationInput;
  error: ListingGeneratorError;
}

export interface BulkSummary {
  totalProcessed: number;
  successful: number;
  failed: number;
  averageSEOScore: number;
  averageQualityScore: number;
  processingTime: number;
}

// Enhanced API Response Types
export interface EnhancedApiResponse<T> extends ApiResponse<T> {
  metadata?: {
    processingTime?: number;
    version?: string;
    features?: string[];
  };
  warnings?: string[];
  recommendations?: string[];
}

// Credit System Types
export interface CreditUsage {
  operation: string;
  credits: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TierFeatures {
  tier: Tier;
  features: {
    basicOptimization: boolean;
    bulkOptimization: boolean;
    advancedAnalytics: boolean;
    competitiveAnalysis: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  limits: {
    monthlyOptimizations: number;
    bulkBatchSize: number;
    historyRetention: number; // days
    apiCallsPerMinute: number;
  };
  pricing?: {
    monthly: number;
    yearly: number;
    currency: string;
  };
}

// UI Component Props Types
export interface PlatformSelectorProps {
  selectedPlatform?: Platform;
  onPlatformChange: (platform: Platform) => void;
  showRequirements?: boolean;
  disabled?: boolean;
}

export interface OptimizationFormProps {
  initialData?: Partial<EnhancedOptimizationInput>;
  onSubmit: (data: EnhancedOptimizationInput) => void;
  loading?: boolean;
  platform?: Platform;
}

export interface ResultsDisplayProps {
  original: OptimizationInput;
  optimized: ComprehensiveListing;
  showComparison?: boolean;
  showMetrics?: boolean;
}

export interface QualityDashboardProps {
  userId: string;
  timeRange?: DateRange;
  showTrends?: boolean;
}

// Configuration Types
export interface SystemConfiguration {
  ai: {
    provider: 'gemini' | 'openai' | 'anthropic';
    model: string;
    apiKey: string;
    fallbackModels: string[];
  };
  platforms: {
    enabled: Platform[];
    rules: Record<Platform, EnhancedPlatformRules>;
  };
  features: {
    bulkOptimization: boolean;
    competitiveAnalysis: boolean;
    advancedAnalytics: boolean;
    realTimeValidation: boolean;
  };
  limits: {
    maxTitleLength: number;
    maxDescriptionLength: number;
    maxKeywords: number;
    maxBulkSize: number;
  };
}

// Testing Types (for property-based testing)
export interface TestScenario {
  name: string;
  input: EnhancedOptimizationInput;
  expectedOutcome: Partial<ComprehensiveListing>;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  property: string;
  condition: 'equals' | 'contains' | 'matches' | 'range' | 'custom';
  value: any;
  customValidator?: (actual: any, expected: any) => boolean;
}

export interface PropertyTestConfig {
  iterations: number;
  generators: Record<string, any>;
  shrinking: boolean;
  timeout: number;
}