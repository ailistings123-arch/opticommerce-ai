'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Platform } from '@/types';
import { useOptimization } from '@/lib/hooks/useOptimization';
import Spinner from '@/components/ui/Spinner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

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
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Product Images (Optional, up to 5)
        </label>
        
        <div className="grid grid-cols-5 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Product ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          {images.length < 5 && (
            <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload size={24} className="text-gray-400 mb-1" />
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
        <p className="mt-2 text-xs text-gray-500">
          Add product images to help AI understand your product better
        </p>
      </div>

      {/* Platform Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Platform
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            Creating & Optimizing...
          </span>
        ) : (
          'Create & Optimize Product'
        )}
      </Button>
    </form>
  );
}
