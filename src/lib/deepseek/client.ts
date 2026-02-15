/**
 * DeepSeek AI Client Module
 * 
 * This module handles all communication with the DeepSeek API for e-commerce
 * listing optimization. It provides configuration management, API key validation,
 * and error handling for the DeepSeek integration.
 * 
 * Requirements: 1.2, 1.5, 10.1
 */

/**
 * Configuration interface for DeepSeek API client
 */
export interface DeepSeekConfig {
  apiKey: string;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  response_format: { type: 'json_object' };
}

/**
 * DeepSeek API Request interface
 * 
 * Represents the structure of requests sent to the DeepSeek API.
 * Requirements: 1.3, 1.4, 10.2, 10.3, 10.4, 10.5, 10.6
 */
export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  response_format: { type: 'json_object' };
}

/**
 * DeepSeek API Response interface
 * 
 * Represents the structure of responses received from the DeepSeek API.
 */
export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string; // JSON string containing optimized content
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Error codes for DeepSeek client operations
 */
export enum DeepSeekErrorCode {
  API_KEY_MISSING = 'DEEPSEEK_API_KEY_MISSING',
  API_KEY_INVALID = 'DEEPSEEK_API_KEY_INVALID',
  API_UNAVAILABLE = 'DEEPSEEK_API_UNAVAILABLE',
  QUOTA_EXCEEDED = 'DEEPSEEK_QUOTA_EXCEEDED',
  INVALID_RESPONSE = 'DEEPSEEK_INVALID_RESPONSE',
  JSON_PARSE_ERROR = 'DEEPSEEK_JSON_PARSE_ERROR',
  VALIDATION_FAILED = 'DEEPSEEK_VALIDATION_FAILED',
  NETWORK_ERROR = 'DEEPSEEK_NETWORK_ERROR',
  TIMEOUT = 'DEEPSEEK_TIMEOUT'
}

/**
 * Custom error class for DeepSeek operations
 */
export class DeepSeekError extends Error {
  code: DeepSeekErrorCode;
  details?: any;
  recoverable: boolean;

  constructor(code: DeepSeekErrorCode, message: string, details?: any, recoverable: boolean = false) {
    super(message);
    this.name = 'DeepSeekError';
    this.code = code;
    this.details = details;
    this.recoverable = recoverable;
  }
}

/**
 * Default configuration values for DeepSeek API
 */
const DEFAULT_CONFIG: Omit<DeepSeekConfig, 'apiKey'> = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 4000,
  top_p: 0.95,
  frequency_penalty: 0.3,
  presence_penalty: 0.1,
  response_format: { type: 'json_object' }
};

/**
 * DeepSeek API Client
 * 
 * Manages configuration and provides methods for interacting with the DeepSeek API.
 * Validates API key on initialization and throws descriptive errors for missing/invalid keys.
 */
export class DeepSeekClient {
  private config: DeepSeekConfig;

  /**
   * Initialize DeepSeek client with API key validation
   * 
   * @throws {DeepSeekError} If API key is missing or invalid
   */
  constructor(customConfig?: Partial<DeepSeekConfig>) {
    // Read API key from environment variable
    const apiKey = process.env.DEEPSEEK_API_KEY || '';

    // Validate API key presence (Requirement 1.5, 10.1)
    if (!apiKey) {
      throw new DeepSeekError(
        DeepSeekErrorCode.API_KEY_MISSING,
        'DEEPSEEK_API_KEY environment variable is not set. Please configure your DeepSeek API key in the .env.local file.',
        { 
          hint: 'Add DEEPSEEK_API_KEY=your_api_key_here to your .env.local file',
          documentation: 'https://platform.deepseek.com/api-keys'
        },
        false
      );
    }

    // Validate API key format (basic validation)
    if (apiKey.length < 10 || !apiKey.trim()) {
      throw new DeepSeekError(
        DeepSeekErrorCode.API_KEY_INVALID,
        'DEEPSEEK_API_KEY appears to be invalid. Please check your API key format.',
        { 
          hint: 'API key should be a valid string from DeepSeek platform',
          providedLength: apiKey.length
        },
        false
      );
    }

    // Merge default config with custom config (Requirement 1.2)
    this.config = {
      ...DEFAULT_CONFIG,
      apiKey,
      ...customConfig
    };

    console.log('✅ DeepSeek client initialized successfully');
  }

