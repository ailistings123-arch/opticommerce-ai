/**
 * AI Provider Factory - MULTI-PROVIDER with AUTO-FALLBACK
 * Automatically rotates between providers when one hits rate limit
 * Priority: Groq (fastest/free) → Cloudflare (unlimited) → Gemini (backup)
 */

import { AIProvider, AIProviderConfig } from './types';
import { GeminiProvider } from './providers/geminiProvider';
import { GroqProvider } from './providers/groqProvider';
import { CloudflareProvider } from './providers/cloudflareProvider';

export type AIProviderType = 'gemini' | 'groq' | 'cloudflare' | 'openai' | 'anthropic';

export class AIProviderFactory {
  private static instances: Map<string, AIProvider> = new Map();
  private static failedProviders: Map<string, number> = new Map(); // Track failed providers with cooldown

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
      case 'groq':
        provider = new GroqProvider(config);
        break;

      case 'cloudflare':
        provider = new CloudflareProvider(config);
        break;

      case 'gemini':
        provider = new GeminiProvider(config);
        break;
      
      case 'openai':
        throw new Error('OpenAI provider not yet implemented');
      
      case 'anthropic':
        throw new Error('Anthropic provider not yet implemented');
      
      default:
        throw new Error(`Unsupported AI provider: ${type}`);
    }

    // Cache the provider instance
    this.instances.set(cacheKey, provider);

    return provider;
  }

  /**
   * Get default provider with automatic fallback
   * Tries providers in order: Groq → Cloudflare → Gemini
   */
  static getDefaultProvider(): AIProvider {
    const providers = this.getAllAvailableProviders();

    if (providers.length === 0) {
      throw new Error('No AI providers configured. Please set at least one API key in environment variables.');
    }

    // Return first available provider (not in cooldown)
    for (const { type, config } of providers) {
      const cooldownKey = type;
      const cooldownUntil = this.failedProviders.get(cooldownKey);

      // Check if provider is in cooldown
      if (cooldownUntil && Date.now() < cooldownUntil) {
        console.log(`[AIFactory] ${type} in cooldown, skipping...`);
        continue;
      }

      console.log(`[AIFactory] Using provider: ${type}`);
      return this.getProvider(type, config);
    }

    // All providers in cooldown, use first one anyway
    console.log('[AIFactory] All providers in cooldown, using first available');
    const { type, config } = providers[0];
    return this.getProvider(type, config);
  }

  /**
   * Get all available providers in priority order
   */
  private static getAllAvailableProviders(): Array<{ type: AIProviderType; config: AIProviderConfig }> {
    const providers: Array<{ type: AIProviderType; config: AIProviderConfig }> = [];

    // Priority 1: Groq (fastest, 30 req/min free, best model)
    if (process.env.GROQ_API_KEY) {
      providers.push({
        type: 'groq',
        config: {
          apiKey: process.env.GROQ_API_KEY,
          model: 'llama-3.3-70b-versatile', // Best Groq model for SEO
          maxTokens: 8192,
          temperature: 0.3
        }
      });
    }

    // Priority 2: Cloudflare (10,000 req/day free, powerful model)
    if (process.env.CLOUDFLARE_API_KEY && process.env.CLOUDFLARE_ACCOUNT_ID) {
      providers.push({
        type: 'cloudflare',
        config: {
          apiKey: process.env.CLOUDFLARE_API_KEY,
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
          model: '@cf/meta/llama-3.1-70b-instruct', // Best Cloudflare model
          maxTokens: 8192,
          temperature: 0.3
        }
      });
    }

    // Priority 3: Gemini (15 req/min free, Google's best)
    if (process.env.GEMINI_API_KEY) {
      providers.push({
        type: 'gemini',
        config: {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-2.0-flash', // Latest Gemini model
          maxTokens: 8192,
          temperature: 0.3
        }
      });
    }

    return providers;
  }

  /**
   * Mark provider as failed (add to cooldown)
   */
  static markProviderFailed(providerName: string, cooldownMs: number = 60000): void {
    const cooldownUntil = Date.now() + cooldownMs;
    this.failedProviders.set(providerName, cooldownUntil);
    console.log(`[AIFactory] ${providerName} marked as failed, cooldown until ${new Date(cooldownUntil).toISOString()}`);
  }

  /**
   * Get next available provider (for fallback)
   */
  static getNextProvider(currentProvider: string): AIProvider | null {
    const providers = this.getAllAvailableProviders();
    const currentIndex = providers.findIndex(p => p.type === currentProvider);

    // Try next providers
    for (let i = currentIndex + 1; i < providers.length; i++) {
      const { type, config } = providers[i];
      const cooldownKey = type;
      const cooldownUntil = this.failedProviders.get(cooldownKey);

      // Skip if in cooldown
      if (cooldownUntil && Date.now() < cooldownUntil) {
        continue;
      }

      console.log(`[AIFactory] Falling back to: ${type}`);
      return this.getProvider(type, config);
    }

    return null;
  }

  /**
   * Clear provider cache
   */
  static clearCache(): void {
    this.instances.clear();
    this.failedProviders.clear();
  }
}
