'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Platform } from '@/types';
import Spinner from '@/components/ui/Spinner';
import { Sparkles } from 'lucide-react';
import ExpandableSection from '../forms/ExpandableSection';
import ImageUpload from '../forms/ImageUpload';

interface Mode1Props {
  onSubmit: (data: Mode1Data) => Promise<void>;
  loading: boolean;
}

export interface Mode1Data {
  platform: Platform;
  currentTitle: string;
  currentDescription: string;
  currentBullets: string[];
  currentKeywords: string;
  images: File[];
  
  // Basic Info
  category?: string;
  brand?: string;
  targetAudience?: string[];
  ageRange?: string;
  pricePoint?: { min: number; max: number };
  
  // Specifications
  dimensions?: { length: number; width: number; height: number; unit: string };
  weight?: { value: number; unit: string };
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  quantity?: string;
  
  // USPs
  keyFeatures?: string[];
  uniqueBenefits?: string;
  competitiveAdvantages?: string;
  
  // Target & Use Cases
  idealCustomer?: string;
  useCases?: string[];
  locations?: string[];
  occasions?: string[];
  
  // Performance
  monthlyViews?: number;
  conversionRate?: number;
  customerComplaints?: string;
  improvementGoals?: string[];
  
  // Preferences
  tone?: string;
  focusAreas?: string[];
  keywordStrategy?: string;
}

export default function Mode1OptimizeExisting({ onSubmit, loading }: Mode1Props) {
  const [formData, setFormData] = useState<Mode1Data>({
    platform: 'amazon',
    currentTitle: '',
    currentDescription: '',
    currentBullets: ['', '', '', '', ''],
    currentKeywords: '',
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formData.currentBullets];
    newBullets[index] = value;
    setFormData({ ...formData, currentBullets: newBullets });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Platform <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        >
          <option value="amazon">Amazon</option>
          <option value="shopify">Shopify</option>
          <option value="etsy">Etsy</option>
          <option value="ebay">eBay</option>
          <option value="walmart">Walmart</option>
        </select>
      </div>

      {/* Current Listing */}
      <Input
        label="Current Product Title"
        value={formData.currentTitle}
        onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
        placeholder="Paste your current product title"
        required
        disabled={loading}
      />

      <Textarea
        label="Current Product Description"
        value={formData.currentDescription}
        onChange={(e) => setFormData({ ...formData, currentDescription: e.target.value })}
        placeholder="Paste your current product description"
        rows={6}
        required
        disabled={loading}
      />

      {/* Current Bullet Points */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Current Bullet Points / Key Features
        </label>
        {formData.currentBullets.map((bullet, index) => (
          <Input
            key={index}
            value={bullet}
            onChange={(e) => updateBullet(index, e.target.value)}
            placeholder={`Bullet ${index + 1}`}
            className="mb-2"
            disabled={loading}
          />
        ))}
      </div>

      <Input
        label="Current Keywords/Tags (Optional)"
        value={formData.currentKeywords}
        onChange={(e) => setFormData({ ...formData, currentKeywords: e.target.value })}
        placeholder="yoga mat, exercise mat, non-slip"
        disabled={loading}
      />

      {/* Product Images */}
      <ImageUpload
        images={formData.images}
        onImagesChange={(images) => setFormData({ ...formData, images })}
        maxImages={7}
      />

      {/* Additional Details - Expandable Sections */}
      <ExpandableSection title="Basic Product Information">
        <div className="space-y-3">
          <Input
            label="Product Category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Home & Kitchen"
            disabled={loading}
          />
          <Input
            label="Brand Name"
            value={formData.brand || ''}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="Your brand name"
            disabled={loading}
          />
        </div>
      </ExpandableSection>

      <ExpandableSection title="Product Specifications">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Length"
              type="number"
              placeholder="0"
              disabled={loading}
            />
            <Input
              label="Width"
              type="number"
              placeholder="0"
              disabled={loading}
            />
            <Input
              label="Height"
              type="number"
              placeholder="0"
              disabled={loading}
            />
          </div>
          <Input
            label="Materials (comma-separated)"
            placeholder="Cotton, Polyester, Stainless Steel"
            disabled={loading}
          />
        </div>
      </ExpandableSection>

      <ExpandableSection title="Optimization Preferences">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Tone of Voice
            </label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" disabled={loading}>
              <option>Professional & Formal</option>
              <option>Friendly & Conversational</option>
              <option>Luxury & Premium</option>
              <option>Fun & Playful</option>
              <option>Technical & Detailed</option>
            </select>
          </div>
        </div>
      </ExpandableSection>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span>Analyzing & Optimizing...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles size={18} />
            <span>Analyze & Optimize Listing</span>
          </span>
        )}
      </Button>
    </form>
  );
}
