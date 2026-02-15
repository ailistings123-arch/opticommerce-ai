'use client';

import { useState, useEffect } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import UpgradeModal from './UpgradeModal';
import EngineSelector, { Engine } from './EngineSelector';
import { Platform } from '@/types';
import { useOptimization } from '@/lib/hooks/useOptimization';
import { useAuth } from '@/lib/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import { Sparkles } from 'lucide-react';

import { User } from '@/types';

interface OptimizationFormProps {
  onSuccess: (result: any, original: any) => void;
  userData?: User;
}

export default function OptimizationForm({ onSuccess, userData }: OptimizationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [keywords, setKeywords] = useState('');
  const [engine, setEngine] = useState<Engine>('gemini');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { optimize, loading, error } = useOptimization();

  // Load engine selection from session storage on mount (Requirement 2.3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEngine = sessionStorage.getItem('selectedEngine') as Engine;
      if (savedEngine === 'gemini' || savedEngine === 'deepseek') {
        setEngine(savedEngine);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const originalData = { title, description };
    
    try {
      // Pass engine parameter to API (Requirement 2.4)
      const result = await optimize({
        title,
        description,
        platform,
        keywords: keywords || undefined,
        engine, // Include selected engine
      });
      
      onSuccess(result, originalData);
    } catch (err: any) {
      // Check if error is quota exceeded
      if (err.message?.includes('Usage limit exceeded') || err.message?.includes('quota')) {
        setShowUpgradeModal(true);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Engine Selector - Requirements: 2.1, 2.2 */}
        <EngineSelector
          selectedEngine={engine}
          onEngineChange={setEngine}
          disabled={loading}
        />

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5 sm:mb-2">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <option value="amazon" className="text-gray-900 bg-white">Amazon</option>
            <option value="shopify" className="text-gray-900 bg-white">Shopify</option>
            <option value="etsy" className="text-gray-900 bg-white">Etsy</option>
            <option value="ebay" className="text-gray-900 bg-white">eBay</option>
            <option value="walmart" className="text-gray-900 bg-white">Walmart</option>
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

        {error && !error.includes('Usage limit exceeded') && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm sm:text-base">
                Optimizing with {engine === 'gemini' ? 'Gemini' : 'DeepSeek'}...
              </span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              <span className="text-sm sm:text-base">Optimize Product</span>
            </span>
          )}
        </Button>
      </form>

      {/* Upgrade Modal */}
      {userData && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentUsage={userData.usageCount}
          usageLimit={userData.usageLimit}
        />
      )}
    </>
  );
}
