/**
 * Unit tests for DeepSeek Client
 * 
 * Tests configuration, API key validation, error handling, and API calls
 */

import { DeepSeekClient, DeepSeekError, DeepSeekErrorCode, isDeepSeekAvailable, callDeepSeekAPI, DeepSeekResponse } from '../client';

describe('DeepSeek Client', () => {
  const originalEnv = process.env.DEEPSEEK_API_KEY;

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv) {
      process.env.DEEPSEEK_API_KEY = originalEnv;
    } else {
      delete process.env.DEEPSEEK_API_KEY;
    }
  });

  describe('Configuration', () => {
    it('should throw error when API key is missing', () => {
      delete process.env.DEEPSEEK_API_KEY;
      
      expect(() => new DeepSeekClient()).toThrow(DeepSeekError);
      expect(() => new DeepSeekClient()).toThrow('DEEPSEEK_API_KEY environment variable is not set');
    });

    it('should throw error with correct error code when API key is missing', () => {
      delete process.env.DEEPSEEK_API_KEY;
      
      try {
        new DeepSeekClient();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(DeepSeekError);
        expect((error as DeepSeekError).code).toBe(DeepSeekErrorCode.API_KEY_MISSING);
        expect((error as DeepSeekError).recoverable).toBe(false);
      }
    });

    it('should throw error when API key is invalid (too short)', () => {
      process.env.DEEPSEEK_API_KEY = 'short';
      
      expect(() => new DeepSeekClient()).toThrow(DeepSeekError);
      expect(() => new DeepSeekClient()).toThrow('appears to be invalid');
    });

    it('should throw error when API key is empty string', () => {
      process.env.DEEPSEEK_API_KEY = '   ';
      
      expect(() => new DeepSeekClient()).toThrow(DeepSeekError);
      expect(() => new DeepSeekClient()).toThrow('appears to be invalid');
    });

    it('should initialize successfully with valid API key', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      expect(client).toBeInstanceOf(DeepSeekClient);
    });

    it('should use default configuration values', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      const config = client.getConfig();
      
      expect(config.model).toBe('deepseek-chat');
      expect(config.temperature).toBe(0.7);
      expect(config.max_tokens).toBe(4000);
      expect(config.top_p).toBe(0.95);
      expect(config.frequency_penalty).toBe(0.3);
      expect(config.presence_penalty).toBe(0.1);
      expect(config.response_format).toEqual({ type: 'json_object' });
    });

    it('should allow custom configuration values', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient({
        temperature: 0.8,
        max_tokens: 5000
      });
      const config = client.getConfig();
      
      expect(config.temperature).toBe(0.8);
      expect(config.max_tokens).toBe(5000);
      // Other values should remain default
      expect(config.model).toBe('deepseek-chat');
      expect(config.top_p).toBe(0.95);
    });

    it('should not expose API key in getConfig()', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      const config = client.getConfig();
      
      expect(config).not.toHaveProperty('apiKey');
    });
  });

  describe('API Key Validation', () => {
    it('should validate API key correctly', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      expect(client.validateApiKey()).toBe(true);
    });

    it('should return false for invalid API key after initialization', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      const client = new DeepSeekClient();
      
      // Manually corrupt the config (for testing purposes)
      const fullConfig = client.getFullConfig();
      fullConfig.apiKey = '';
      
      expect(client.validateApiKey()).toBe(false);
    });
  });

  describe('Configuration Updates', () => {
    it('should allow updating configuration', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      client.updateConfig({ temperature: 0.9 });
      
      const config = client.getConfig();
      expect(config.temperature).toBe(0.9);
    });

    it('should not allow updating API key through updateConfig', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      const originalKey = client.getFullConfig().apiKey;
      
      // updateConfig doesn't accept apiKey parameter
      client.updateConfig({ temperature: 0.9 });
      
      expect(client.getFullConfig().apiKey).toBe(originalKey);
    });
  });

  describe('isDeepSeekAvailable', () => {
    it('should return false when API key is not configured', () => {
      delete process.env.DEEPSEEK_API_KEY;
      
      expect(isDeepSeekAvailable()).toBe(false);
    });

    it('should return true when API key is configured', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      expect(isDeepSeekAvailable()).toBe(true);
    });
  });

  describe('Error Details', () => {
    it('should include helpful details in API key missing error', () => {
      delete process.env.DEEPSEEK_API_KEY;
      
      try {
        new DeepSeekClient();
        fail('Should have thrown an error');
      } catch (error) {
        const deepSeekError = error as DeepSeekError;
        expect(deepSeekError.details).toBeDefined();
        expect(deepSeekError.details.hint).toContain('.env.local');
        expect(deepSeekError.details.documentation).toBeDefined();
      }
    });

    it('should include helpful details in API key invalid error', () => {
      process.env.DEEPSEEK_API_KEY = 'short';
      
      try {
        new DeepSeekClient();
        fail('Should have thrown an error');
      } catch (error) {
        const deepSeekError = error as DeepSeekError;
        expect(deepSeekError.details).toBeDefined();
        expect(deepSeekError.details.hint).toBeDefined();
        expect(deepSeekError.details.providedLength).toBe(5);
      }
    });
  });

  describe('Request Builder', () => {
    it('should build request with all required configuration parameters', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      const request = client.buildRequest('System prompt', 'User prompt');
      
      // Verify all configuration parameters are included (Requirements 1.3, 10.2-10.6)
      expect(request.model).toBe('deepseek-chat');
      expect(request.temperature).toBe(0.7);
      expect(request.max_tokens).toBe(4000);
      expect(request.top_p).toBe(0.95);
      expect(request.frequency_penalty).toBe(0.3);
      expect(request.presence_penalty).toBe(0.1);
    });

    it('should include JSON response format specification', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      const request = client.buildRequest('System prompt', 'User prompt');
      
      // Verify JSON response format is specified (Requirement 1.4)
      expect(request.response_format).toEqual({ type: 'json_object' });
    });

    it('should build request with correct message structure', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      const systemPrompt = 'You are an expert e-commerce copywriter';
      const userPrompt = 'Optimize this product listing';
      const request = client.buildRequest(systemPrompt, userPrompt);
      
      expect(request.messages).toHaveLength(2);
      expect(request.messages[0]).toEqual({
        role: 'system',
        content: systemPrompt
      });
      expect(request.messages[1]).toEqual({
        role: 'user',
        content: userPrompt
      });
    });

    it('should use custom configuration values in request', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient({
        temperature: 0.8,
        max_tokens: 5000,
        top_p: 0.9
      });
      const request = client.buildRequest('System prompt', 'User prompt');
      
      expect(request.temperature).toBe(0.8);
      expect(request.max_tokens).toBe(5000);
      expect(request.top_p).toBe(0.9);
      // Other values should remain default
      expect(request.frequency_penalty).toBe(0.3);
      expect(request.presence_penalty).toBe(0.1);
    });

    it('should reflect updated configuration in request', () => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      
      const client = new DeepSeekClient();
      client.updateConfig({ temperature: 0.9, max_tokens: 6000 });
      const request = client.buildRequest('System prompt', 'User prompt');
      
      expect(request.temperature).toBe(0.9);
      expect(request.max_tokens).toBe(6000);
    });
  });
});

  describe('API Call Function', () => {
    let client: DeepSeekClient;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      process.env.DEEPSEEK_API_KEY = 'valid-api-key-12345';
      client = new DeepSeekClient();
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    describe('Successful API Calls', () => {
      it('should successfully call DeepSeek API and return response', async () => {
        const mockResponse: DeepSeekResponse = {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'deepseek-chat',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: '{"title": "Test Product"}'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150
          }
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        });

        const request = client.buildRequest('System prompt', 'User prompt');
        const response = await callDeepSeekAPI(request, client);

        expect(response).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.deepseek.com/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer valid-api-key-12345'
            })
          })
        );
      });

      it('should include all configuration parameters in API request', async () => {
        const mockResponse: DeepSeekResponse = {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'deepseek-chat',
          choices: [{
            index: 0,
            message: { role: 'assistant', content: '{}' },
            finish_reason: 'stop'
          }],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
        };

        let capturedBody: any;
        global.fetch = jest.fn().mockImplementation(async (url, options) => {
          capturedBody = JSON.parse(options.body as string);
          return {
            ok: true,
            json: async () => mockResponse
          };
        });

        const request = client.buildRequest('System prompt', 'User prompt');
        await callDeepSeekAPI(request, client);

        expect(capturedBody.temperature).toBe(0.7);
        expect(capturedBody.max_tokens).toBe(4000);
        expect(capturedBody.top_p).toBe(0.95);
        expect(capturedBody.frequency_penalty).toBe(0.3);
        expect(capturedBody.presence_penalty).toBe(0.1);
        expect(capturedBody.response_format).toEqual({ type: 'json_object' });
      });
    });

    describe('Error Handling - API Unavailable', () => {
      it('should throw API_UNAVAILABLE error for 500 status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: async () => '{"error": "Internal server error"}'
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toThrow(DeepSeekError);
        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.API_UNAVAILABLE,
          recoverable: true
        });
      });

      it('should throw API_UNAVAILABLE error for 503 status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 503,
          text: async () => '{"error": "Service unavailable"}'
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.API_UNAVAILABLE,
          recoverable: true
        });
      });
    });

    describe('Error Handling - Quota Exceeded', () => {
      it('should throw QUOTA_EXCEEDED error for 429 status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 429,
          text: async () => '{"error": "Rate limit exceeded"}'
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toThrow(DeepSeekError);
        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.QUOTA_EXCEEDED,
          recoverable: true
        });
      });

      it('should include helpful message for quota exceeded', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 429,
          text: async () => '{}'
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        try {
          await callDeepSeekAPI(request, client);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(DeepSeekError);
          expect((error as DeepSeekError).message).toContain('quota exceeded');
          expect((error as DeepSeekError).message).toContain('usage limits');
        }
      });
    });

    describe('Error Handling - Network Errors', () => {
      it('should throw NETWORK_ERROR for fetch failures', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.NETWORK_ERROR,
          recoverable: true
        });
      });

      it('should include helpful message for network errors', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

        const request = client.buildRequest('System prompt', 'User prompt');

        try {
          await callDeepSeekAPI(request, client);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(DeepSeekError);
          expect((error as DeepSeekError).message).toContain('Network error');
          expect((error as DeepSeekError).message).toContain('internet connection');
        }
      });
    });

    describe('Error Handling - Timeout', () => {
      it('should throw TIMEOUT error when request exceeds 30 seconds', async () => {
        // Mock a slow response that will be aborted
        global.fetch = jest.fn().mockImplementation(() => 
          new Promise((resolve) => {
            setTimeout(() => resolve({
              ok: true,
              json: async () => ({})
            }), 35000); // 35 seconds - exceeds timeout
          })
        );

        const request = client.buildRequest('System prompt', 'User prompt');

        // This should timeout before the 35 second response
        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.TIMEOUT,
          recoverable: true
        });
      }, 35000); // Set Jest timeout higher than our API timeout

      it('should include timeout duration in error message', async () => {
        global.fetch = jest.fn().mockImplementation(() => 
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 35000);
          })
        );

        const request = client.buildRequest('System prompt', 'User prompt');

        try {
          await callDeepSeekAPI(request, client);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(DeepSeekError);
          expect((error as DeepSeekError).message).toContain('30 seconds');
        }
      }, 35000);
    });

    describe('Error Handling - Invalid API Key', () => {
      it('should throw API_KEY_INVALID error for 401 status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 401,
          text: async () => '{"error": "Unauthorized"}'
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.API_KEY_INVALID,
          recoverable: false
        });
      });
    });

    describe('Error Handling - Invalid Response', () => {
      it('should throw INVALID_RESPONSE error when choices array is empty', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            id: 'test',
            choices: [], // Empty choices
            usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
          })
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.INVALID_RESPONSE,
          recoverable: false
        });
      });

      it('should throw INVALID_RESPONSE error when choices is missing', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            id: 'test',
            usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
          })
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toMatchObject({
          code: DeepSeekErrorCode.INVALID_RESPONSE
        });
      });
    });

    describe('Retry Logic with Exponential Backoff', () => {
      it('should retry 3 times for recoverable errors', async () => {
        let attemptCount = 0;
        global.fetch = jest.fn().mockImplementation(() => {
          attemptCount++;
          return Promise.resolve({
            ok: false,
            status: 500,
            text: async () => '{}'
          });
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toThrow();
        expect(attemptCount).toBe(3);
      }, 10000); // Allow time for retries

      it('should succeed on second attempt after one failure', async () => {
        let attemptCount = 0;
        const mockResponse: DeepSeekResponse = {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'deepseek-chat',
          choices: [{
            index: 0,
            message: { role: 'assistant', content: '{}' },
            finish_reason: 'stop'
          }],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
        };

        global.fetch = jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              text: async () => '{}'
            });
          }
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse
          });
        });

        const request = client.buildRequest('System prompt', 'User prompt');
        const response = await callDeepSeekAPI(request, client);

        expect(response).toEqual(mockResponse);
        expect(attemptCount).toBe(2);
      }, 10000);

      it('should not retry for non-recoverable errors', async () => {
        let attemptCount = 0;
        global.fetch = jest.fn().mockImplementation(() => {
          attemptCount++;
          return Promise.resolve({
            ok: false,
            status: 401, // Non-recoverable
            text: async () => '{}'
          });
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toThrow();
        expect(attemptCount).toBe(1); // Should not retry
      });

      it('should implement exponential backoff delays', async () => {
        const delays: number[] = [];
        let lastTime = Date.now();
        let attemptCount = 0;

        global.fetch = jest.fn().mockImplementation(() => {
          attemptCount++;
          const now = Date.now();
          if (attemptCount > 1) {
            delays.push(now - lastTime);
          }
          lastTime = now;
          
          return Promise.resolve({
            ok: false,
            status: 500,
            text: async () => '{}'
          });
        });

        const request = client.buildRequest('System prompt', 'User prompt');

        await expect(callDeepSeekAPI(request, client)).rejects.toThrow();

        // Verify exponential backoff: ~1s, ~2s
        // Allow some tolerance for timing
        expect(delays[0]).toBeGreaterThanOrEqual(900); // ~1s
        expect(delays[0]).toBeLessThan(1500);
        expect(delays[1]).toBeGreaterThanOrEqual(1900); // ~2s
        expect(delays[1]).toBeLessThan(2500);
      }, 10000);
    });

    describe('Response Validation', () => {
      it('should return response with usage statistics', async () => {
        const mockResponse: DeepSeekResponse = {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'deepseek-chat',
          choices: [{
            index: 0,
            message: { role: 'assistant', content: '{"test": "data"}' },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 75,
            total_tokens: 225
          }
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        });

        const request = client.buildRequest('System prompt', 'User prompt');
        const response = await callDeepSeekAPI(request, client);

        expect(response.usage).toBeDefined();
        expect(response.usage.prompt_tokens).toBe(150);
        expect(response.usage.completion_tokens).toBe(75);
        expect(response.usage.total_tokens).toBe(225);
      });

      it('should return response with message content', async () => {
        const contentJson = { title: 'Test Product', seoScore: 85 };
        const mockResponse: DeepSeekResponse = {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'deepseek-chat',
          choices: [{
            index: 0,
            message: { 
              role: 'assistant', 
              content: JSON.stringify(contentJson)
            },
            finish_reason: 'stop'
          }],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        });

        const request = client.buildRequest('System prompt', 'User prompt');
        const response = await callDeepSeekAPI(request, client);

        expect(response.choices[0].message.content).toBe(JSON.stringify(contentJson));
      });
    });
  });
});
