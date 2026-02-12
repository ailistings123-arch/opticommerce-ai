'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Platform } from '@/types';
import Spinner from '@/components/ui/Spinner';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface UrlOptimizationFormProps {
  onSuccess: (result: any, original: any) => void;
}

export default function UrlOptimizationForm({ onSuccess }: UrlOptimizationFormProps) {
  const [productUrl, setProductUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const detectPlatform = (url: string): Platform | null => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon.')) return 'amazon';
    if (urlLower.includes('shopify.') || urlLower.includes('.myshopify.')) return 'shopify';
    if (urlLower.includes('etsy.')) return 'etsy';
    if (urlLower.includes('ebay.')) return 'ebay';
    return null;
  };

  const handleUrlChange = (url: string) => {
    setProductUrl(url);
    const detected = detectPlatform(url);
    if (detected) {
      setPlatform(detected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalyzing(true);

    try {
      // Get auth token
      const { auth } = await import('@/lib/firebase/config');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }
      const token = await user.getIdToken();

      // Call API to analyze URL
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: productUrl, platform }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze URL');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze URL');
      }

      setAnalyzing(false);
      
      // Now optimize the extracted data
      const optimizeResponse = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.data.title,
          description: data.data.description,
          platform,
        }),
      });

      const optimizeData = await optimizeResponse.json();

      if (!optimizeData.success) {
        throw new Error(optimizeData.error || 'Optimization failed');
      }

      onSuccess(optimizeData.data, {
        title: data.data.title,
        description: data.data.description,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze product URL');
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <LinkIcon className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Paste any product URL from Amazon, Shopify, Etsy, or eBay</li>
              <li>Our AI will analyze the existing listing</li>
              <li>Get optimized title, description, and SEO improvements</li>
            </ol>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Product URL
        </label>
        <div className="relative">
          <Input
            type="url"
            value={productUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.amazon.com/product/..."
            required
            disabled={loading}
            className="pr-10"
          />
          <ExternalLink 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Paste the full URL of the product you want to optimize
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Platform
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <option value="amazon" className="text-gray-900 bg-white">Amazon</option>
          <option value="shopify" className="text-gray-900 bg-white">Shopify</option>
          <option value="etsy" className="text-gray-900 bg-white">Etsy</option>
          <option value="ebay" className="text-gray-900 bg-white">eBay</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Platform auto-detected from URL
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {analyzing && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Spinner size="sm" />
            <div>
              <p className="text-purple-800 font-semibold">Analyzing product page...</p>
              <p className="text-purple-600 text-sm">Extracting title, description, and images</p>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading || !productUrl}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            {analyzing ? 'Analyzing URL...' : 'Optimizing...'}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <LinkIcon size={18} />
            Analyze & Optimize URL
          </span>
        )}
      </Button>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">1</div>
          <div className="text-xs text-gray-600">URL Analysis</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-xs text-gray-600">AI Optimization</div>
        </div>
      </div>
    </form>
  );
}
