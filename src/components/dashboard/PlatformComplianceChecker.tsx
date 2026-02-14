import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ComplianceRule {
  rule: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

interface PlatformComplianceProps {
  platform: string;
  rules: ComplianceRule[];
  overallScore: number;
  isCompliant: boolean;
}

export default function PlatformComplianceChecker({ 
  platform, 
  rules, 
  overallScore, 
  isCompliant 
}: PlatformComplianceProps) {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'fail':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Info size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Critical</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Important</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Minor</span>;
      default:
        return null;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'amazon':
        return '🛒';
      case 'shopify':
        return '🛍️';
      case 'etsy':
        return '🎨';
      case 'ebay':
        return '🏪';
      case 'walmart':
        return '🏬';
      default:
        return '📦';
    }
  };

  const passedRules = rules.filter(rule => rule.status === 'pass').length;
  const warningRules = rules.filter(rule => rule.status === 'warning').length;
  const failedRules = rules.filter(rule => rule.status === 'fail').length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getPlatformIcon(platform)}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {platform.charAt(0).toUpperCase() + platform.slice(1)} Compliance Check
            </h3>
            <p className="text-sm text-gray-600">
              Ensuring your listing meets platform guidelines
            </p>
          </div>
        </div>
        
        <div className={`text-center p-3 rounded-lg border-2 ${
          isCompliant 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className={`text-2xl font-bold ${
            isCompliant ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {overallScore}
          </div>
          <div className="text-xs font-medium text-gray-600">Compliance Score</div>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg border mb-6 ${
        isCompliant 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isCompliant ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertTriangle size={20} className="text-yellow-600" />
          )}
          <span className="font-semibold text-gray-900">
            {isCompliant ? 'Fully Compliant' : 'Compliance Issues Detected'}
          </span>
        </div>
        <p className="text-sm text-gray-700">
          {isCompliant 
            ? 'Your listing meets all platform requirements and is ready for publication.'
            : 'Some issues need attention before publishing to ensure optimal performance.'
          }
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-lg font-bold text-green-600">{passedRules}</div>
          <div className="text-xs text-green-700">Passed</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">{warningRules}</div>
          <div className="text-xs text-yellow-700">Warnings</div>
        </div>
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-lg font-bold text-red-600">{failedRules}</div>
          <div className="text-xs text-red-700">Failed</div>
        </div>
      </div>

      {/* Detailed Rules */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Detailed Compliance Check:</h4>
        
        {rules.map((rule, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getStatusColor(rule.status)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(rule.status)}
                <span className="font-medium">{rule.rule}</span>
              </div>
              {getSeverityBadge(rule.severity)}
            </div>
            
            <p className="text-sm mb-2 ml-6">{rule.message}</p>
            
            {rule.suggestion && (
              <div className="ml-6 p-2 bg-white bg-opacity-50 rounded border border-current border-opacity-20">
                <p className="text-xs">
                  <span className="font-medium">💡 Suggestion:</span> {rule.suggestion}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Platform-Specific Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">
          📋 {platform.charAt(0).toUpperCase() + platform.slice(1)} Best Practices
        </h5>
        <div className="text-sm text-blue-800 space-y-1">
          {platform.toLowerCase() === 'amazon' && (
            <>
              <p>• Use all 5 bullet points for maximum visibility</p>
              <p>• Include backend search terms (up to 250 characters)</p>
              <p>• Avoid promotional language like "Best" or "Sale"</p>
              <p>• Include size, color, and material in title</p>
            </>
          )}
          {platform.toLowerCase() === 'etsy' && (
            <>
              <p>• Use all 13 available tags for better discoverability</p>
              <p>• Include seasonal and occasion-based keywords</p>
              <p>• Write in a personal, handmade-focused tone</p>
              <p>• Mention materials and dimensions clearly</p>
            </>
          )}
          {platform.toLowerCase() === 'shopify' && (
            <>
              <p>• Optimize for your brand voice and story</p>
              <p>• Include detailed product specifications</p>
              <p>• Use high-quality, lifestyle-focused images</p>
              <p>• Add FAQ section for common questions</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}