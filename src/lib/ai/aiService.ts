/**
 * AI Service — v2 with Auto-Training
 * 
 * NEW: After every successful generation, if SEO score >= 90,
 * the output is automatically saved to Firestore as a training example.
 * Future requests for the same platform+category will use these examples.
 * The system gets smarter with every single use.
 */

import { AIProviderFactory } from './aiProviderFactory';
import { ResponseValidator } from './responseValidator';
import { AIGenerationRequest, AIGenerationResponse } from './types';
import { QualityScore } from './scoringSystem';
import { Platform } from '@/types';
import { TrainingExamplesService } from '@/lib/services/TrainingExamplesService';

export interface GenerationResult {
  listing: AIGenerationResponse;
  qualityScore?: QualityScore;
  warnings: string[];
}

export interface GenerationOptions {
  maxRetries?: number;
  validateResponse?: boolean;
  sanitizeInput?: boolean;
}

export class AIService {
  private static readonly DEFAULT_OPTIONS: GenerationOptions = {
    maxRetries: 2,
    validateResponse: true,
    sanitizeInput: true
  };

  static async generateListing(
    request: AIGenerationRequest,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    if (opts.sanitizeInput) {
      request = this.sanitizeRequest(request);
    }

    let provider = AIProviderFactory.getDefaultProvider();
    let currentProviderName = provider.getName();
    let lastError: Error | null = null;
    let attempts = 0;
    let providerSwitches = 0;
    const maxProviderSwitches = 3; // Try up to 3 different providers

    while (attempts <= (opts.maxRetries || 0)) {
      try {
        console.log(`[AIService] Attempt ${attempts + 1}/${(opts.maxRetries || 0) + 1} using ${currentProviderName}`);

        const response = await provider.generate(request);

        if (opts.validateResponse) {
          const validation = ResponseValidator.validate(
            response,
            request.platform as Platform
          );

          if (!validation.isValid) {
            console.error('[AIService] Validation failed:', validation.errors);
            
            if (attempts < (opts.maxRetries || 0)) {
              attempts++;
              continue;
            }

            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
          }

          if (validation.warnings.length > 0) {
            console.warn('[AIService] Warnings:', validation.warnings);
          }

          const result: GenerationResult = {
            listing:      validation.sanitizedResponse!,
            qualityScore: validation.qualityScore,
            warnings:     validation.warnings
          };

          // ── AUTO-TRAINING: Save high-scoring outputs ─────────────────────
          // This is what makes the system improve over time.
          // High-scoring outputs become training examples for future requests.
          const seoScore = validation.qualityScore?.percentage || 0;
          
          if (seoScore >= 90) {
            // Fire and forget — never blocks the response
            TrainingExamplesService.saveIfWorthy({
              platform:  request.platform,
              category:  request.productData.category,
              mode:      request.mode,
              seoScore,
              input: {
                title:       request.productData.title,
                description: request.productData.description,
                keywords:    request.productData.keywords,
                category:    request.productData.category
              },
              output: {
                title:       validation.sanitizedResponse!.title,
                bullets:     validation.sanitizedResponse!.bullets,
                description: validation.sanitizedResponse!.description,
                keywords:    validation.sanitizedResponse!.keywords
              }
            }).then(saved => {
              if (saved) {
                console.log(`[AIService] High-scoring output (${seoScore}%) saved to training pool`);
              }
            }).catch(() => {}); // silent fail — never affect user response
          }
          // ─────────────────────────────────────────────────────────────────

          return result;
        }

        return { listing: response, warnings: [] };

      } catch (error: any) {
        lastError = error;
        console.error(`[AIService] Attempt ${attempts + 1} failed:`, error.message);

        // Check if it's a rate limit error - try fallback provider
        if (error.message.includes('Rate limit exceeded') && providerSwitches < maxProviderSwitches) {
          console.log(`[AIService] Rate limit hit on ${currentProviderName}, trying fallback provider...`);
          
          // Mark current provider as failed
          AIProviderFactory.markProviderFailed(currentProviderName.toLowerCase(), 60000); // 60s cooldown
          
          // Try to get next provider
          const nextProvider = AIProviderFactory.getNextProvider(currentProviderName.toLowerCase());
          
          if (nextProvider) {
            provider = nextProvider;
            currentProviderName = provider.getName();
            providerSwitches++;
            console.log(`[AIService] Switched to ${currentProviderName} (switch ${providerSwitches}/${maxProviderSwitches})`);
            // Don't increment attempts, just retry with new provider
            continue;
          } else {
            console.log('[AIService] No fallback providers available');
          }
        }

        if (error.message.includes('Authentication failed')) throw error;

        attempts++;

        if (attempts <= (opts.maxRetries || 0)) {
          const delay = Math.min(1000 * Math.pow(2, attempts), 5000);
          console.log(`[AIService] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed after ${attempts} attempts and ${providerSwitches} provider switches: ${lastError?.message || 'Unknown error'}`
    );
  }

  private static sanitizeRequest(request: AIGenerationRequest): AIGenerationRequest {
    const sanitized = { ...request };

    if (sanitized.productData.title)
      sanitized.productData.title = ResponseValidator.sanitizeInput(sanitized.productData.title);

    if (sanitized.productData.description)
      sanitized.productData.description = ResponseValidator.sanitizeInput(sanitized.productData.description);

    if (sanitized.productData.category)
      sanitized.productData.category = ResponseValidator.sanitizeInput(sanitized.productData.category);

    if (sanitized.productData.keywords)
      sanitized.productData.keywords = sanitized.productData.keywords.map(k =>
        ResponseValidator.sanitizeInput(k)
      );

    return sanitized;
  }

  static async testConnection(): Promise<{
    success: boolean;
    provider: string;
    message: string;
  }> {
    try {
      const provider = AIProviderFactory.getDefaultProvider();
      
      await provider.generate({
        platform:    'amazon',
        productData: { title: 'Test Product', description: 'Test', keywords: ['test'] },
        mode:        'create'
      });

      return { success: true, provider: provider.getName(), message: 'Connection successful' };
    } catch (error: any) {
      return { success: false, provider: 'Gemini', message: error.message };
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
