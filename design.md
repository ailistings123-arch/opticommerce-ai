# OptiCommerce AI - Technical Design Document

## 1. Architecture Overview

### 1.1 Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI Engine:** Google Gemini 1.5 Flash API
- **Deployment:** Vercel

### 1.2 Architecture Pattern
- Server-side rendering (SSR) for public pages
- Client-side rendering for authenticated dashboard
- API routes for backend logic and AI integration
- Firebase Admin SDK for server-side operations

## 2. Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── optimize/
│   │   │   └── route.ts
│   │   └── user/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── dashboard/
│   │   ├── OptimizationForm.tsx
│   │   ├── ResultCard.tsx
│   │   ├── HistoryTable.tsx
│   │   └── UsageStats.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Spinner.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── admin.ts
│   ├── gemini/
│   │   └── client.ts
│   ├── utils/
│   │   ├── seo-scorer.ts
│   │   └── platform-rules.ts
│   └── hooks/
│       ├── useAuth.ts
│       └── useOptimization.ts
└── types/
    └── index.ts
```

## 3. Firebase Configuration

### 3.1 Firestore Schema

**Collection: `users`**
```typescript
Document ID: {userId} (from Firebase Auth)
{
  email: string;
  displayName: string;
  photoURL: string | null;
  tier: 'free' | 'basic' | 'premium';
  usageCount: number;        // Current month usage
  usageLimit: number;        // Based on tier: 3, 20, or 75
  resetDate: Timestamp;      // Next billing cycle
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Collection: `optimizations`**
```typescript
Document ID: auto-generated
{
  userId: string;
  platform: 'amazon' | 'shopify' | 'etsy' | 'ebay';
  original: {
    title: string;
    description: string;
    keywords?: string;
  };
  optimized: {
    title: string;
    description: string;
    tags: string[];
    seoScore: number;
    improvements: string[];
  };
  createdAt: Timestamp;
}
```

### 3.2 Firestore Indexes
- `optimizations`: Composite index on `userId` (ASC) + `createdAt` (DESC)
- `users`: Single field index on `email` (ASC)

### 3.3 Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /optimizations/{optimizationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

## 4. API Design

### 4.1 POST /api/optimize

**Request:**
```typescript
{
  title: string;
  description: string;
  platform: 'amazon' | 'shopify' | 'etsy' | 'ebay';
  keywords?: string;
}
```

**Response (Success):**
```typescript
{
  success: true;
  data: {
    optimized: {
      title: string;
      description: string;
      tags: string[];
      seoScore: number;
      improvements: string[];
    };
    usageRemaining: number;
  }
}
```

**Response (Error):**
```typescript
{
  success: false;
  error: string;
  code: 'QUOTA_EXCEEDED' | 'UNAUTHORIZED' | 'INVALID_INPUT' | 'AI_ERROR';
}
```

**Flow:**
1. Verify Firebase Auth token from request headers
2. Fetch user document from Firestore
3. Check usage quota (usageCount < usageLimit)
4. Call Gemini API with platform-specific prompt
5. Parse AI response and calculate SEO score
6. Save optimization to Firestore
7. Increment user's usageCount
8. Return optimized content

### 4.2 GET /api/user

**Response:**
```typescript
{
  email: string;
  displayName: string;
  tier: string;
  usageCount: number;
  usageLimit: number;
  resetDate: string;
}
```

## 5. AI Integration (Gemini 1.5 Flash)

### 5.1 Prompt Engineering

**System Prompt Template:**
```
You are an expert e-commerce SEO specialist optimizing product listings for {PLATFORM}.

Platform-specific rules:
{PLATFORM_RULES}

Task: Optimize the following product listing for maximum visibility and conversion.

Original Title: {TITLE}
Original Description: {DESCRIPTION}
Keywords: {KEYWORDS}

Provide a JSON response with:
{
  "title": "optimized title following platform rules",
  "description": "optimized description with proper formatting",
  "tags": ["tag1", "tag2", ...],
  "improvements": ["improvement 1", "improvement 2", ...]
}
```

### 5.2 Platform-Specific Rules

**Amazon:**
- Title: 150-200 chars, capitalize each word, include brand and key features
- Description: Use bullet points, focus on benefits, include dimensions/specs
- Keywords: 5-7 backend search terms, avoid repetition

**Shopify:**
- Title: 60-70 chars, natural language, brand + product type
- Description: Storytelling approach, lifestyle benefits, 300-500 chars
- Tags: 10-15 tags, mix of broad and specific terms

**Etsy:**
- Title: 140 chars max, keyword-rich, descriptive
- Description: Personal touch, materials, dimensions, care instructions
- Tags: 13 tags max, single words or 2-word phrases

**eBay:**
- Title: 80 chars max, keyword-dense, no promotional language
- Description: Condition details, shipping info, return policy
- Item specifics: Category-based attributes

### 5.3 SEO Scoring Algorithm

```typescript
function calculateSEOScore(optimized, original, platform): number {
  let score = 0;
  
  // Keyword density (25 points)
  const density = calculateKeywordDensity(optimized.title, optimized.description);
  if (density >= 2 && density <= 4) score += 25;
  else if (density >= 1 && density < 2) score += 15;
  else if (density > 4 && density <= 6) score += 15;
  
  // Title length (20 points)
  const titleLength = optimized.title.length;
  const optimalRange = PLATFORM_RULES[platform].titleRange;
  if (titleLength >= optimalRange.min && titleLength <= optimalRange.max) score += 20;
  else if (Math.abs(titleLength - optimalRange.min) <= 20) score += 10;
  
  // Description completeness (20 points)
  const descLength = optimized.description.length;
  const minDesc = PLATFORM_RULES[platform].minDescription;
  if (descLength >= minDesc) score += 20;
  else score += Math.floor((descLength / minDesc) * 20);
  
  // Readability (15 points)
  const readabilityScore = calculateReadability(optimized.description);
  score += Math.floor(readabilityScore * 15);
  
  // Platform compliance (20 points)
  const complianceScore = checkPlatformCompliance(optimized, platform);
  score += complianceScore;
  
  return Math.min(score, 100);
}
```

## 6. Authentication Flow

### 6.1 Sign Up
1. User submits email/password or clicks Google OAuth
2. Firebase Auth creates user account
3. Client receives ID token
4. API creates Firestore user document with default Free tier
5. Redirect to dashboard

### 6.2 Login
1. User submits credentials
2. Firebase Auth validates and returns ID token
3. Client stores token in memory (not localStorage for security)
4. Fetch user data from Firestore
5. Redirect to dashboard

### 6.3 Session Management
- Use Firebase Auth's `onAuthStateChanged` listener
- Refresh tokens automatically handled by Firebase SDK
- Server-side token verification on all API routes

## 7. UI/UX Design Principles

### 7.1 Color Scheme
- Primary: Blue (#3B82F6) - Trust and professionalism
- Secondary: Purple (#8B5CF6) - Creativity and innovation
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### 7.2 Key Components

**OptimizationForm:**
- Platform selector (dropdown with icons)
- Title input (with character counter)
- Description textarea (with character counter)
- Optional keywords input
- Submit button with loading state

**ResultCard:**
- Side-by-side comparison (original vs optimized)
- SEO score with circular progress indicator
- Improvements list with icons
- Copy to clipboard buttons
- Save to history button

**UsageStats:**
- Progress bar showing usage (e.g., "3/20 used")
- Tier badge
- Upgrade CTA for non-Premium users
- Reset date countdown

## 8. Performance Optimization

- Use Next.js Image component for all images
- Implement React Suspense for lazy loading
- Cache Firestore queries with SWR or React Query
- Minimize bundle size with tree-shaking
- Use server components where possible

## 9. Security Considerations

- All API routes verify Firebase Auth tokens
- Environment variables for sensitive keys
- CORS configuration for API routes
- Rate limiting on API endpoints
- Input sanitization and validation
- No sensitive data in client-side code

## 10. Deployment Configuration

### 10.1 Environment Variables (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

GEMINI_API_KEY=
```

### 10.2 Vercel Configuration
- Auto-deploy from main branch
- Environment variables configured in Vercel dashboard
- Edge functions for API routes (optional)
- Analytics enabled

## 11. Testing Strategy

- Unit tests for utility functions (SEO scorer, platform rules)
- Integration tests for API routes
- E2E tests for critical user flows (signup, optimize, view history)
- Manual testing for AI output quality

## 12. Future Enhancements

- Bulk optimization (CSV upload)
- A/B testing for titles
- Competitor analysis
- Image optimization suggestions
- Multi-language support
- Mobile app (React Native)
