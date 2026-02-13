'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Platform } from '@/types';
import Spinner from '@/components/ui/Spinner';
import { Plus } from 'lucide-react';
import ExpandableSection from '../forms/ExpandableSection';
import ImageUpload from '../forms/ImageUpload';

interface Mode2Props {
  onSubmit: (data: Mode2Data) => Promise<void>;
  loading: boolean;
}

export interface Mode2Data {
  platform: Platform;
  images: File[];
  
  // Basic Info
  productName: string;
  brandName?: string;
  category: string;
  productType: string;
  
  // Description
  whatIsIt: string;
  problemSolved: string;
  keyFeatures: string[];
  mainBenefits: string[];
  
  // Specifications
  dimensions?: { length: number; width: number; height: number; unit: string };
  weight?: { value: number; unit: string };
  primaryMaterial: string;
  additionalMaterials?: string;
  colors?: string[];
  sizes?: string[];
  quantity?: string;
  countryOfOrigin?: string;
  warranty?: string;
  
  // Target Audience
  idealCustomer: string;
  demographics?: {
    gender?: string[];
    ageRange?: string[];
    incomeLevel?: string;
    lifestyle?: string[];
  };
  
  // Use Cases
  locations?: string[];
  occasions?: string[];
  useCases: string[];
  seasons?: string[];
  
  // Competitive
  uniqueAdvantage: string;
  competitiveAdvantages?: string[];
  similarProducts?: string;
  pricePoint?: number;
  competitorPriceRange?: { low: number; high: number };
  
  // Special Attributes
  attributes?: string[];
  certifications?: string[];
  awards?: string;
  
  // Preferences
  tone: string;
  writingStyle?: string[];
  keywordStrategy: string;
  contentLength: string;
  additionalInstructions?: string;
}

