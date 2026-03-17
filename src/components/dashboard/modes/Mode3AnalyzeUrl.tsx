'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Search } from 'lucide-react';
import { Platform } from '@/types';

interface Mode3Props {
  onSubmit: (data: Mode3Data) => Promise<void>;
  loading: boolean;
}

export interface Mode3Data {
  url: string;
  analysisType: 'full';
  purpose: 'competitor';
  targetPlatform?: Platform;
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'ebay', label: 'eBay' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'walmart', label: 'Walmart' },
  { value: 'woocommerce', label: 'WooCommerce' },
];

export default function Mode3AnalyzeUrl({ onSubmit, loading }: Mode3Props) {
  const [url, setUrl] = useState('');
  const [targetPlatform, setTargetPlatform] = useState<Platform | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      url,
      analysisType: 'full',
      purpose: 'competitor',
      ...(targetPlatform ? { targetPlatform } : {})
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

      {/* Target Platform (optional override) */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Optimize For Platform <span className="text-gray-400 font-normal">(optional — auto-detected from URL)</span>
        </label>
        <select
          value={targetPlatform}
          onChange={(e) => setTargetPlatform(e.target.value as Platform | '')}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Auto-detect from URL</option>
          {PLATFORMS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Override if you want to optimize a competitor&apos;s listing for a different platform
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
