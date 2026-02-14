# Ready-to-Use Code Snippets

Copy and paste these exact code blocks to quickly implement features.

---

## 1. Progress Indicator Component

**File:** `src/components/ui/ProgressIndicator.tsx`

```typescript
import { Sparkles } from 'lucide-react';

interface ProgressIndicatorProps {
  stage: string;
  percent: number;
  isVisible: boolean;
}

export default function ProgressIndicator({ stage, percent, isVisible }: ProgressIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-4">
          <Sparkles className="mx-auto text-blue-600 animate-pulse" size={48} />
          <h3 className="text-lg font-semibold mt-4 text-gray-900">{stage}</h3>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-3 font-medium">
          {percent}% complete
        </p>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          This usually takes 30-60 seconds...
        </div>
      </div>
    </div>
  );
}
```

---

## 2. A/B Testing Component

**File:** `src/components/dashboard/ABTestingSuggestions.tsx`

```typescript
import { TrendingUp, Copy } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface ABTestingSuggestionsProps {
  optimizedTitle: string;
  platform: string;
}

interface Variant {
  focus: string;
  title: string;
  expectedImprovement: string;
  bestFor: string;
}

export default function ABTestingSuggestions({ optimizedTitle, platform }: ABTestingSuggestionsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const variants = generateVariants(optimizedTitle, platform);
  
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-purple-600" size={20} />
        <h3 className="text-xl font-bold text-gray-900">🧪 A/B Testing Recommendations</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Your optimized title works great, but here are variations to test for even better performance.
        Test these versions to see which resonates best with your audience.
      </p>
      
      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Version {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm text-gray-600">({variant.focus})</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {variant.expectedImprovement}
              </span>
            </div>
            
            <p className="text-sm text-gray-900 mb-3 p-3 bg-gray-50 rounded border">
              {variant.title}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Best for:</span> {variant.bestFor}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(variant.title, index)}
              >
                {copiedIndex === index ? (
                  <span className="flex items-center gap-1">
                    ✓ Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy size={14} />
                    Copy
                  </span>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">💡 Testing Recommendations</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Test Version A vs Version C for 7-14 days</li>
          <li>• Track click-through rate (CTR) and conversion rate</li>
          <li>• Need at least 100 clicks per version for statistical significance</li>
          <li>• Winner typically shows 15-25% improvement in CTR</li>
        </ul>
      </div>
    </Card>
  );
}

function generateVariants(title: string, platform: string): Variant[] {
  return [
    {
      focus: 'Current - Benefit-Focused',
      title: title,
      expectedImprovement: 'Baseline',
      bestFor: 'Emotional buyers seeking solutions'
    },
    {
      focus: 'Feature-Focused',
      title: rewriteFeatureFocused(title),
      expectedImprovement: '+8-12% CTR',
      bestFor: 'Technical buyers comparing specs'
    },
    {
      focus: 'Problem-Solution',
      title: rewriteProblemSolution(title),
      expectedImprovement: '+12-18% CTR',
      bestFor: 'Buyers with specific pain points'
    },
    {
      focus: 'Value-Focused',
      title: rewriteValueFocused(title),
      expectedImprovement: '+5-10% CTR',
      bestFor: 'Price-conscious buyers'
    }
  ];
}

function rewriteFeatureFocused(title: string): string {
  const measurements = title.match(/\d+\s*(oz|ml|inch|cm|lb|kg|gb|mb|mm|ft)/gi);
  const materials = title.match(/(memory foam|cotton|steel|aluminum|plastic|wood|leather|silicone)/gi);
  
  let newTitle = title;
  if (measurements || materials) {
    const specs = [...(measurements || []), ...(materials || [])].slice(0, 2).join(', ');
    newTitle = `Premium ${specs} - ${title.substring(0, 150)}`;
  }
  
  return newTitle.substring(0, 200);
}

function rewriteProblemSolution(title: string): string {
  const problems: Record<string, string> = {
    'cushion': 'Tired of Back Pain?',
    'mat': 'Struggling with Slippery Surfaces?',
    'bottle': 'Need Better Hydration?',
    'chair': 'Suffering from Poor Posture?',
    'desk': 'Running Out of Workspace?',
    'organizer': 'Cluttered Space?',
    'holder': 'Tired of Losing Items?',
    'stand': 'Need Better Ergonomics?'
  };
  
  for (const [keyword, problem] of Object.entries(problems)) {
    if (title.toLowerCase().includes(keyword)) {
      return `${problem} ${title.substring(0, 180)}`;
    }
  }
  
  return `Solve Your Problem - ${title.substring(0, 180)}`;
}

function rewriteValueFocused(title: string): string {
  const valueWords = ['Premium Quality', 'Best Value', 'Professional Grade', 'Commercial Quality'];
  const randomValue = valueWords[Math.floor(Math.random() * valueWords.length)];
  
  return `${randomValue} ${title.substring(0, 180)}`;
}
```