export default function Mode2CreateNew({ onSubmit, loading }: Mode2Props) {
  const [formData, setFormData] = useState<Mode2Data>({
    platform: 'amazon',
    images: [],
    productName: '',
    category: '',
    productType: 'physical',
    whatIsIt: '',
    problemSolved: '',
    keyFeatures: ['', '', '', '', ''],
    mainBenefits: ['', '', ''],
    primaryMaterial: '',
    idealCustomer: '',
    useCases: ['', '', ''],
    uniqueAdvantage: '',
    tone: 'professional',
    keywordStrategy: 'balanced',
    contentLength: 'detailed',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateArrayField = (field: keyof Mode2Data, index: number, value: string) => {
    const array = formData[field] as string[];
    const newArray = [...array];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: keyof Mode2Data) => {
    const array = formData[field] as string[];
    setFormData({ ...formData, [field]: [...array, ''] });
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

      {/* Product Images - Required */}
      <ImageUpload
        images={formData.images}
        onImagesChange={(images) => setFormData({ ...formData, images })}
        maxImages={7}
        required
        minImages={3}
      />

      {/* Basic Product Details */}
      <ExpandableSection title="Basic Product Information" defaultExpanded required>
        <div className="space-y-3">
          <Input
            label="Product Name / Working Title"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            placeholder="Premium Memory Foam Seat Cushion"
            required
            disabled={loading}
          />
          
          <Input
            label="Brand Name"
            value={formData.brandName || ''}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            placeholder="Your brand name or leave empty"
            disabled={loading}
          />

          <Input
            label="Main Product Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Home & Kitchen, Electronics, etc."
            required
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Product Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value="physical">Physical Product</option>
              <option value="digital">Digital Product</option>
              <option value="handmade">Handmade Item</option>
              <option value="print-on-demand">Print on Demand</option>
            </select>
          </div>
        </div>
      </ExpandableSection>

      {/* Product Description */}
      <ExpandableSection title="Describe Your Product" defaultExpanded required>
        <div className="space-y-3">
          <Textarea
            label="What is this product?"
            value={formData.whatIsIt}
            onChange={(e) => setFormData({ ...formData, whatIsIt: e.target.value })}
            placeholder="Describe your product in 3-5 sentences..."
            rows={4}
            required
            disabled={loading}
          />

          <Textarea
            label="What problem does it solve?"
            value={formData.problemSolved}
            onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
            placeholder="Explain the main problem this product addresses..."
            rows={3}
            required
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Key Features (List 5-10) <span className="text-red-500">*</span>
            </label>
            {formData.keyFeatures.map((feature, index) => (
              <Input
                key={index}
                value={feature}
                onChange={(e) => updateArrayField('keyFeatures', index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="mb-2"
                disabled={loading}
              />
            ))}
            <button
              type="button"
              onClick={() => addArrayField('keyFeatures')}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={loading}
            >
              + Add Feature
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Main Benefits (What customers get)
            </label>
            {formData.mainBenefits.map((benefit, index) => (
              <Input
                key={index}
                value={benefit}
                onChange={(e) => updateArrayField('mainBenefits', index, e.target.value)}
                placeholder={`Benefit ${index + 1}`}
                className="mb-2"
                disabled={loading}
              />
            ))}
          </div>
        </div>
      </ExpandableSection>

      {/* Product Specifications */}
      <ExpandableSection title="Product Specifications">
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <Input label="Length" type="number" placeholder="0" disabled={loading} />
            <Input label="Width" type="number" placeholder="0" disabled={loading} />
            <Input label="Height" type="number" placeholder="0" disabled={loading} />
            <select className="px-3 py-2 border border-gray-300 rounded-lg mt-6" disabled={loading}>
              <option>in</option>
              <option>cm</option>
            </select>
          </div>

          <Input
            label="Primary Material"
            value={formData.primaryMaterial}
            onChange={(e) => setFormData({ ...formData, primaryMaterial: e.target.value })}
            placeholder="Stainless Steel, Silicone, Cotton, etc."
            disabled={loading}
          />

          <Input
            label="Additional Materials"
            value={formData.additionalMaterials || ''}
            onChange={(e) => setFormData({ ...formData, additionalMaterials: e.target.value })}
            placeholder="Comma-separated"
            disabled={loading}
          />
        </div>
      </ExpandableSection>

      {/* Target Audience */}
      <ExpandableSection title="Target Audience & Market" required>
        <div className="space-y-3">
          <Textarea
            label="Who is your ideal customer?"
            value={formData.idealCustomer}
            onChange={(e) => setFormData({ ...formData, idealCustomer: e.target.value })}
            placeholder="Be specific: age, lifestyle, interests, etc."
            rows={3}
            required
            disabled={loading}
          />
        </div>
      </ExpandableSection>

      {/* Use Cases */}
      <ExpandableSection title="Use Cases & Scenarios" required>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Specific Use Cases (Minimum 3) <span className="text-red-500">*</span>
            </label>
            {formData.useCases.map((useCase, index) => (
              <Input
                key={index}
                value={useCase}
                onChange={(e) => updateArrayField('useCases', index, e.target.value)}
                placeholder={`Use case ${index + 1}`}
                className="mb-2"
                disabled={loading}
              />
            ))}
            <button
              type="button"
              onClick={() => addArrayField('useCases')}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={loading}
            >
              + Add Use Case
            </button>
          </div>
        </div>
      </ExpandableSection>

      {/* Competitive Information */}
      <ExpandableSection title="Competitive Landscape">
        <div className="space-y-3">
          <Textarea
            label="What makes your product unique/better?"
            value={formData.uniqueAdvantage}
            onChange={(e) => setFormData({ ...formData, uniqueAdvantage: e.target.value })}
            placeholder="Explain your competitive advantages..."
            rows={3}
            disabled={loading}
          />

          <Input
            label="Your Price Point"
            type="number"
            value={formData.pricePoint || ''}
            onChange={(e) => setFormData({ ...formData, pricePoint: parseFloat(e.target.value) })}
            placeholder="29.99"
            disabled={loading}
          />
        </div>
      </ExpandableSection>

      {/* Listing Preferences */}
      <ExpandableSection title="Listing Creation Preferences" defaultExpanded required>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Tone of Voice <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value="professional">Professional & Formal</option>
              <option value="friendly">Friendly & Conversational</option>
              <option value="luxury">Luxury & Premium</option>
              <option value="playful">Fun & Playful</option>
              <option value="technical">Technical & Detailed</option>
              <option value="warm">Warm & Personal (Etsy style)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Keyword Strategy <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.keywordStrategy}
              onChange={(e) => setFormData({ ...formData, keywordStrategy: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value="aggressive">Aggressive (Maximum SEO)</option>
              <option value="balanced">Balanced (Natural integration)</option>
              <option value="conservative">Conservative (Readability first)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Content Length <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.contentLength}
              onChange={(e) => setFormData({ ...formData, contentLength: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value="concise">Concise (800-1200 words)</option>
              <option value="detailed">Detailed (1200-2000 words)</option>
              <option value="comprehensive">Comprehensive (2000+ words)</option>
            </select>
          </div>

          <Textarea
            label="Additional Instructions (Optional)"
            value={formData.additionalInstructions || ''}
            onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
            placeholder="Any specific requirements or preferences?"
            rows={3}
            disabled={loading}
          />
        </div>
      </ExpandableSection>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span>Generating Product Listing...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>Generate Product Listing</span>
          </span>
        )}
      </Button>
    </form>
  );
}
