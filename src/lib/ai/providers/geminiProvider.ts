/**
 * Gemini AI Provider — OPTIMIZED v2
 * - Uses system_instruction for role (cleaner separation)
 * - Temperature 0.3 for consistent JSON output
 * - Robust JSON extraction (handles markdown fences)
 * - Structured output schema enforcement
 */

import { AIProvider, AIGenerationRequest, AIGenerationResponse, AIProviderConfig } from '../types';
import { PromptBuilder } from '../promptBuilder';

export class GeminiProvider implements AIProvider {
  private config: AIProviderConfig;
  private apiKey: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    
    this.config = {
      model: config.model || 'gemini-2.0-flash',
      maxTokens: config.maxTokens || 8192,
      temperature: 0.3, // FIXED: Was 0.7 — lower = consistent JSON, no hallucination
      timeout: config.timeout || 90000,
      apiKey: config.apiKey
    };
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const { systemInstruction, userPrompt } = PromptBuilder.buildPrompt(request);

      console.log('[Gemini] Platform:', request.platform, '| Mode:', request.mode);

      const requestBody = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          responseMimeType: 'application/json' // Forces JSON output — no markdown fences
        }
      };

      const url = `${this.baseURL}/${this.config.model}:generateContent?key=${this.apiKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Gemini] API error:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed: Invalid Gemini API key');
        }
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded: Too many requests to Gemini API');
        }
        
        if (response.status === 400) {
          throw new Error(`Bad request: ${errorData.error?.message || 'Invalid request parameters'}`);
        }
        
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        console.error('[Gemini] Empty response:', JSON.stringify(data).substring(0, 300));
        throw new Error('Empty response from Gemini API');
      }

      // Robust JSON extraction — handles cases where responseMimeType isn't respected
      const parsedResponse = this.extractJSON(responseText);

      if (!this.validateResponse(parsedResponse)) {
        console.error('[Gemini] Invalid response format:', JSON.stringify(parsedResponse).substring(0, 300));
        throw new Error('Invalid response format from Gemini');
      }

      console.log('[Gemini] Response validated successfully');
      return parsedResponse as AIGenerationResponse;

    } catch (error: any) {
      if (error.name === 'AbortError') throw new Error('Request timeout: Gemini API took too long');
      if (error.message.includes('Authentication failed')) throw error;
      if (error.message.includes('Rate limit exceeded')) throw error;
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Network error: Unable to connect to Gemini API');
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Robust JSON extractor — strips markdown fences if present
   */
  private extractJSON(text: string): any {
    // Try direct parse first (works when responseMimeType is respected)
    try {
      return JSON.parse(text);
    } catch {}

    // Strip ```json ... ``` fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {}
    }

    // Find first { ... } block
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {}
    }

    throw new Error('Could not extract valid JSON from Gemini response');
  }

  validateResponse(response: any): boolean {
    if (!response || typeof response !== 'object') return false;

    const requiredFields = ['title', 'bullets', 'description', 'keywords', 'platform_notes'];
    
    for (const field of requiredFields) {
      if (!(field in response)) {
        console.error(`[Gemini] Missing field: ${field}`);
        return false;
      }
    }

    if (typeof response.title !== 'string' || response.title.trim().length === 0) return false;
    if (!Array.isArray(response.bullets) || response.bullets.length === 0) return false;
    if (typeof response.description !== 'string' || response.description.trim().length === 0) return false;
    if (!Array.isArray(response.keywords)) return false;
    if (typeof response.platform_notes !== 'string') return false;
    if (!response.bullets.every((b: any) => typeof b === 'string' && b.trim().length > 0)) return false;
    if (!response.keywords.every((k: any) => typeof k === 'string')) return false;

    return true;
  }

  getName(): string {
    return 'Gemini';
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseURL}/${this.config.model}:generateContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say OK' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
