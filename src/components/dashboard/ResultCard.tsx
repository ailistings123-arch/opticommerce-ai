'use client';

import { OptimizedContent } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultCardProps {
  original: {
    title: string;
    description: string;
  };
  optimized: OptimizedContent;
}

export default function ResultCard({ original, optimized }: ResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">SEO Score</h3>
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold text-blue-600">
              {optimized.seoScore}
            </div>
            <span className="text-gray-600">/100</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${optimized.seoScore}%` }}
          />
        </div>
      </Card>

      <Card title="Optimized Title">
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Original:</p>
            <p className="text-gray-800">{original.title}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2">Optimized:</p>
            <p className="text-gray-900 font-medium">{optimized.title}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(optimized.title, 'title')}
            className="w-full"
          >
            {copiedField === 'title' ? (
              <span className="flex items-center gap-2">
                <Check size={16} /> Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy size={16} /> Copy Title
              </span>
            )}
          </Button>
        </div>
      </Card>

      <Card title="Optimized Description">
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
            <p className="text-sm font-medium text-gray-600 mb-2">Original:</p>
            <p className="text-gray-800 whitespace-pre-wrap">{original.description}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium text-blue-700 mb-2">Optimized:</p>
            <p className="text-gray-900 whitespace-pre-wrap">{optimized.description}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(optimized.description, 'description')}
            className="w-full"
          >
            {copiedField === 'description' ? (
              <span className="flex items-center gap-2">
                <Check size={16} /> Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy size={16} /> Copy Description
              </span>
            )}
          </Button>
        </div>
      </Card>

      <Card title="Tags">
        <div className="flex flex-wrap gap-2 mb-4">
          {optimized.tags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 rounded-full text-sm font-medium border border-purple-200"
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
              <Check size={16} /> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Copy size={16} /> Copy Tags
            </span>
          )}
        </Button>
      </Card>

      <Card title="Improvements">
        <ul className="space-y-3">
          {optimized.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span className="text-gray-800">{improvement}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