  /**
   * Get current configuration (excluding sensitive API key)
   */
  getConfig(): Omit<DeepSeekConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Get the full configuration (for internal use only)
   * @internal
   */
  getFullConfig(): DeepSeekConfig {
    return { ...this.config };
  }

  /**
   * Validate API key by checking format and presence
   * 
   * @returns {boolean} True if API key is valid
   */
  validateApiKey(): boolean {
    const { apiKey } = this.config;
    return apiKey.length >= 10 && apiKey.trim().length > 0;
  }

  /**
   * Update configuration values
   * 
   * @param updates Partial configuration to update
   */
  updateConfig(updates: Partial<Omit<DeepSeekConfig, 'apiKey'>>): void {
    this.config = {
      ...this.config,
      ...updates
    };
  }

  /**
   * Build a DeepSeek API request with proper configuration
   * 
   * Creates a properly formatted request object with all required configuration
   * parameters including temperature, max_tokens, top_p, frequency_penalty,
   * presence_penalty, and JSON response format specification.
   * 
   * Requirements: 1.3, 1.4, 10.2, 10.3, 10.4, 10.5, 10.6
   * 
   * @param systemPrompt The system prompt defining AI behavior
   * @param userPrompt The user prompt with optimization instructions
   * @returns A complete DeepSeekRequest object ready to send to the API
   */
  buildRequest(systemPrompt: string, userPrompt: string): DeepSeekRequest {
    return {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
      top_p: this.config.top_p,
      frequency_penalty: this.config.frequency_penalty,
      presence_penalty: this.config.presence_penalty,
      response_format: this.config.response_format
    };
  }
}

/**
 * Create and export a singleton instance of DeepSeek client
 * 
 * This function safely initializes the client and handles errors gracefully.
 * If initialization fails, it logs a warning but doesn't throw to prevent
 * application crashes when DeepSeek is not configured.
 */
let deepSeekClientInstance: DeepSeekClient | null = null;

export function getDeepSeekClient(): DeepSeekClient {
  if (!deepSeekClientInstance) {
    try {
      deepSeekClientInstance = new DeepSeekClient();
    } catch (error) {
      if (error instanceof DeepSeekError) {
        console.warn(`⚠️ DeepSeek client initialization failed: ${error.message}`);
        throw error;
      }
      throw error;
    }
  }
  return deepSeekClientInstance;
}

/**
 * Check if DeepSeek is available (API key is configured)
 */
export function isDeepSeekAvailable(): boolean {
  try {
    const client = getDeepSeekClient();
    return client.validateApiKey();
  } catch (error) {
    return false;
  }
}

/**
 * Sleep utility for retry delays
 * 
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call DeepSeek API with retry logic and timeout
 * 
 * Implements exponential backoff retry strategy with 3 attempts:
 * - Attempt 1: Immediate
 * - Attempt 2: 1 second delay
 * - Attempt 3: 2 seconds delay
 * - Attempt 4: 4 seconds delay
 * 
 * Each request has a 30-second timeout.
 * 
 * Requirements: 9.1, 9.2, 9.3
 * 
 * @param request The DeepSeek API request
 * @param client The DeepSeek client instance
 * @returns The API response
 * @throws {DeepSeekError} For various error conditions
 */
