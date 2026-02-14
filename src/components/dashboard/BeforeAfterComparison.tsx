import { ArrowRight, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import CharacterCounter from '@/components/ui/CharacterCounter';

interface BeforeAfterComparisonProps {
  original: {
    title: string;
    description: string;
    seoScore?: number;
  };
  optimized: {
    title: string;
    description: string;
    seoScore: number;
    tags?: string[];
  };
}

export default function BeforeAfterComparison({ original, optimized }: BeforeAfterComparisonProps) {
  const originalScore = original.seoScore || 45; // Default low score
  const improvement = optimized.seoScore - originalScore;
  
  const originalKeywords = (original.title + ' ' + original.description)
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .length;
    
  const optimizedKeywords = (optimized.title + ' ' + optimized.description)
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .length;

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Before vs After Comparison</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* BEFORE Column */}
        <div className="space-y-4">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📊 BEFORE
            </h4>
            
            {/* SEO Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">SEO Score</span>
                <span className="text-2xl font-bold text-gray-700">{originalScore}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-400 h-3 rounded-full"
                  style={{ width: `${originalScore}%` }}
                />
              </div>
            </div>

            {/* Title Analysis */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Title:</p>
              <p className="text-sm text-gray-800 bg-white p-3 rounded border line-clamp-2">
                {original.title}
              </p>
              <CharacterCounter 
                current={original.title.length} 
                max={200}
                optimal={{ min: 150, max: 180 }}
                className="mt-2"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded border">
                <p className="text-lg font-bold text-gray-700">{original.title.length}</p>
                <p className="text-xs text-gray-600">Characters</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-lg font-bold text-gray-700">{originalKeywords}</p>
                <p className="text-xs text-gray-600">Keywords</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <ArrowRight className="text-blue-600" size={24} />
          </div>
        </div>

        {/* Mobile Arrow */}
        <div className="md:hidden flex items-center justify-center py-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <ArrowRight className="text-blue-600 rotate-90" size={20} />
          </div>
        </div>

        {/* AFTER Column */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-4 relative">
            {/* Improvement Badge */}
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              +{improvement}
            </div>
            
            <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              ✨ AFTER
            </h4>
            
            {/* SEO Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">SEO Score</span>
                <span className="text-2xl font-bold text-blue-600">{optimized.seoScore}</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-green-500 h-3 rounded-full"
                  style={{ width: `${optimized.seoScore}%` }}
                />
              </div>
            </div>

            {/* Title Analysis */}
            <div className="mb-4">
              <p className="text-sm font-medium text-blue-600 mb-2">Title:</p>
              <p className="text-sm text-gray-900 bg-white p-3 rounded border line-clamp-2 font-medium">
                {optimized.title}
              </p>
              <CharacterCounter 
                current={optimized.title.length} 
                max={200}
                optimal={{ min: 150, max: 180 }}
                className="mt-2"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded border">
                <p className="text-lg font-bold text-blue-600">{optimized.title.length}</p>
                <p className="text-xs text-blue-600">Characters</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-lg font-bold text-blue-600">{optimizedKeywords}</p>
                <p className="text-xs text-blue-600">Keywords</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-2">🎯 Improvement Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-700">+{improvement}</p>
            <p className="text-xs text-green-600">SEO Score</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-700">+{optimized.title.length - original.title.length}</p>
            <p className="text-xs text-green-600">Characters</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-700">+{optimizedKeywords - originalKeywords}</p>
            <p className="text-xs text-green-600">Keywords</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-700">{optimized.tags?.length || 0}</p>
            <p className="text-xs text-green-600">Tags Added</p>
          </div>
        </div>
      </div>
    </Card>
  );
}