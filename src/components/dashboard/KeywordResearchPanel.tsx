import { Search, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import Card from '@/components/ui/Card';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: 'Low' | 'Medium' | 'High';
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  difficulty: number;
}

interface KeywordResearchPanelProps {
  primaryKeywords: KeywordData[];
  relatedKeywords: KeywordData[];
  longTailKeywords: KeywordData[];
}

export default function KeywordResearchPanel({ 
  primaryKeywords, 
  relatedKeywords, 
  longTailKeywords 
}: KeywordResearchPanelProps) {
  
  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-green-600" />;
      case 'down': return <TrendingDown size={14} className="text-red-600" />;
      default: return <span className="w-3.5 h-3.5 bg-gray-400 rounded-full"></span>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const KeywordRow = ({ keyword }: { keyword: KeywordData }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 truncate">"{keyword.keyword}"</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCompetitionColor(keyword.competition)}`}>
            {keyword.competition}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Search size={12} />
            <span>{formatNumber(keyword.searchVolume)}/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={12} />
            <span>${keyword.cpc.toFixed(2)} CPC</span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={12} />
            <span>{keyword.difficulty}/100 difficulty</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        {getTrendIcon(keyword.trend)}
        <span className={`text-xs font-medium ${
          keyword.trend === 'up' ? 'text-green-600' : 
          keyword.trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {keyword.trend === 'stable' ? '0%' : `${keyword.trendPercentage > 0 ? '+' : ''}${keyword.trendPercentage}%`}
        </span>
      </div>
    </div>
  );

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <Search className="text-blue-600" size={20} />
        <h3 className="text-xl font-bold text-gray-900">🔍 Keyword Research Insights</h3>
      </div>

      {/* Primary Keywords */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🎯 Primary Keywords
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            High Impact
          </span>
        </h4>
        <div className="space-y-2">
          {primaryKeywords.map((keyword, index) => (
            <KeywordRow key={index} keyword={keyword} />
          ))}
        </div>
      </div>

      {/* Related Keywords */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🔗 Related Keywords
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Opportunity
          </span>
        </h4>
        <div className="space-y-2">
          {relatedKeywords.slice(0, 5).map((keyword, index) => (
            <KeywordRow key={index} keyword={keyword} />
          ))}
        </div>
        {relatedKeywords.length > 5 && (
          <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
            View {relatedKeywords.length - 5} more related keywords →
          </button>
        )}
      </div>

      {/* Long-tail Keywords */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📈 Long-tail Keywords
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Low Competition
          </span>
        </h4>
        <div className="space-y-2">
          {longTailKeywords.slice(0, 4).map((keyword, index) => (
            <KeywordRow key={index} keyword={keyword} />
          ))}
        </div>
        {longTailKeywords.length > 4 && (
          <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
            View {longTailKeywords.length - 4} more long-tail keywords →
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h5 className="font-semibold text-gray-900 mb-2">📊 Research Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {formatNumber(primaryKeywords.reduce((sum, k) => sum + k.searchVolume, 0))}
            </div>
            <div className="text-xs text-gray-600">Total Monthly Searches</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              ${(primaryKeywords.reduce((sum, k) => sum + k.cpc, 0) / primaryKeywords.length).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Avg. CPC</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {Math.round(primaryKeywords.reduce((sum, k) => sum + k.difficulty, 0) / primaryKeywords.length)}
            </div>
            <div className="text-xs text-gray-600">Avg. Difficulty</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {primaryKeywords.filter(k => k.competition === 'Low').length}
            </div>
            <div className="text-xs text-gray-600">Low Competition</div>
          </div>
        </div>
      </div>
    </Card>
  );
}