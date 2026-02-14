import { CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';

interface SEOMetrics {
  keywordRelevance: number;
  titleOptimization: number;
  descriptionQuality: number;
  overall: number;
  breakdown?: {
    titleLength: { score: number; status: 'good' | 'warning' | 'error'; message: string };
    keywordDensity: { score: number; status: 'good' | 'warning' | 'error'; message: string };
    readability: { score: number; status: 'good' | 'warning' | 'error'; message: string };
    structure: { score: number; status: 'good' | 'warning' | 'error'; message: string };
    uniqueness: { score: number; status: 'good' | 'warning' | 'error'; message: string };
  };
  suggestions?: string[];
  missingKeywords?: Array<{ keyword: string; searches: number }>;
}

interface SEOScoreBreakdownProps {
  seoMetrics: SEOMetrics;
  originalScore: number;
}

export default function SEOScoreBreakdown({ seoMetrics, originalScore }: SEOScoreBreakdownProps) {
  const improvement = seoMetrics.overall - originalScore;

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">📊 SEO Score Breakdown</h3>
        <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">+{improvement} improvement</span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className={`text-2xl font-bold ${getScoreColor(seoMetrics.keywordRelevance)}`}>
            {seoMetrics.keywordRelevance}
          </div>
          <div className="text-xs text-blue-700 font-medium mt-1">Keyword Relevance</div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(seoMetrics.keywordRelevance)}`}
              style={{ width: `${seoMetrics.keywordRelevance}%` }}
            />
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className={`text-2xl font-bold ${getScoreColor(seoMetrics.titleOptimization)}`}>
            {seoMetrics.titleOptimization}
          </div>
          <div className="text-xs text-green-700 font-medium mt-1">Title Optimization</div>
          <div className="w-full bg-green-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(seoMetrics.titleOptimization)}`}
              style={{ width: `${seoMetrics.titleOptimization}%` }}
            />
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className={`text-2xl font-bold ${getScoreColor(seoMetrics.descriptionQuality)}`}>
            {seoMetrics.descriptionQuality}
          </div>
          <div className="text-xs text-purple-700 font-medium mt-1">Description Quality</div>
          <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(seoMetrics.descriptionQuality)}`}
              style={{ width: `${seoMetrics.descriptionQuality}%` }}
            />
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
          <div className={`text-2xl font-bold ${getScoreColor(seoMetrics.overall)}`}>
            {seoMetrics.overall}
          </div>
          <div className="text-xs text-indigo-700 font-medium mt-1">Overall SEO</div>
          <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(seoMetrics.overall)}`}
              style={{ width: `${seoMetrics.overall}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {seoMetrics.breakdown && (
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Detailed Analysis:</h4>
          
          {Object.entries(seoMetrics.breakdown).map(([key, data]) => (
            <div key={key} className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(data.status)}`}>
              {getStatusIcon(data.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-bold">{data.score}/100</span>
                </div>
                <p className="text-sm">{data.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Missing Keywords */}
      {seoMetrics.missingKeywords && seoMetrics.missingKeywords.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">⚠️ Missing High-Value Keywords:</h4>
          <div className="space-y-2">
            {seoMetrics.missingKeywords.slice(0, 5).map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="font-medium text-gray-900">"{keyword.keyword}"</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-700">{keyword.searches.toLocaleString()}</div>
                  <div className="text-xs text-yellow-600">searches/month</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {seoMetrics.suggestions && seoMetrics.suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">💡 Suggestions for Further Improvement:</h4>
          <div className="space-y-2">
            {seoMetrics.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span className="text-sm text-gray-800">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}