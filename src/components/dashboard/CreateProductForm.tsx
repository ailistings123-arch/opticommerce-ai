'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Platform } from '@/types';
import { useOptimization } from '@/lib/hooks/useOptimization';
import Spinner from '@/components/ui/Spinner';
import { Upload, X, Image as ImageIcon, CreditCard, Sparkles } from 'lucide-react';

interface CreateProductFormProps {
  onSuccess: (result: any, original: any) => void;
}

export default function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [keywords, setKeywords] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showCreditModal, setShowCreditModal] = useState(false);
  
  const { optimize, loading, error } = useOptimization();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

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
    } catch (err: any) {
      // Check if error is quota exceeded
      if (err.message?.includes('Usage limit exceeded') || err.message?.includes('quota')) {
        setShowCreditModal(true);
      }
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Product Images (Optional, up to 5)
        </label>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Product ${index + 1}`}
                className="w-full h-20 sm:h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
          
          {images.length < 5 && (
            <label className="w-full h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload size={18} className="sm:w-6 sm:h-6 text-gray-400 mb-0.5 sm:mb-1" />
              <span className="text-xs text-gray-500">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          )}
        </div>
        <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">
          Add product images to help AI understand your product better
        </p>
      </div>

      {/* Platform Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Target Platform
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="amazon">Amazon</option>
          <option value="shopify">Shopify</option>
          <option value="etsy">Etsy</option>
          <option value="ebay">eBay</option>
        </select>
      </div>

      <Input
        label="Product Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter your product title"
        required
        disabled={loading}
      />

      <Textarea
        label="Product Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your product features, benefits, and specifications"
        rows={6}
        required
        disabled={loading}
      />

      <Input
        label="Target Keywords (Optional)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Enter keywords separated by commas"
        disabled={loading}
      />

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm sm:text-base">Creating & Optimizing...</span>
          </span>
        ) : (
          <span className="text-sm sm:text-base">Create & Optimize Product</span>
        )}
      </Button>
    </form>

    {/* Credit Limit Modal */}
    <Modal
      isOpen={showCreditModal}
      onClose={() => setShowCreditModal(false)}
      title="Free Credits Exhausted"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-full">
            <CreditCard className="text-blue-600" size={48} />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            You've used all 5 free credits!
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Upgrade to a premium plan to continue optimizing your product listings and boost your sales.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Premium Benefits:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Unlimited optimizations</li>
                <li>• Priority AI processing</li>
                <li>• Advanced SEO analytics</li>
                <li>• Bulk optimization tools</li>
                <li>• 24/7 priority support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => {
              window.location.href = '/dashboard/settings';
            }}
          >
            Upgrade to Premium
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setShowCreditModal(false)}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  </>
  );
}
