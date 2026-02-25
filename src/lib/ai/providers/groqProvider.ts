/**
 * Groq AI Provider - FREE & FAST
 * - 30 requests/minute FREE
 * - 14,400 requests/day FREE
 * - Uses Llama 3.1 70B (excellent quality)
 * - Super fast responses
 */

import { AIProvider, AIGenerationRequest, AIGenerationResponse, AIProviderConfig } from '../types';
import { PromptBuilder } from '../promptBuilder';

export class GroqProvider implements AIProvider {
  private config: AIProviderConfig;
  private apiKey: string;
  private baseURL: string = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    
    this.config = {
      model: config.model || 'llama-3.3-70b-versatile',
      maxTokens: config.maxTokens || 8192,
      temperature: 0.3,
      timeout: config.timeout || 60000,
      apiKey: config.apiKey
    };
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const { systemInstruction, userPrompt } = PromptBuilder.buildPrompt(request);

      console.log('[Groq] Platform:', request.platform, '| Mode:', request.mode);

      const requestBody = {
        model: this.config.model,
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
        max_tokens: this.config.maxTokens,
        response_format: { type: 'json_object' }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.baseURL, {
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
        console.error('[Groq] API error:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed: Invalid Groq API key');
        }
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded: Too many requests to Groq API');
        }
        
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content;

      if (!responseText) {
        console.error('[Groq] Empty response:', JSON.stringify(data).substring(0, 300));
        throw new Error('Empty response from Groq API');
      }

      const parsedResponse = this.extractJSON(responseText);

      if (!this.validateResponse(parsedResponse)) {
        console.error('[Groq] Invalid response format:', JSON.stringify(parsedResponse).substring(0, 300));
        throw new Error('Invalid response format from Groq');
      }

      console.log('[Groq] Response validated successfully');
      return parsedResponse as AIGenerationResponse;

    } catch (error: any) {
      if (error.name === 'AbortError') throw new Error('Request timeout: Groq API took too long');
      if (error.message.includes('Authentication failed')) throw error;
      if (error.message.includes('Rate limit exceeded')) throw error;
      throw new Error(`Groq API error: ${error.message}`);
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

    throw new Error('Could not extract valid JSON from Groq response');
  }

  validateResponse(response: any): boolean {
    if (!response || typeof response !== 'object') return false;

    const requiredFields = ['title', 'bullets', 'description', 'keywords', 'platform_notes'];
    
    for (const field of requiredFields) {
      if (!(field in response)) {
        console.error(`[Groq] Missing field: ${field}`);
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
    return 'Groq';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
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
