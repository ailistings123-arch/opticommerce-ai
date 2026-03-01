'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Search } from 'lucide-react';

interface Mode3Props {
  onSubmit: (data: Mode3Data) => Promise<void>;
  loading: boolean;
}

export interface Mode3Data {
  url: string;
  analysisType: 'full';
  purpose: 'competitor';
}

export default function Mode3AnalyzeUrl({ onSubmit, loading }: Mode3Props) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      url,
      analysisType: 'full',
      purpose: 'competitor'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Product URL <span className="text-red-500">*</span>
        </label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.amazon.com/product/..."
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste any product URL from Amazon, Shopify, eBay, Etsy, Walmart, or WooCommerce
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !url}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span>Analyzing & Optimizing...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Search size={18} />
            <span>Analyze & Optimize URL</span>
          </span>
        )}
      </Button>
    </form>
  );
}
