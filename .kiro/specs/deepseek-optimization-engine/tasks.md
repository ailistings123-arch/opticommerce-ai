# Implementation Plan: DeepSeek Optimization Engine Integration

## Overview

This implementation plan breaks down the DeepSeek AI integration into discrete, incremental tasks. Each task builds on previous work, with property-based tests placed close to implementation to catch errors early. The plan maintains backward compatibility with existing Gemini functionality while adding DeepSeek as an alternative engine.

## Tasks

- [x] 1. Set up DeepSeek client module foundation
  - Create `src/lib/deepseek/` directory structure
  - Create `client.ts` with basic configuration and initialization
  - Add DEEPSEEK_API_KEY to environment variables
  - Implement API key validation on initialization
  - Add error handling for missing/invalid API keys
  - _Requirements: 1.2, 1.5, 10.1_

- [ ]* 1.1 Write property test for API key validation
  - **Property 2: Model Configuration Inclusion**
  - **Validates: Requirements 1.3**

- [ ] 2. Implement DeepSeek API communication
  - [x] 2.1 Create DeepSeek API request interface
    - Define DeepSeekRequest and DeepSeekResponse types
    - Implement request builder with model configuration (temperature: 0.7, max_tokens: 4000, top_p: 0.95, frequency_penalty: 0.3, presence_penalty: 0.1)
    - Add JSON response format specification
    - _Requirements: 1.3, 1.4, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 2.2 Write property test for configuration inclusion
    - **Property 2: Model Configuration Inclusion**
    - **Property 3: JSON Response Format Specification**
    - **Validates: Requirements 1.3, 1.4**
  
  - [-] 2.3 Implement API call function
    - Create async function to call DeepSeek API
    - Add retry logic with exponential backoff (3 attempts)
    - Add 30-second timeout per request
    - Implement error handling for network errors, timeouts, quota exceeded
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 2.4 Write unit tests for error handling
    - Test API unavailable scenario
    - Test quota exceeded scenario
    - Test network timeout scenario
    - _Requirements: 9.1, 9.3_

- [ ] 3. Create prompt templates module
  - [ ] 3.1 Create `src/lib/deepseek/prompts.ts`
    - Define DEEPSEEK_SYSTEM_PROMPT constant with expert e-commerce copywriter role
    - Define PLATFORM_RULES for all platforms (Amazon, Shopify, eBay, Etsy, Walmart, WooCommerce)
    - Include character limits, banned words, quality checklist in prompts
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 3.2 Write unit tests for prompt templates
    - Test system prompt contains required sections
    - Test each platform has character limits defined
    - Test banned words list is included
    - Test quality checklist is included
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  
  - [ ]* 3.3 Write property test for platform rules
    - **Property 6: Platform Rules in System Prompt**
    - **Validates: Requirements 3.2, 3.6**
  
  - [ ] 3.4 Implement mode-specific prompt builders
    - Create buildOptimizeExistingPrompt() function
    - Create buildCreateNewPrompt() function
    - Create buildAnalyzeUrlPrompt() function
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 3.5 Write property test for mode-specific prompts
    - **Property 7: Mode-Specific Prompt Generation**
    - **Validates: Requirements 4.4**

