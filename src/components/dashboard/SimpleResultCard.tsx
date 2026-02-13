'use client';

import { OptimizedContent } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SimpleResultCardProps {
  optimized: OptimizedContent;
}

export default function SimpleResultCard({ optimized }: SimpleResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* No SEO Score for Create New Product */}

      <Card title="Optimized Title">
        <div className="space-y-2 sm:space-y-3">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm sm:text-base text-gray-900 font-medium">{optimized.title}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(optimized.title, 'title')}
            className="w-full"
          >
            {copiedField === 'title' ? (
              <span className="flex items-center gap-2">
                <Check size={14} className="sm:w-4 sm:h-4" /> Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy size={14} className="sm:w-4 sm:h-4" /> Copy Title
              </span>
            )}
          </Button>
        </div>
      </Card>

      <Card title="Optimized Description">
        <div className="space-y-2 sm:space-y-3">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200 max-h-40 sm:max-h-48 overflow-y-auto">
            <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">{optimized.description}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(optimized.description, 'description')}
            className="w-full"
          >
            {copiedField === 'description' ? (
              <span className="flex items-center gap-2">
                <Check size={14} className="sm:w-4 sm:h-4" /> Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy size={14} className="sm:w-4 sm:h-4" /> Copy Description
              </span>
            )}
          </Button>
        </div>
      </Card>

      <Card title="Optimized Tags">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {optimized.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 rounded-full text-xs sm:text-sm font-medium border border-purple-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(optimized.tags.join(', '), 'tags')}
          className="w-full"
        >
          {copiedField === 'tags' ? (
            <span className="flex items-center gap-2">
              <Check size={14} className="sm:w-4 sm:h-4" /> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Copy size={14} className="sm:w-4 sm:h-4" /> Copy All Tags
            </span>
          )}
        </Button>
      </Card>

      <Card title="Key Features">
        <ul className="space-y-2 sm:space-y-3">
          {optimized.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-600 font-bold mt-0.5 text-sm sm:text-base">✓</span>
              <span className="text-xs sm:text-sm text-gray-800">{improvement}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