export async function callDeepSeekAPI(
  request: DeepSeekRequest,
  client: DeepSeekClient
): Promise<DeepSeekResponse> {
  const maxAttempts = 3;
  const timeoutMs = 30000; // 30 seconds
  const apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 DeepSeek API call attempt ${attempt}/${maxAttempts}`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        // Make API call with timeout
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${client.getFullConfig().apiKey}`
          },
          body: JSON.stringify(request),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle HTTP errors
        if (!response.ok) {
          const errorBody = await response.text();
          let errorData: any = {};
          
          try {
            errorData = JSON.parse(errorBody);
          } catch {
            // Error body is not JSON
          }
          
          // Handle specific error codes
          if (response.status === 401) {
            throw new DeepSeekError(
              DeepSeekErrorCode.API_KEY_INVALID,
              'DeepSeek API key is invalid or unauthorized',
              { status: response.status, error: errorData },
              false
            );
          }
          
          if (response.status === 429) {
            throw new DeepSeekError(
              DeepSeekErrorCode.QUOTA_EXCEEDED,
              'DeepSeek API quota exceeded. Please check your usage limits or upgrade your plan.',
              { status: response.status, error: errorData },
              true // Recoverable - user can retry later
            );
          }
          
          if (response.status >= 500) {
            throw new DeepSeekError(
              DeepSeekErrorCode.API_UNAVAILABLE,
              `DeepSeek API is temporarily unavailable (HTTP ${response.status})`,
              { status: response.status, error: errorData },
              true // Recoverable - can retry
            );
          }
          
          // Other HTTP errors
          throw new DeepSeekError(
            DeepSeekErrorCode.API_UNAVAILABLE,
            `DeepSeek API request failed with status ${response.status}`,
            { status: response.status, error: errorData },
            false
          );
        }
        
        // Parse successful response
        const data: DeepSeekResponse = await response.json();
        
        // Validate response structure
        if (!data.choices || data.choices.length === 0) {
          throw new DeepSeekError(
            DeepSeekErrorCode.INVALID_RESPONSE,
            'DeepSeek API returned an invalid response structure',
            { response: data },
            false
          );
        }
        
        console.log(`✅ DeepSeek API call successful (attempt ${attempt})`);
        console.log(`📊 Token usage: ${data.usage.total_tokens} tokens (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
        
        return data;
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout
        if (error.name === 'AbortError') {
          throw new DeepSeekError(
            DeepSeekErrorCode.TIMEOUT,
            `DeepSeek API request timed out after ${timeoutMs / 1000} seconds`,
            { attempt, timeoutMs },
            true // Recoverable - can retry
          );
        }
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new DeepSeekError(
            DeepSeekErrorCode.NETWORK_ERROR,
            'Network error occurred while calling DeepSeek API. Please check your internet connection.',
            { attempt, originalError: error.message },
            true // Recoverable - can retry
          );
        }
        
        // Re-throw DeepSeekError instances
        if (error instanceof DeepSeekError) {
          throw error;
        }
        
        // Wrap other errors
        throw new DeepSeekError(
          DeepSeekErrorCode.NETWORK_ERROR,
          `Unexpected error during DeepSeek API call: ${error.message}`,
          { attempt, originalError: error },
          true
        );
      }
      
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry for non-recoverable errors
      if (error instanceof DeepSeekError && !error.recoverable) {
        console.error(`❌ DeepSeek API call failed (non-recoverable): ${error.message}`);
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        console.error(`❌ DeepSeek API call failed after ${maxAttempts} attempts`);
        throw error;
      }
      
      // Calculate exponential backoff delay: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.warn(`⚠️ DeepSeek API call failed (attempt ${attempt}/${maxAttempts}): ${(error as Error).message}`);
      console.log(`⏳ Retrying in ${delayMs / 1000} seconds...`);
      
      // Wait before retrying
      await sleep(delayMs);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new DeepSeekError(
    DeepSeekErrorCode.API_UNAVAILABLE,
    'DeepSeek API call failed after all retry attempts',
    { maxAttempts },
    false
  );
}

/**
 * Main optimization function
 * 
 * Generates optimized e-commerce content using DeepSeek AI.
 * Supports three modes: optimize_existing, create_new, analyze_url
 * 
 * Requirements: 1.1, 4.4, 4.5, 6.1, 6.2, 7.1-7.7
 */

import { Platform } from '@/types';
import { 
  DEEPSEEK_SYSTEM_PROMPT, 
  getOptimizationPrompt 
} from './prompts';
import {
  extractJsonFromResponse,
  validateDeepSeekResponse,
  runQualityChecklist,
  DeepSeekOptimizedContent
} from './validation';

export type OptimizationMode = 'optimize_existing' | 'create_new' | 'analyze_url';

/**
 * Generate optimized content using DeepSeek AI
 * 
 * @param mode Optimization mode
 * @param data Mode-specific data
 * @param platform Target platform
 * @returns Optimized content with quality metrics
 */
export async function generateOptimizedContent(
  mode: OptimizationMode,
  data: any,
  platform: Platform
): Promise<DeepSeekOptimizedContent & { qualityChecks: any; characterUtilization: any; keywordDensity: number }> {
  console.log(`🚀 Starting DeepSeek optimization (mode: ${mode}, platform: ${platform})`);
  
  try {
    // Get DeepSeek client
    const client = getDeepSeekClient();
    
    // Build prompt based on mode
    const userPrompt = getOptimizationPrompt(mode, { ...data, platform });
    
    // Build API request
    const request = client.buildRequest(DEEPSEEK_SYSTEM_PROMPT, userPrompt);
    
    // Call DeepSeek API
    console.log('📡 Calling DeepSeek API...');
    const response = await callDeepSeekAPI(request, client);
    
    // Extract JSON from response
    console.log('🔍 Extracting JSON from response...');
    const content = response.choices[0].message.content;
    let parsedContent: any;
    
    try {
      parsedContent = extractJsonFromResponse(content);
    } catch (error) {
      throw new DeepSeekError(
        DeepSeekErrorCode.JSON_PARSE_ERROR,
        'Failed to extract valid JSON from DeepSeek response',
        { content, error: (error as Error).message },
        false
      );
    }
    
    // Validate response
    console.log('✅ Validating response structure...');
    const validationResult = validateDeepSeekResponse(parsedContent);
    
    if (!validationResult.valid) {
      throw new DeepSeekError(
        DeepSeekErrorCode.VALIDATION_FAILED,
        'DeepSeek response failed validation',
        { 
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          response: parsedContent
        },
        false
      );
    }
    
    if (validationResult.warnings.length > 0) {
      console.warn('⚠️ Validation warnings:', validationResult.warnings);
    }
    
    // Run quality checklist
    console.log('📋 Running quality checklist...');
    const qualityChecks = runQualityChecklist(parsedContent, platform);
    
    if (!qualityChecks.passed) {
      console.warn('⚠️ Quality checklist warnings:', qualityChecks.warnings);
    }
    
    // Calculate additional metrics
    const allKeywords = [
      ...parsedContent.keywords.primary,
      ...parsedContent.keywords.secondary,
      ...parsedContent.keywords.longTail
    ];
    
    const fullText = `${parsedContent.title} ${parsedContent.bullets.join(' ')} ${parsedContent.description}`;
    const keywordDensity = qualityChecks.checks.keywordDensity.actual;
    
    const characterUtilization = {
      title: qualityChecks.checks.titleCharUtilization.actual,
      bullets: parsedContent.bullets.reduce((sum: number, b: string) => sum + b.length, 0),
      description: parsedContent.description.length
    };
    
    console.log('✨ Optimization complete!');
    console.log(`📊 Quality Score: ${qualityChecks.score}/100`);
    console.log(`📝 Title: ${parsedContent.title.length} chars (${Math.round(characterUtilization.title * 100)}% utilization)`);
    console.log(`🔹 Bullets: ${characterUtilization.bullets} chars total`);
    console.log(`📄 Description: ${characterUtilization.description} chars`);
    console.log(`🔑 Keywords: ${allKeywords.length} total (${(keywordDensity * 100).toFixed(2)}% density)`);
    
    return {
      ...parsedContent,
      qualityChecks,
      characterUtilization,
      keywordDensity
    };
    
  } catch (error) {
    if (error instanceof DeepSeekError) {
      console.error(`❌ DeepSeek optimization failed: ${error.message}`);
      throw error;
    }
    
    console.error('❌ Unexpected error during optimization:', error);
    throw new DeepSeekError(
      DeepSeekErrorCode.API_UNAVAILABLE,
      `Unexpected error during optimization: ${(error as Error).message}`,
      { originalError: error },
      false
    );
  }
}
