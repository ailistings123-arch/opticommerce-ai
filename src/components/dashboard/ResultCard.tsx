'use client';

import { OptimizedContent } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Copy, Check, TrendingUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import BeforeAfterComparison from './BeforeAfterComparison';
import ExportOptions from './ExportOptions';
import EditableContent from './EditableContent';
import CopyButton from '@/components/ui/CopyButton';
import SEOScoreBreakdown from './SEOScoreBreakdown';
import KeywordResearchPanel from './KeywordResearchPanel';
import PlatformComplianceChecker from './PlatformComplianceChecker';
import ABTestingSuggestions from './ABTestingSuggestions';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

interface ResultCardProps {
  original: {
    title: string;
    description: string;
  };
  optimized: any; // Changed to any to accept enhanced response
}

// Calculate original SEO score based on basic metrics - REALISTIC LOW SCORES
function calculateOriginalScore(title: string, description: string): number {
  let score = 0;
  
  // Title length (max 15 points) - Be strict
  const titleLength = title.length;
  if (titleLength >= 50 && titleLength <= 150) {
    score += 15;
  } else if (titleLength >= 30 && titleLength < 50) {
    score += 8;
  } else if (titleLength > 150 && titleLength <= 200) {
    score += 8;
  } else {
    score += 3;
  }
  
  // Description length (max 20 points) - Be strict
  const descLength = description.length;
  if (descLength >= 500) {
    score += 20;
  } else if (descLength >= 300) {
    score += 12;
  } else if (descLength >= 150) {
    score += 7;
  } else if (descLength >= 50) {
    score += 3;
  } else {
    score += 1;
  }
  
  // Keyword diversity (max 12 points) - Be strict
  const words = (title + ' ' + description).toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words.filter(w => w.length > 3));
  if (uniqueWords.size >= 20) {
    score += 12;
  } else if (uniqueWords.size >= 10) {
    score += 7;
  } else {
    score += 3;
  }
  
  // Readability (max 10 points) - Be strict
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 5) {
    score += 10;
  } else if (sentences.length >= 3) {
    score += 5;
  } else {
    score += 2;
  }
  
  // Structure quality (max 18 points) - Be strict
  const hasCapitalization = /[A-Z]/.test(title);
  const hasNumbers = /\d/.test(title + description);
  const hasPunctuation = /[,\-|•]/.test(description);
  const hasBulletPoints = /[•\-\*]/.test(description);
  const hasLineBreaks = /\n/.test(description);
  const hasSpecificMeasurements = /\d+\s*(oz|ml|inch|cm|lb|kg|gb|mb)/i.test(title + description);
  
  if (hasCapitalization) score += 3;
  if (hasNumbers) score += 3;
  if (hasPunctuation) score += 3;
  if (hasBulletPoints) score += 3;
  if (hasLineBreaks) score += 3;
  if (hasSpecificMeasurements) score += 3;
  
  // Penalize for common issues
  const hasBannedWords = /(premium|luxury|best|top|perfect|ultimate|amazing|quality)/i.test(title);
  const isTooShort = titleLength < 20 || descLength < 100;
  const lacksDetail = !hasNumbers && !hasSpecificMeasurements;
  
  if (hasBannedWords) score -= 5;
  if (isTooShort) score -= 8;
  if (lacksDetail) score -= 5;
  
  // Return realistic low score (20-65 range for originals)
  return Math.min(Math.max(score, 20), 65);
}

// Clean original title by removing store names and HTML entities
function cleanOriginalTitle(title: string): string {
  let cleaned = title;
  
  // Remove HTML entities
  cleaned = cleaned.replace(/&[a-z]+;/gi, '');
  
  // Remove store names and suffixes
  cleaned = cleaned.replace(/[\s]*[\-–—]+[\s]*[A-Z][a-zA-Z0-9\.\s]+$/g, '');
  cleaned = cleaned.replace(/[\s]+(by|from)[\s]+[A-Z][a-zA-Z0-9\.\s]+$/gi, '');
  cleaned = cleaned.replace(/[\s]*[\-–—]+[\s]*[A-Z][a-zA-Z]+(\.[A-Z]{2,})?$/g, '');
  cleaned = cleaned.replace(/[\s]*[\-–—]*[\s]*(Phonecase\.PK|PhoneCase\.PK|phonecase\.pk)/gi, '');
  cleaned = cleaned.replace(/[\s]*[\-–—]*[\s]*[a-zA-Z0-9]+\.(com|pk|net|org|co|uk|in|us)$/gi, '');
  
  // Clean up extra spaces and dashes
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/[\-–—\s]+$/g, '').trim();
  cleaned = cleaned.replace(/^[\-–—\s]+/g, '').trim();
  
  return cleaned;
}

