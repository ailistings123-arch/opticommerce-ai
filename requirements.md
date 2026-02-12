# OptiCommerce AI - Requirements Specification (EARS Notation)

## 1. System Overview
OptiCommerce AI is a multi-platform product listing optimizer that uses AI to generate SEO-optimized titles, descriptions, and tags for e-commerce platforms (Amazon, Shopify, Etsy, eBay).

## 2. Ubiquitous Requirements

**UR-1:** The system SHALL support user authentication via Firebase Auth (email/password and Google OAuth).

**UR-2:** The system SHALL store all user data, optimization history, and subscription information in Firebase Firestore.

**UR-3:** The system SHALL use Google Gemini 1.5 Flash API for all AI-powered content generation.

**UR-4:** The system SHALL be responsive and accessible on desktop, tablet, and mobile devices.

**UR-5:** The system SHALL enforce usage limits based on subscription tier.

## 3. Event-Driven Requirements

**ED-1:** WHEN a user submits a product for optimization, the system SHALL validate the input fields (title, description, platform).

**ED-2:** WHEN a user submits a product for optimization, the system SHALL check their remaining usage quota.

**ED-3:** WHEN the usage quota is exceeded, the system SHALL display an upgrade prompt and prevent optimization.

**ED-4:** WHEN optimization is successful, the system SHALL decrement the user's usage count and store the result in Firestore.

**ED-5:** WHEN a user signs up, the system SHALL create a Firestore document with default Free tier settings (3 optimizations/month).

**ED-6:** WHEN a user logs out, the system SHALL clear all client-side authentication state.

## 4. State-Driven Requirements

**SD-1:** WHILE a user is authenticated, the system SHALL display their current subscription tier and remaining usage count.

**SD-2:** WHILE optimization is in progress, the system SHALL display a loading indicator and disable the submit button.

**SD-3:** WHILE the user is on the Free tier, the system SHALL display upgrade prompts after each optimization.

## 5. Unwanted Behaviors

**UB-1:** IF the Gemini API fails, the system SHALL NOT charge the user's usage quota.

**UB-2:** IF the user is not authenticated, the system SHALL NOT allow access to the dashboard or optimization features.

**UB-3:** The system SHALL NOT store API keys or sensitive credentials in client-side code.

**UB-4:** The system SHALL NOT allow users to bypass usage limits through client-side manipulation.

## 6. Functional Requirements

### 6.1 Authentication
- Email/password registration and login
- Google OAuth integration
- Password reset functionality
- Session persistence

### 6.2 Product Optimization
- Input fields: Original title, description, target platform, optional keywords
- Supported platforms: Amazon, Shopify, Etsy, eBay
- Output: Optimized title, description, tags/keywords, SEO score (0-100)

### 6.3 SEO Scoring Algorithm
The system SHALL calculate SEO score based on:
- **Keyword density** (25 points): Optimal 2-4% keyword usage
- **Title length** (20 points): Platform-specific optimal ranges
- **Description completeness** (20 points): Minimum character thresholds
- **Readability** (15 points): Sentence structure and clarity
- **Platform compliance** (20 points): Adherence to platform-specific rules

### 6.4 Platform-Specific Formatting

**Amazon:**
- Title: 150-200 characters, capitalize first letter of each word
- Description: 2000+ characters, bullet points for features
- Keywords: 5-7 backend search terms

**Shopify:**
- Title: 60-70 characters, natural language
- Description: 300-500 characters, storytelling approach
- Tags: 10-15 product tags

**Etsy:**
- Title: 140 characters max, keyword-rich
- Description: 1000+ characters, personal/handmade focus
- Tags: 13 tags max, single words or short phrases

**eBay:**
- Title: 80 characters max, keyword-dense
- Description: 500-1000 characters, condition and shipping details
- Item specifics: Category-based attributes

### 6.5 Subscription Tiers

| Tier | Monthly Cost | Optimizations/Month | Features |
|------|--------------|---------------------|----------|
| Free | $0 | 3 | Basic optimization, all platforms |
| Basic | $19 | 20 | Priority support, history export |
| Premium | $49 | 75 | Bulk upload, API access, analytics |

### 6.6 Dashboard Features
- Optimization history with search and filter
- Usage statistics and charts
- Quick re-optimize from history
- Export results (CSV/JSON)
- Account settings and subscription management

## 7. Non-Functional Requirements

**NFR-1:** API response time SHALL be under 5 seconds for 95% of requests.

**NFR-2:** The system SHALL handle concurrent requests from multiple users without degradation.

**NFR-3:** All passwords SHALL be hashed using Firebase Auth's built-in security.

**NFR-4:** The UI SHALL follow WCAG 2.1 Level AA accessibility guidelines.

**NFR-5:** The system SHALL be deployable on Vercel with zero-config.

## 8. Data Schema

### Users Collection (`users/{userId}`)
```typescript
{
  email: string;
  displayName: string;
  photoURL?: string;
  tier: 'free' | 'basic' | 'premium';
  usageCount: number;
  usageLimit: number;
  resetDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Optimizations Collection (`optimizations/{optimizationId}`)
```typescript
{
  userId: string;
  platform: 'amazon' | 'shopify' | 'etsy' | 'ebay';
  original: {
    title: string;
    description: string;
  };
  optimized: {
    title: string;
    description: string;
    tags: string[];
    seoScore: number;
  };
  createdAt: Timestamp;
}
```

## 9. Success Criteria

- Users can sign up and authenticate within 30 seconds
- Optimization completes in under 5 seconds
- SEO scores are consistent and explainable
- 90%+ user satisfaction with generated content
- Zero security vulnerabilities in authentication flow