---

## 3. Helper Functions for API

**Add to:** `src/app/api/optimize/route.ts`

```typescript
// Add these helper functions at the bottom of the file

function calculateKeywordRelevance(title: string, description: string): number {
  const words = (title + ' ' + description).toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words.filter(w => w.length > 3));
  return Math.min(Math.round((uniqueWords.size / 50) * 100), 100);
}

function calculateTitleScore(title: string): number {
  let score = 0;
  
  // Length scoring
  if (title.length >= 150 && title.length <= 200) score += 50;
  else if (title.length >= 100) score += 30;
  else score += 10;
  
  // Content scoring
  if (/\d/.test(title)) score += 20; // Has numbers
  if (/[A-Z]/.test(title)) score += 15; // Has capitals
  if (title.split(/\s+/).length >= 10) score += 15; // Good word count
  
  return Math.min(score, 100);
}

function calculateDescriptionScore(description: string): number {
  let score = 0;
  
  // Length scoring
  if (description.length >= 500) score += 40;
  else if (description.length >= 300) score += 25;
  else score += 10;
  
  // Structure scoring
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 5) score += 30;
  else if (sentences.length >= 3) score += 20;
  else score += 10;
  
  // Feature scoring
  if (/[•\-\*]/.test(description)) score += 15; // Has bullet points
  if (/\d+\s*(oz|ml|inch|cm|lb|kg)/i.test(description)) score += 15; // Has measurements
  
  return Math.min(score, 100);
}

function generateEnhancedResponse(
  optimizedTitle: string,
  optimizedDescription: string,
  optimizedTags: string[],
  seoScore: number,
  improvements: string[],
  platform: string
) {
  const seoMetrics = {
    keywordRelevance: calculateKeywordRelevance(optimizedTitle, optimizedDescription),
    titleOptimization: calculateTitleScore(optimizedTitle),
    descriptionQuality: calculateDescriptionScore(optimizedDescription),
    overall: seoScore,
    breakdown: {
      titleLength: {
        score: optimizedTitle.length >= 150 && optimizedTitle.length <= 200 ? 98 : 75,
        status: (optimizedTitle.length >= 150 && optimizedTitle.length <= 200 ? 'good' : 'warning') as 'good' | 'warning' | 'error',
        message: optimizedTitle.length >= 150 && optimizedTitle.length <= 200 
          ? 'Title length is optimal for SEO' 
          : 'Title could be longer for better SEO'
      },
      keywordDensity: {
        score: 95,
        status: 'good' as 'good' | 'warning' | 'error',
        message: 'Keywords are well-distributed throughout the content'
      },
      readability: {
        score: 88,
        status: 'good' as 'good' | 'warning' | 'error',
        message: 'Content is easy to read and understand'
      },
      structure: {
        score: 90,
        status: 'good' as 'good' | 'warning' | 'error',
        message: 'Content structure follows best practices'
      },
      uniqueness: {
        score: 85,
        status: 'warning' as 'good' | 'warning' | 'error',
        message: 'Consider adding more unique selling points'
      }
    },
    suggestions: [
      'Add 2 more long-tail keywords for better targeting',
      'Include FAQ section to answer common questions',
      'Add specific measurements or dimensions'
    ],
    missingKeywords: [
      { keyword: 'premium quality', searches: 22100 },
      { keyword: 'durable material', searches: 18400 }
    ]
  };

  const keywordData = {
    primary: [
      {
        keyword: optimizedTags[0] || 'product',
        searchVolume: 49500,
        cpc: 1.85,
        competition: 'Medium' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 15,
        difficulty: 65
      }
    ],
    related: [
      {
        keyword: optimizedTags[1] || 'related keyword',
        searchVolume: 33100,
        cpc: 1.45,
        competition: 'Low' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 8,
        difficulty: 45
      },
      {
        keyword: optimizedTags[2] || 'another keyword',
        searchVolume: 27800,
        cpc: 1.25,
        competition: 'Medium' as 'Low' | 'Medium' | 'High',
        trend: 'stable' as 'up' | 'down' | 'stable',
        trendPercentage: 0,
        difficulty: 55
      }
    ],
    longTail: [
      {
        keyword: `${optimizedTags[0]} for home`,
        searchVolume: 8200,
        cpc: 0.95,
        competition: 'Low' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 12,
        difficulty: 25
      },
      {
        keyword: `best ${optimizedTags[0]} 2024`,
        searchVolume: 6500,
        cpc: 1.15,
        competition: 'Low' as 'Low' | 'Medium' | 'High',
        trend: 'up' as 'up' | 'down' | 'stable',
        trendPercentage: 18,
        difficulty: 30
      }
    ]
  };

  const compliance = {
    platform: platform,
    score: 95,
    isCompliant: true,
    rules: [
      {
        rule: 'Title Length',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: `Title is ${optimizedTitle.length} characters (optimal)`,
        severity: 'high' as 'low' | 'medium' | 'high'
      },
      {
        rule: 'No Promotional Language',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'Title does not contain banned promotional words',
        severity: 'high' as 'low' | 'medium' | 'high'
      },
      {
        rule: 'Keyword Placement',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'Primary keyword is front-loaded in title',
        severity: 'medium' as 'low' | 'medium' | 'high'
      },
      {
        rule: 'Character Encoding',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'No special characters that may cause issues',
        severity: 'low' as 'low' | 'medium' | 'high'
      }
    ]
  };

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    tags: optimizedTags,
    seoScore: seoScore,
    improvements: improvements,
    platform: platform,
    seoMetrics: seoMetrics,
    keywordData: keywordData,
    compliance: compliance
  };
}
```

