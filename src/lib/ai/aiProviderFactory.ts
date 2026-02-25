/**
 * AI Provider Factory
 * Creates and manages AI provider instances
 */

import { AIProvider, AIProviderConfig } from './types';
import { GeminiProvider } from './providers/geminiProvider';

export type AIProviderType = 'gemini' | 'openai' | 'anthropic';

export class AIProviderFactory {
  private static instances: Map<string, AIProvider> = new Map();

  /**
   * Get AI provider instance
   */
  static getProvider(type: AIProviderType, config: AIProviderConfig): AIProvider {
    const cacheKey = `${type}-${config.model}`;

    // Return cached instance if available
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    // Create new provider instance
    let provider: AIProvider;

    switch (type) {
      case 'gemini':
        provider = new GeminiProvider(config);
        break;
      
      case 'openai':
        // Future: Implement OpenAI provider
        throw new Error('OpenAI provider not yet implemented');
      
      case 'anthropic':
        // Future: Implement Anthropic provider
        throw new Error('Anthropic provider not yet implemented');
      
      default:
        throw new Error(`Unsupported AI provider: ${type}`);
    }

    // Cache the provider instance
    this.instances.set(cacheKey, provider);

    return provider;
  }

  /**
   * Get default provider (Gemini)
   */
  static getDefaultProvider(): AIProvider {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    return this.getProvider('gemini', {
      apiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      maxTokens: 8192,
      temperature: 0.7
    });
  }

  /**
   * Clear provider cache
   */
  static clearCache(): void {
    this.instances.clear();
  }
}
