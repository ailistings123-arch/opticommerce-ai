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