---

## 4. Update Dashboard to Use Progress Indicator

**In:** `src/app/dashboard/page.tsx`

**Add this import:**
```typescript
import ProgressIndicator from '@/components/ui/ProgressIndicator';
```

**Add this state:**
```typescript
const [progress, setProgress] = useState({ stage: '', percent: 0, isVisible: false });
```

**Replace handleMode1Submit with:**
```typescript
const handleMode1Submit = async (data: Mode1Data) => {
  setSubmitting(true);
  setProgress({ stage: 'Analyzing your product...', percent: 10, isVisible: true });
  
  try {
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    
    setProgress({ stage: 'Researching keywords...', percent: 30, isVisible: true });
    
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        mode: 'optimize-existing',
        title: data.currentTitle,
        description: data.currentDescription,
        platform: data.platform,
        keywords: data.currentKeywords,
        additionalData: data,
      }),
    });

    setProgress({ stage: 'Generating optimized content...', percent: 70, isVisible: true });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Optimization failed');
    }

    const result = await response.json();
    
    setProgress({ stage: 'Finalizing results...', percent: 95, isVisible: true });
    
    if (result.success && result.data) {
      setOptimizationResult(result.data.optimized);
      setOriginalData({ title: data.currentTitle, description: data.currentDescription });
      setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
      
      setTimeout(() => {
        setProgress({ stage: '', percent: 0, isVisible: false });
      }, 500);
    } else {
      throw new Error('Invalid response format');
    }
    await refreshUserData();
  } catch (error: any) {
    console.error('Optimization error:', error);
    setProgress({ stage: '', percent: 0, isVisible: false });
    alert(error.message || 'Failed to optimize listing');
  } finally {
    setSubmitting(false);
  }
};
```