export default function ResultCard({ original, optimized }: ResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editedOptimized, setEditedOptimized] = useState(optimized);
  const { success, toasts, removeToast } = useToast();
  
  const cleanedOriginalTitle = cleanOriginalTitle(original.title);
  const originalScore = calculateOriginalScore(original.title, original.description);
  const optimizedScore = editedOptimized.seoScore || editedOptimized.seo_score_new || 85;
  const improvement = optimizedScore - originalScore;

  // Check if we have enhanced data
  const hasEnhancedData = editedOptimized.compliance || editedOptimized.seoMetrics || editedOptimized.bulletPoints;

  const handleCopy = (text: string, field: string) => {
    setCopiedField(field);
    success(`${field} copied!`, 'Content copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleContentSave = (field: string, newContent: string) => {
    setEditedOptimized((prev: typeof optimized) => ({
      ...prev,
      [field]: newContent
    }));
  };

  const exportData = {
    original,
    optimized: editedOptimized
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="space-y-4 sm:space-y-6">
        {/* Before & After Comparison */}
        <BeforeAfterComparison 
          original={{ 
            title: original.title, 
            description: original.description,
            seoScore: originalScore 
          }}
          optimized={{
            title: editedOptimized.title,
            description: editedOptimized.description,
            seoScore: optimizedScore,
            tags: editedOptimized.tags
          }}
        />

        {/* Export Options */}
        <Card>
          <ExportOptions data={exportData} />
        </Card>

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

      {/* Before & After SEO Score Comparison */}
      <Card>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">SEO Score Improvement</h3>
        
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Before Score */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm sm:text-base font-medium text-gray-600">Before Optimization</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="text-2xl sm:text-3xl font-bold text-gray-700">
                  {originalScore}
                </div>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
              <div
                className="bg-gray-400 h-2.5 sm:h-3 rounded-full transition-all"
                style={{ width: `${originalScore}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Original listing score</p>
          </div>

          {/* After Score */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              +{improvement}
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm sm:text-base font-medium text-gray-700">After Optimization</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {optimizedScore}
                </div>
                <span className="text-sm text-gray-600">/100</span>
              </div>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5 sm:h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-green-500 h-2.5 sm:h-3 rounded-full transition-all"
                style={{ width: `${optimizedScore}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-blue-700 mt-2 font-medium">Optimized listing score</p>
          </div>
        </div>

        {/* Enhanced Metrics Display */}
        {hasEnhancedData && optimized.seoMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Keyword Relevance</p>
              <p className="text-lg font-bold text-blue-600">{optimized.seoMetrics.keywordRelevance || 0}/100</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Title Optimization</p>
              <p className="text-lg font-bold text-green-600">{optimized.seoMetrics.titleOptimization || 0}/100</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Description Quality</p>
              <p className="text-lg font-bold text-purple-600">{optimized.seoMetrics.descriptionQuality || 0}/100</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Overall SEO</p>
              <p className="text-lg font-bold text-indigo-600">{optimized.seoMetrics.overall || 0}/100</p>
            </div>
          </div>
        )}

        {/* Compliance Status */}
        {hasEnhancedData && optimized.compliance && (
          <div className={`border rounded-lg p-4 ${
            optimized.compliance.isCompliant 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-lg ${optimized.compliance.isCompliant ? 'text-green-600' : 'text-yellow-600'}`}>
                {optimized.compliance.isCompliant ? '✓' : '⚠'}
              </span>
              <p className="font-semibold text-gray-900">
                {optimized.compliance.isCompliant ? 'Fully Compliant' : 'Compliance Warnings'}
              </p>
              <span className="ml-auto text-sm font-medium">
                Score: {optimized.compliance.score}/100
              </span>
            </div>
            {optimized.compliance.violations && optimized.compliance.violations.length > 0 && (
              <div className="mt-2 space-y-1">
                {optimized.compliance.violations.slice(0, 3).map((violation: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-700">
                    • {violation.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Improvement Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-green-500 text-white rounded-full p-2 flex-shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm sm:text-base font-semibold text-green-900">
              {improvement}% Improvement
            </p>
            <p className="text-xs sm:text-sm text-green-700">
              Your listing is now {improvement}% more optimized for search engines
            </p>
          </div>
        </div>
      </Card>

        <Card title="Optimized Title">
          <div className="space-y-3">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Original:</p>
              <p className="text-sm sm:text-base text-gray-800">{cleanedOriginalTitle}</p>
            </div>
            <div className="flex items-center justify-center py-1">
              <ArrowRight className="text-blue-600" size={20} />
            </div>
            
            <EditableContent
              label="Title"
              content={editedOptimized.title}
              maxLength={200}
              optimal={{ min: 150, max: 180 }}
              onSave={(newContent) => handleContentSave('title', newContent)}
              placeholder="Enter optimized title..."
            />
            
            <CopyButton
              text={editedOptimized.title}
              label="Title"
              onCopy={handleCopy}
              showEdit={false}
              className="w-full"
            />
          </div>
        </Card>

        <Card title="Optimized Description">
          <div className="space-y-3">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-28 sm:max-h-32 overflow-y-auto">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Original:</p>
              <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">{original.description}</p>
            </div>
            <div className="flex items-center justify-center py-1">
              <ArrowRight className="text-blue-600" size={20} />
            </div>
            
            <EditableContent
              label="Description"
              content={editedOptimized.description}
              maxLength={2000}
              optimal={{ min: 500, max: 1500 }}
              multiline={true}
              onSave={(newContent) => handleContentSave('description', newContent)}
              placeholder="Enter optimized description..."
            />
            
            <CopyButton
              text={editedOptimized.description}
              label="Description"
              onCopy={handleCopy}
              showEdit={false}
              className="w-full"
            />
          </div>
        </Card>

        <Card title="Optimized Tags">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {(editedOptimized.tags || []).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 rounded-full text-xs sm:text-sm font-medium border border-purple-200"
              >
                {tag}
              </span>
            ))}
          </div>
          <CopyButton
            text={(editedOptimized.tags || []).join(', ')}
            label="Tags"
            onCopy={handleCopy}
            showEdit={false}
            className="w-full"
          />
        </Card>

      {/* Bullet Points (Amazon/Walmart) */}
      {hasEnhancedData && editedOptimized.bulletPoints && editedOptimized.bulletPoints.length > 0 && (
        <Card title="Product Bullet Points">
          <div className="space-y-2 mb-4">
            {(editedOptimized.bulletPoints || []).map((bullet: string, index: number) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <p className="text-sm text-gray-800">{bullet}</p>
              </div>
            ))}
          </div>
          <CopyButton
            text={(editedOptimized.bulletPoints || []).join('\n')}
            label="Bullet Points"
            onCopy={handleCopy}
            showEdit={false}
            className="w-full"
          />
        </Card>
      )}

      {/* Backend Search Terms (Amazon) */}
      {hasEnhancedData && editedOptimized.backendSearchTerms && editedOptimized.backendSearchTerms.length > 0 && (
        <Card title="Backend Search Terms">
          <p className="text-xs text-gray-600 mb-3">
            These keywords help your product appear in more searches (not visible to customers)
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(editedOptimized.backendSearchTerms || []).map((term: string, index: number) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-300"
              >
                {term}
              </span>
            ))}
          </div>
          <CopyButton
            text={(editedOptimized.backendSearchTerms || []).join(' ')}
            label="Search Terms"
            onCopy={handleCopy}
            showEdit={false}
            className="w-full"
          />
        </Card>
      )}

        <Card title="Key Improvements Made">
          <ul className="space-y-2 sm:space-y-3">
            {(editedOptimized.improvements || []).map((improvement: string, index: number) => (
              <li key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 font-bold mt-0.5 text-sm sm:text-base">✓</span>
                <span className="text-xs sm:text-sm text-gray-800">{improvement}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
