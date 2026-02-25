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
    specifications?: Array<{ name: string; value: string; unit?: string }>;
    keywords?: string[];
  };
  imageAnalysis?: {
    mainFeatures: string[];
    colors: string[];
    style: string;
    quality: string;
  };
  mode: 'optimize' | 'create' | 'analyze';
}

export interface AIGenerationResponse {
  title: string;
  bullets: string[];
  description: string;
  keywords: string[];
  platform_notes: string;
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
}