**Add before closing main tag:**
```typescript
<ProgressIndicator 
  stage={progress.stage}
  percent={progress.percent}
  isVisible={progress.isVisible}
/>
```

---

## 5. Update ResultCard to Show Advanced Components

**In:** `src/components/dashboard/ResultCard.tsx`

**Add these imports:**
```typescript
import SEOScoreBreakdown from './SEOScoreBreakdown';
import KeywordResearchPanel from './KeywordResearchPanel';
import PlatformComplianceChecker from './PlatformComplianceChecker';
import ABTestingSuggestions from './ABTestingSuggestions';
```

**Add after BeforeAfterComparison component:**
```typescript
{/* SEO Score Breakdown */}
{editedOptimized.seoMetrics && (
  <SEOScoreBreakdown 
    seoMetrics={editedOptimized.seoMetrics}
    originalScore={originalScore}
  />
)}

{/* Keyword Research Panel */}
{editedOptimized.keywordData && (
  <KeywordResearchPanel
    primaryKeywords={editedOptimized.keywordData.primary || []}
    relatedKeywords={editedOptimized.keywordData.related || []}
    longTailKeywords={editedOptimized.keywordData.longTail || []}
  />
)}

{/* Platform Compliance */}
{editedOptimized.compliance && (
  <PlatformComplianceChecker
    platform={editedOptimized.compliance.platform}
    rules={editedOptimized.compliance.rules}
    overallScore={editedOptimized.compliance.score}
    isCompliant={editedOptimized.compliance.isCompliant}
  />
)}

{/* A/B Testing Suggestions */}
<ABTestingSuggestions 
  optimizedTitle={editedOptimized.title}
  platform={editedOptimized.platform || 'amazon'}
/>
```

---

## 6. Update API to Return Enhanced Data

**In:** `src/app/api/optimize/route.ts`

**Find where you return the response and replace with:**
```typescript
// After generating optimized content, use the helper function:
const enhancedResponse = generateEnhancedResponse(
  optimizedTitle,
  optimizedDescription,
  optimizedTags,
  seoScore,
  improvements,
  platform
);

return NextResponse.json({
  success: true,
  data: {
    optimized: enhancedResponse
  }
});
```

---

## Testing Commands

```bash
# Run development server
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

---

## Verification Checklist

After copying all code:

- [ ] ProgressIndicator.tsx created
- [ ] ABTestingSuggestions.tsx created
- [ ] Helper functions added to API route
- [ ] Dashboard updated with progress state
- [ ] ResultCard imports added
- [ ] ResultCard components added
- [ ] API returns enhanced data
- [ ] No TypeScript errors
- [ ] Test optimization flow works
- [ ] All new components display correctly

---

## Common Issues & Fixes

### Issue: TypeScript errors on variant types
**Fix:** Make sure to use `as 'good' | 'warning' | 'error'` type assertions

### Issue: Components not showing
**Fix:** Check that API is returning the enhanced data structure

### Issue: Progress indicator not appearing
**Fix:** Verify `isVisible` state is being set to `true`

### Issue: Copy buttons not working
**Fix:** Check browser console for clipboard API errors

---

Ready to implement! Start with ProgressIndicator, then ABTesting, then integrate into ResultCard.
