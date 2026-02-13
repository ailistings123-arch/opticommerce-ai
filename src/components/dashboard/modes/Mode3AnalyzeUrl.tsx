'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Platform } from '@/types';
import Spinner from '@/components/ui/Spinner';
import { Search } from 'lucide-react';
import ExpandableSection from '../forms/ExpandableSection';

interface Mode3Props {
  onSubmit: (data: Mode3Data) => Promise<void>;
  loading: boolean;
}

export interface Mode3Data {
  url: string;
  analysisType: 'full' | 'seo-audit' | 'competitive' | 'create-similar';
  purpose: 'own-product' | 'competitor' | 'inspiration';
  
  // For create-similar option
  productDifferences?: string;
  yourPricePoint?: number;
  yourBrandName?: string;
  additionalFeatures?: string;
}

export default function Mode3AnalyzeUrl({ onSubmit, loading }: Mode3Props) {
  const [formData, setFormData] = useState<Mode3Data>({
    url: '',
    analysisType: 'full',
    purpose: 'competitor',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Paste Product URL <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://www.amazon.com/product/..."
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported: Amazon, Shopify, eBay, Etsy, Walmart, WooCommerce
        </p>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Purpose of Analysis <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="purpose"
              value="own-product"
              checked={formData.purpose === 'own-product'}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Analyze my own product listing</div>
              <div className="text-sm text-gray-600">Get optimization recommendations</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="purpose"
              value="competitor"
              checked={formData.purpose === 'competitor'}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Analyze competitor's product</div>
              <div className="text-sm text-gray-600">Understand their strategy and keywords</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="purpose"
              value="inspiration"
              checked={formData.purpose === 'inspiration'}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Get inspiration for my similar product</div>
              <div className="text-sm text-gray-600">Create optimized listing based on this</div>
            </div>
          </label>
        </div>
      </div>

      {/* Analysis Type */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          What would you like to do? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="analysisType"
              value="full"
              checked={formData.analysisType === 'full'}
              onChange={(e) => setFormData({ ...formData, analysisType: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Full SEO & Competitive Analysis</div>
              <div className="text-sm text-gray-600">
                Complete breakdown of listing quality, SEO score, keywords, and recommendations
              </div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="analysisType"
              value="create-similar"
              checked={formData.analysisType === 'create-similar'}
              onChange={(e) => setFormData({ ...formData, analysisType: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Create Similar Listing</div>
              <div className="text-sm text-gray-600">
                Use this as inspiration to create optimized listing for your similar product
              </div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="analysisType"
              value="competitive"
              checked={formData.analysisType === 'competitive'}
              onChange={(e) => setFormData({ ...formData, analysisType: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Competitor Intelligence</div>
              <div className="text-sm text-gray-600">
                Understand competitor's strategy, keywords, and positioning
              </div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="analysisType"
              value="seo-audit"
              checked={formData.analysisType === 'seo-audit'}
              onChange={(e) => setFormData({ ...formData, analysisType: e.target.value as any })}
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900">Quick SEO Audit</div>
              <div className="text-sm text-gray-600">
                Fast analysis of SEO strengths and weaknesses
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Additional Info for Create Similar */}
      {formData.analysisType === 'create-similar' && (
        <ExpandableSection title="How is your product different?" defaultExpanded>
          <div className="space-y-3">
            <Textarea
              label="Your Product Differences"
              value={formData.productDifferences || ''}
              onChange={(e) => setFormData({ ...formData, productDifferences: e.target.value })}
              placeholder="Example: My product is eco-friendly, comes in more colors, has better warranty"
              rows={3}
              disabled={loading}
            />

            <Input
              label="Your Price Point"
              type="number"
              value={formData.yourPricePoint || ''}
              onChange={(e) => setFormData({ ...formData, yourPricePoint: parseFloat(e.target.value) })}
              placeholder="29.99"
              disabled={loading}
            />

            <Input
              label="Your Brand Name"
              value={formData.yourBrandName || ''}
              onChange={(e) => setFormData({ ...formData, yourBrandName: e.target.value })}
              placeholder="Your brand name"
              disabled={loading}
            />

            <Textarea
              label="Additional Features/Benefits"
              value={formData.additionalFeatures || ''}
              onChange={(e) => setFormData({ ...formData, additionalFeatures: e.target.value })}
              placeholder="List any additional features your product has..."
              rows={3}
              disabled={loading}
            />
          </div>
        </ExpandableSection>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span>Analyzing URL...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Search size={18} />
            <span>Analyze URL</span>
          </span>
        )}
      </Button>
    </form>
  );
}
