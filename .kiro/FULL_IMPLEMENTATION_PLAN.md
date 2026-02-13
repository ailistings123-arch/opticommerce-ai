# OptiCommerce AI - Full 3-Mode Implementation Plan

## 🎯 Project Overview

Implementing comprehensive 3-mode product optimization system:
- **Mode 1:** Optimize Existing Listing (Enhanced)
- **Mode 2:** Create New Product
- **Mode 3:** Analyze URL

**Timeline:** 2-3 weeks
**Approach:** Systematic, component-by-component

---

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (Day 1-2)
- [ ] Create mode selection UI
- [ ] Set up image upload system (Firebase Storage)
- [ ] Create shared form components
- [ ] Build expandable accordion components
- [ ] Set up multi-step form framework

### Phase 2: Mode 1 Enhancement (Day 3-4)
- [ ] Enhanced input form with all sections
- [ ] Image upload integration
- [ ] Product specifications form
- [ ] Target audience form
- [ ] Use cases form
- [ ] Enhanced output display
- [ ] SEO score comparison (before/after)
- [ ] Keyword analysis display
- [ ] Backend keywords section

### Phase 3: Mode 2 Implementation (Day 5-8)
- [ ] Product images upload (required)
- [ ] Basic product details form
- [ ] Detailed specifications form
- [ ] Target audience & market form
- [ ] Use cases & scenarios form
- [ ] Competitive information form
- [ ] Special attributes form
- [ ] Complete listing package output
- [ ] Multi-platform variations
- [ ] Image optimization recommendations

### Phase 4: Mode 3 Implementation (Day 9-12)
- [ ] URL input and validation
- [ ] Web scraping service (Puppeteer/Cheerio)
- [ ] Product data extraction
- [ ] SEO audit engine
- [ ] Keyword intelligence analysis
- [ ] Competitive analysis
- [ ] Improvement recommendations
- [ ] AI-generated improved version

### Phase 5: Backend & API (Day 13-14)
- [ ] Enhanced optimize API endpoint
- [ ] Create new product API endpoint
- [ ] Analyze URL API endpoint
- [ ] Image processing service
- [ ] Web scraping service
- [ ] Enhanced Gemini prompts for each mode

### Phase 6: Testing & Polish (Day 15)
- [ ] Test all three modes
- [ ] Fix bugs
- [ ] UI/UX polish
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## 🏗️ Architecture Changes

### New Components Structure

```
src/components/dashboard/
├── OptimizationModeSelector.tsx       # NEW: Mode selection UI
├── OptimizationForm.tsx               # EXISTING: Will be refactored
├── modes/
│   ├── Mode1OptimizeExisting.tsx     # NEW: Enhanced Mode 1
│   ├── Mode2CreateNew.tsx            # NEW: Mode 2
│   └── Mode3AnalyzeUrl.tsx           # NEW: Mode 3
├── forms/
│   ├── ImageUpload.tsx               # NEW: Image upload component
│   ├── ProductSpecifications.tsx     # NEW: Specs form
│   ├── TargetAudience.tsx            # NEW: Audience form
│   ├── UseCases.tsx                  # NEW: Use cases form
│   ├── CompetitiveInfo.tsx           # NEW: Competitive form
│   └── ExpandableSection.tsx         # NEW: Accordion component
├── outputs/
│   ├── Mode1Output.tsx               # NEW: Enhanced output
│   ├── Mode2Output.tsx               # NEW: Complete listing package
│   ├── Mode3Output.tsx               # NEW: Analysis output
│   ├── SEOScoreComparison.tsx        # NEW: Before/after scores
│   ├── KeywordAnalysis.tsx           # NEW: Keyword display
│   └── CompetitiveAnalysis.tsx       # NEW: Competitor analysis
└── [existing components...]
```

### New API Routes
```
src/app/api/
├── optimize/route.ts                 # EXISTING: Enhanced
├── create-product/route.ts           # NEW: Mode 2 endpoint
├── analyze-url/route.ts              # EXISTING: Enhanced for Mode 3
├── upload-image/route.ts             # NEW: Image upload
└── scrape-product/route.ts           # NEW: Web scraping
```

### New Services
```
src/lib/services/
├── ImageProcessingService.ts         # NEW: Image handling
├── WebScrapingService.ts             # NEW: URL scraping
├── CompetitiveAnalysisService.ts     # NEW: Competitor analysis
└── [existing services...]
```

---

## 🚀 Starting Implementation

### Step 1: Mode Selection UI
Creating the main mode selector component...
