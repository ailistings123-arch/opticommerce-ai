/**
 * AI Listing Generator Component
 * Example integration of Gemini AI into dashboard
 */

'use client';

import { useState } from 'react';
import { Platform } from '@/types';

interface ProductData {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  keywords?: string[];
}

interface GeneratedListing {
  title: string;
  bullets: string[];
  description: string;
  keywords: string[];
  platform_notes: string;
}

export default function AIListingGenerator() {
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [productData, setProductData] = useState<ProductData>({
    title: '',
    description: '',
    category: '',
    keywords: []
  });
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedListing(null);

    try {
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform,
          mode: 'create',
          productData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate listing');
      }

      const result = await response.json();
      setGeneratedListing(result.data);

    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred while generating the listing');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordInput = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setProductData({ ...productData, keywords });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">AI Listing Generator</h2>

        {/* Platform Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          >
            <option value="amazon">Amazon</option>
            <option value="ebay">eBay</option>
            <option value="etsy">Etsy</option>
            <option value="shopify">Shopify</option>
            <option value="walmart">Walmart</option>
            <option value="woocommerce">WooCommerce</option>
          </select>
        </div>

        {/* Product Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Product Title</label>
          <input
            type="text"
            value={productData.title}
            onChange={(e) => setProductData({ ...productData, title: e.target.value })}
            placeholder="Enter product title"
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        {/* Product Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Product Description</label>
          <textarea
            value={productData.description}
            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
            placeholder="Enter product description"
            rows={4}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Category</label>
          <input
            type="text"
            value={productData.category}
            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
            placeholder="e.g., Electronics, Home & Garden"
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        {/* Keywords */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
          <input
            type="text"
            value={productData.keywords?.join(', ')}
            onChange={(e) => handleKeywordInput(e.target.value)}
            placeholder="wireless, bluetooth, premium"
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !productData.title}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating with AI...
            </span>
          ) : (
            'Generate Optimized Listing'
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Generated Listing Display */}
      {generatedListing && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-xl font-bold text-green-600">✓ Listing Generated Successfully</h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Optimized Title</label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="font-medium">{generatedListing.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {generatedListing.title.length} characters
              </p>
            </div>
          </div>

          {/* Bullets */}
          <div>
            <label className="block text-sm font-medium mb-2">Bullet Points</label>
            <div className="space-y-2">
              {generatedListing.bullets.map((bullet, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <div className="p-3 bg-gray-50 rounded-md border max-h-64 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{generatedListing.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                {generatedListing.description.length} characters
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <div className="flex flex-wrap gap-2">
              {generatedListing.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Platform Notes */}
          {generatedListing.platform_notes && (
            <div>
              <label className="block text-sm font-medium mb-2">Platform Notes</label>
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">{generatedListing.platform_notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(generatedListing, null, 2));
                alert('Copied to clipboard!');
              }}
              className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Copy JSON
            </button>
            <button
              onClick={() => setGeneratedListing(null)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