- [ ] 4. Implement response validation module
  - [ ] 4.1 Create `src/lib/deepseek/validation.ts`
    - Implement validateResponseStructure() function
    - Implement validateRequiredFields() function
    - Implement validateFieldTypes() function
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 6.7_
  
  - [ ]* 4.2 Write property tests for response validation
    - **Property 11: Response Structure Validation**
    - **Property 12: Required Fields Presence**
    - **Property 13: SEO Score Range Validation**
    - **Property 14: Bullets Array Type Validation**
    - **Property 15: Keywords Array Type Validation**
    - **Validates: Requirements 6.1, 6.2, 6.5, 6.6, 6.7**
  
  - [ ] 4.3 Implement JSON extraction from markdown
    - Create extractJsonFromResponse() function
    - Handle ```json code blocks
    - Handle plain JSON responses
    - Add regex-based extraction as fallback
    - _Requirements: 6.4, 9.4_
  
  - [ ]* 4.4 Write property test for JSON extraction
    - **Property 41: JSON Extraction from Markdown**
    - **Validates: Requirements 6.4**
  
  - [ ] 4.5 Implement quality checklist validation
    - Create runQualityChecklist() function
    - Validate title character utilization (90%+)
    - Validate bullet points character count (400-500)
    - Validate description character count (1500-2000)
    - Validate keyword count (40-60)
    - Calculate and validate keyword density (1-2%)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 4.6 Write property tests for quality checklist
    - **Property 16: Title Character Utilization**
    - **Property 17: Bullet Points Character Range**
    - **Property 18: Description Character Range**
    - **Property 19: Keyword Count Range**
    - **Property 20: Keyword Density Range**
    - **Property 21: Quality Validation Warnings**
    - **Property 22: Specific Quality Feedback**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement main optimization function
  - [ ] 6.1 Create generateOptimizedContent() in DeepSeek client
    - Accept title, description, platform, keywords, mode parameters
    - Build appropriate prompt based on mode
    - Call DeepSeek API with configuration
    - Parse and validate response
    - Run quality checklist
    - Return DeepSeekOptimizedContent
    - _Requirements: 1.1, 4.4, 4.5, 6.1, 6.2, 7.1-7.7_
  
  - [ ]* 6.2 Write property tests for optimization function
    - **Property 1: API Interface Compatibility**
    - **Property 8: Consistent Response Structure Across Modes**
    - **Validates: Requirements 1.1, 4.5**
  
  - [ ] 6.3 Implement platform-specific validation
    - Validate title length against platform limits
    - Validate description length against platform minimums
    - Add platform-specific post-processing
    - _Requirements: 5.1-5.8_
  
  - [ ]* 6.4 Write property tests for platform validation
    - **Property 9: Platform Title Length Validation**
    - **Property 10: Platform Description Length Validation**
    - **Validates: Requirements 5.7, 5.8**
  
  - [ ]* 6.5 Write unit tests for specific platform limits
    - Test Amazon title limit (150-200 chars)
    - Test Shopify title limit (60-70 chars)
    - Test eBay title limit (80 chars)
    - Test Etsy title limit (140 chars)
    - Test Walmart title limit (75 chars)
    - Test WooCommerce title limit (70 chars)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 7. Create engine selector UI component
  - [ ] 7.1 Create `src/components/dashboard/EngineSelector.tsx`
    - Implement radio button group for Gemini/DeepSeek selection
    - Add engine status indicators
    - Store selection in session storage
    - Add disabled state support
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 7.2 Write unit tests for engine selector
    - Test component renders both options
    - Test default selection is Gemini
    - Test selection change callback
    - Test session storage persistence
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ]* 7.3 Write property test for engine persistence
    - **Property 4: Engine Selection Persistence**
    - **Validates: Requirements 2.3**

- [ ] 8. Integrate engine selector into OptimizationForm
  - [ ] 8.1 Modify `src/components/dashboard/OptimizationForm.tsx`
    - Add EngineSelector component
    - Add engine state management
    - Pass engine parameter to API call
    - Add engine-specific loading states
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [ ]* 8.2 Write property test for engine usage
    - **Property 5: Selected Engine Usage**
    - **Validates: Requirements 2.4**
  
  - [ ]* 8.3 Write property test for data preservation
    - **Property 25: Engine Switch Data Preservation**
    - **Validates: Requirements 8.5**

- [ ] 9. Enhance optimization API route
  - [ ] 9.1 Modify `src/app/api/optimize/route.ts`
    - Add engine parameter to request interface (optional, defaults to 'gemini')
    - Implement engine routing logic
    - Route to DeepSeek client when engine='deepseek'
    - Route to Gemini client when engine='gemini' or undefined
    - Add engine metadata to Firestore saves
    - _Requirements: 2.4, 2.5, 8.1, 12.5, 12.6_
  
  - [ ]* 9.2 Write property tests for API routing
    - **Property 5: Selected Engine Usage** (integration test)
    - **Property 27: No Automatic Fallback**
    - **Property 40: Firestore Persistence with Metadata**
    - **Validates: Requirements 2.4, 9.6, 12.5, 12.6**
  
  - [ ] 9.3 Add DeepSeek-specific error handling
    - Handle DeepSeek API errors
    - Log errors with engine context
    - Return user-friendly error messages
    - Do not fall back to Gemini when DeepSeek is selected
    - _Requirements: 9.1, 9.2, 9.3, 9.6_
  
  - [ ]* 9.4 Write property test for error logging
    - **Property 26: API Error Logging**
    - **Validates: Requirements 9.2**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Integrate with existing services
  - [ ] 11.1 Connect DeepSeek with Platform Engines
    - Ensure DeepSeek responses work with all platform engines
    - Apply platform-specific post-processing
    - Test with Amazon, Shopify, eBay, Etsy, Walmart, WooCommerce engines
    - _Requirements: 12.1, 12.2_
  
  - [ ]* 11.2 Write property tests for platform integration
    - **Property 36: Platform Engine Integration**
    - **Property 37: Platform Post-Processing**
    - **Validates: Requirements 12.1, 12.2**
  
  - [ ] 11.3 Connect DeepSeek with SEO Optimizer service
    - Use existing seoOptimizer.calculateSEOScore()
    - Ensure SEO metrics are calculated for DeepSeek responses
    - _Requirements: 12.3_
  
  - [ ]* 11.4 Write property test for SEO integration
    - **Property 38: SEO Service Integration**
    - **Validates: Requirements 12.3**
  
  - [ ] 11.5 Connect DeepSeek with Compliance Checker service
    - Use existing complianceChecker.validateContent()
    - Ensure compliance checks run for DeepSeek responses
    - _Requirements: 12.4_
  
  - [ ]* 11.6 Write property test for compliance integration
    - **Property 39: Compliance Service Integration**
    - **Validates: Requirements 12.4**

- [ ] 12. Implement response formatting and metrics
  - [ ] 12.1 Add comprehensive metrics to DeepSeek responses
    - Include SEO score calculation
    - Include recommendations array
    - Include keyword analysis (primary and related keywords)
    - Include compliance status
    - Calculate keyword density percentage
    - Calculate character utilization percentage
    - Provide quality metrics breakdown
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [ ]* 12.2 Write property tests for response metrics
    - **Property 29: SEO Score Presence**
    - **Property 30: Recommendations Presence**
    - **Property 31: Keyword Analysis Presence**
    - **Property 32: Compliance Status Presence**
    - **Property 33: Keyword Density Calculation**
    - **Property 34: Character Utilization Calculation**
    - **Property 35: Quality Metrics Breakdown**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7**

- [ ] 13. Implement configuration validation
  - [ ] 13.1 Create configuration validator
    - Validate temperature range (0.0 - 2.0)
    - Validate max_tokens range (1 - 8000)
    - Validate top_p range (0.0 - 1.0)
    - Validate frequency_penalty range (-2.0 - 2.0)
    - Validate presence_penalty range (-2.0 - 2.0)
    - _Requirements: 10.7_
  
  - [ ]* 13.2 Write property test for configuration validation
    - **Property 28: Configuration Value Range Validation**
    - **Validates: Requirements 10.7**
  
  - [ ]* 13.3 Write unit tests for configuration defaults
    - Test temperature default is 0.7
    - Test max_tokens default is 4000
    - Test top_p default is 0.95
    - Test frequency_penalty default is 0.3
    - Test presence_penalty default is 0.1
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 14. Ensure backward compatibility with Gemini
  - [ ] 14.1 Verify Gemini functionality unchanged
    - Test all existing Gemini optimization modes
    - Verify Gemini API interface unchanged
    - Ensure Gemini doesn't require DeepSeek configuration
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ]* 14.2 Write property tests for backward compatibility
    - **Property 23: Gemini Backward Compatibility**
    - **Property 24: Gemini Mode Support**
    - **Validates: Requirements 8.2, 8.3**
  
  - [ ]* 14.3 Write unit test for Gemini independence
    - Test Gemini works without DEEPSEEK_API_KEY
    - Test default engine is Gemini
    - _Requirements: 8.1, 8.4_

- [ ] 15. Add comprehensive error handling
  - [ ] 15.1 Implement all error types
    - Create DeepSeekErrorCode enum
    - Create DeepSeekError class
    - Implement error handlers for each error type
    - Add user-friendly error messages
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 15.2 Write unit tests for error scenarios
    - Test API key missing error
    - Test API key invalid error
    - Test API unavailable error
    - Test quota exceeded error
    - Test JSON parse error with fallback
    - Test validation failed error
    - Test network error
    - Test timeout error
    - _Requirements: 1.5, 9.1, 9.3, 9.4, 9.5_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integration testing and documentation
  - [ ]* 17.1 Write end-to-end integration tests
    - Test complete optimization flow with DeepSeek
    - Test engine switching between Gemini and DeepSeek
    - Test Firestore saving with engine metadata
    - Test all three optimization modes
    - Test all six platforms
    - _Requirements: 1.1, 2.4, 4.1-4.5, 12.5, 12.6_
  
  - [ ] 17.2 Update environment variable documentation
    - Document DEEPSEEK_API_KEY requirement
    - Document configuration options
    - Add setup instructions
    - _Requirements: 10.1_
  
  - [ ] 17.3 Update user-facing documentation
    - Document engine selection feature
    - Document DeepSeek-specific features
    - Add troubleshooting guide
    - _Requirements: 2.1, 2.2_

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate end-to-end flows and service interactions
- All tests should use the fast-check library for property-based testing with minimum 100 iterations
- Each property test must include a comment tag: `Feature: deepseek-optimization-engine, Property {number}: {property_text}`
