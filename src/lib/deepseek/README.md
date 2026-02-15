# DeepSeek AI Client Module

This module provides integration with the DeepSeek AI API for e-commerce listing optimization.

## Features

- ✅ API key validation on initialization
- ✅ Configurable model parameters (temperature, max_tokens, etc.)
- ✅ Comprehensive error handling with descriptive messages
- ✅ Type-safe configuration management
- ✅ Singleton pattern for efficient resource usage

## Setup

### 1. Configure API Key

Add your DeepSeek API key to `.env.local`:

```env
DEEPSEEK_API_KEY=your_api_key_here
```

Get your API key from: https://platform.deepseek.com/api-keys

### 2. Import and Use

```typescript
import { getDeepSeekClient, isDeepSeekAvailable } from '@/lib/deepseek';

// Check if DeepSeek is available
if (isDeepSeekAvailable()) {
  const client = getDeepSeekClient();
  // Use the client...
}
```

## Configuration

### Default Configuration

```typescript
{
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 4000,
  top_p: 0.95,
  frequency_penalty: 0.3,
  presence_penalty: 0.1,
  response_format: { type: 'json_object' }
}
```

### Custom Configuration

```typescript
import { DeepSeekClient } from '@/lib/deepseek';

const client = new DeepSeekClient({
  temperature: 0.8,
  max_tokens: 5000
});
```

### Update Configuration

```typescript
const client = getDeepSeekClient();
client.updateConfig({ temperature: 0.9 });
```

## Error Handling

The module provides comprehensive error handling with specific error codes:

```typescript
import { DeepSeekError, DeepSeekErrorCode } from '@/lib/deepseek';

try {
  const client = getDeepSeekClient();
} catch (error) {
  if (error instanceof DeepSeekError) {
    switch (error.code) {
      case DeepSeekErrorCode.API_KEY_MISSING:
        console.error('API key not configured');
        break;
      case DeepSeekErrorCode.API_KEY_INVALID:
        console.error('Invalid API key format');
        break;
      // Handle other error codes...
    }
  }
}
```

### Error Codes

- `API_KEY_MISSING` - DEEPSEEK_API_KEY environment variable not set
- `API_KEY_INVALID` - API key format is invalid
- `API_UNAVAILABLE` - DeepSeek API is unavailable
- `QUOTA_EXCEEDED` - API quota has been exceeded
- `INVALID_RESPONSE` - API returned invalid response
- `JSON_PARSE_ERROR` - Failed to parse JSON response
- `VALIDATION_FAILED` - Response validation failed
- `NETWORK_ERROR` - Network connection error
- `TIMEOUT` - Request timeout

## API Reference

### `getDeepSeekClient()`

Returns the singleton DeepSeek client instance.

**Returns:** `DeepSeekClient`

**Throws:** `DeepSeekError` if API key is not configured or invalid

### `isDeepSeekAvailable()`

Checks if DeepSeek is available (API key is configured).

**Returns:** `boolean`

### `DeepSeekClient`

Main client class for DeepSeek API interaction.

#### Methods

- `getConfig()` - Get current configuration (excluding API key)
- `validateApiKey()` - Validate API key format
- `updateConfig(updates)` - Update configuration values

## Requirements Satisfied

This module satisfies the following requirements from the specification:

- **Requirement 1.2**: DeepSeek client initialization with API key from environment variables
- **Requirement 1.5**: Descriptive error handling for missing/invalid API keys
- **Requirement 10.1**: API key configuration from DEEPSEEK_API_KEY environment variable

## Testing

Unit tests are located in `__tests__/client.test.ts` and cover:

- API key validation
- Configuration management
- Error handling
- Default values
- Custom configuration

## Next Steps

This is the foundation module. Future tasks will add:

- API communication functions
- Prompt template management
- Response validation
- Quality checklist validation
- Integration with existing services
