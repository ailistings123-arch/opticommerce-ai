/**
 * AI Provider Types
 * Defines interfaces for AI model integration
 */

export interface AIGenerationRequest {
  platform: string;
  productData: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    brand?: string;
    specifications?: Array<{ name: string; value: string; unit?: string }>;
    keywords?: string[];
    productType?: string;
  };
  imageAnalysis?: {
    mainFeatures: string[];
    colors: string[];
    style: string;
    quality: string;
  };
  gapAnalysis?: GapAnalysis;
  mode: 'optimize' | 'create' | 'analyze';
}

export interface GapAnalysis {
  platform: string;
  currentTitle: string;
  currentTitleLength: number;
  titleLimit: number;
  titleUtilization: number; // percentage
  missingElements: string[];
  seoIssues: string[];
  extractedData: {
    productName?: string;
    brand?: string;
    model?: string;
    material?: string;
    dimensions?: string;
    price?: string;
    seller?: string;
    specifications: Array<{ name: string; value: string }>;
  };
  summary: string; // 2-3 sentence gap analysis summary
}

export interface AIGenerationResponse {
  title: string;
  bullets: string[];
  description: string; // HTML formatted with <h2> and <ul> tags
  keywords: string[];
  platform_notes: string;
  // Stage 3 structured output
  analysisReport?: string; // 2-3 sentences on SEO improvements
  backendKeywordBank?: string[]; // 10 unique long-tail keywords not in title
  gapAnalysis?: GapAnalysis;
}

export interface AIProvider {
  generate(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  validateResponse(response: any): boolean;
  getName(): string;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  accountId?: string; // For Cloudflare Workers AI
}
