/**
 * DeepSeek Module
 * 
 * Main entry point for DeepSeek AI integration.
 * Exports client, configuration, and utility functions.
 */

export {
  DeepSeekClient,
  DeepSeekError,
  DeepSeekErrorCode,
  getDeepSeekClient,
  isDeepSeekAvailable,
  type DeepSeekConfig
} from './client';
