'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Platform } from '@/types';
import { useOptimization } from '@/lib/hooks/useOptimization';
import Spinner from '@/components/ui/Spinner';

interface OptimizationFormProps {
  onSuccess: (result: any, original: any) => void;
}

export default function OptimizationForm({ onSuccess }: OptimizationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [keywords, setKeywords] = useState('');
  
  const { optimize, loading, error } = useOptimization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const originalData = { title, description };
    
    try {
      const result = await optimize({
        title,
        description,
        platform,
        keywords: keywords || undefined,
      });
      
      onSuccess(result, originalData);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      <Input
        label="Product Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter your current product title"
        required
        disabled={loading}
      />

      <Textarea
        label="Product Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter your current product description"
        rows={6}
        required
        disabled={loading}
      />

      <Input
        label="Keywords (Optional)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Enter target keywords separated by commas"
        disabled={loading}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            Optimizing...
          </span>
        ) : (
          'Optimize Product'
        )}
      </Button>
    </form>
  );
}
