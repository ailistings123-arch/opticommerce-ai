/**
 * Cloudflare Workers AI Provider - UNLIMITED FREE
 * - 10,000 requests/day FREE
 * - Multiple models available
 * - No credit card needed
 */

import { AIProvider, AIGenerationRequest, AIGenerationResponse, AIProviderConfig } from '../types';
import { PromptBuilder } from '../promptBuilder';

export class CloudflareProvider implements AIProvider {
  private config: AIProviderConfig;
  private apiKey: string;
  private accountId: string;
  private baseURL: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.accountId = config.accountId || '';
    this.baseURL = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run`;
    
    this.config = {
      model: config.model || '@cf/meta/llama-3.1-70b-instruct',
      maxTokens: config.maxTokens || 8192,
      temperature: 0.3,
      timeout: config.timeout || 60000,
      apiKey: config.apiKey,
      accountId: config.accountId
    };
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const { systemInstruction, userPrompt } = PromptBuilder.buildPrompt(request);

      console.log('[Cloudflare] Platform:', request.platform, '| Mode:', request.mode);

      const requestBody = {
        messages: [
          {
            role: 'system',
            content: systemInstruction
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.baseURL}/${this.config.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Cloudflare] API error:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed: Invalid Cloudflare API key');
        }
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded: Too many requests to Cloudflare API');
        }
        
        throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.result?.response || data.result?.content;

      if (!responseText) {
        console.error('[Cloudflare] Empty response:', JSON.stringify(data).substring(0, 300));
        throw new Error('Empty response from Cloudflare API');
      }

      const parsedResponse = this.extractJSON(responseText);

      if (!this.validateResponse(parsedResponse)) {
        console.error('[Cloudflare] Invalid response format:', JSON.stringify(parsedResponse).substring(0, 300));
        throw new Error('Invalid response format from Cloudflare');
      }

      console.log('[Cloudflare] Response validated successfully');
      return parsedResponse as AIGenerationResponse;

    } catch (error: any) {
      if (error.name === 'AbortError') throw new Error('Request timeout: Cloudflare API took too long');
      if (error.message.includes('Authentication failed')) throw error;
      if (error.message.includes('Rate limit exceeded')) throw error;
      throw new Error(`Cloudflare API error: ${error.message}`);
    }
  }

  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {}

    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {}
    }

    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {}
    }

    throw new Error('Could not extract valid JSON from Cloudflare response');
  }

  validateResponse(response: any): boolean {
    if (!response || typeof response !== 'object') return false;

    const requiredFields = ['title', 'bullets', 'description', 'keywords', 'platform_notes'];
    
    for (const field of requiredFields) {
      if (!(field in response)) {
        console.error(`[Cloudflare] Missing field: ${field}`);
        return false;
      }
    }

    if (typeof response.title !== 'string' || response.title.trim().length === 0) return false;
    if (!Array.isArray(response.bullets) || response.bullets.length === 0) return false;
    if (typeof response.description !== 'string' || response.description.trim().length === 0) return false;
    if (!Array.isArray(response.keywords)) return false;
    if (typeof response.platform_notes !== 'string') return false;

    return true;
  }

  getName(): string {
    return 'Cloudflare';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/${this.config.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
