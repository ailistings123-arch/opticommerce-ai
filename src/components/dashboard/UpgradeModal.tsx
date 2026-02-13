'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Check, X, Zap, Crown, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: number;
  usageLimit: number;
}

export default function UpgradeModal({ isOpen, onClose, currentUsage, usageLimit }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      credits: 5,
      features: [
        '5 optimizations per month',
        'Basic SEO optimization',
        'All 5 platforms supported',
        'Standard support'
      ],
      limitations: [
        'No bulk optimization',
        'No advanced analytics',
        'No priority support',
        'Limited features'
      ]
    },
    basic: {
      name: 'Basic',
      price: 9,
      credits: 50,
      features: [
        '50 optimizations per month',
        'Advanced SEO optimization',
        'All 5 platforms supported',
        'Compliance checking',
        'Quality assurance',
        'Email support',
        'Detailed analytics'
      ],
      limitations: [
        'No bulk optimization',
        'No priority support'
      ]
    },
    premium: {
      name: 'Premium',
      price: 19,
      credits: 'Unlimited',
      features: [
        'Unlimited optimizations',
        'Advanced SEO optimization',
        'All 5 platforms supported',
        'Compliance checking',
        'Quality assurance',
        'Bulk optimization',
        'Priority support',
        'Advanced analytics',
        'A/B testing recommendations',
        'Competitive analysis'
      ],
      limitations: []
    }
  };

  const handleUpgrade = (plan: 'basic' | 'premium') => {
    // In production, this would redirect to payment processor
    alert(`Upgrade to ${plan} plan coming soon! This will integrate with Stripe/PayPal for payment processing.`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4">
          <Zap className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You've Used All {usageLimit} Free Credits!
        </h2>
        <p className="text-gray-600">
          Upgrade to continue optimizing your product listings and unlock powerful features
        </p>
      </div>

      {/* Current Usage */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-900">Current Usage</span>
          <span className="text-sm font-bold text-red-900">{currentUsage} / {usageLimit}</span>
        </div>
        <div className="w-full bg-red-200 rounded-full h-2">
          <div className="bg-red-600 h-2 rounded-full" style={{ width: '100%' }} />
        </div>
        <p className="text-xs text-red-700 mt-2">
          ⚠️ No credits remaining. Upgrade to continue.
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Basic Plan */}
        <div
          onClick={() => setSelectedPlan('basic')}
          className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
            selectedPlan === 'basic'
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          {selectedPlan === 'basic' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              SELECTED
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Basic</h3>
          </div>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">$9</span>
            <span className="text-gray-600">/month</span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">50 credits/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">All platforms</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">Advanced features</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">Email support</span>
            </div>
          </div>
          
          <Button
            onClick={() => handleUpgrade('basic')}
            className="w-full"
            variant={selectedPlan === 'basic' ? 'primary' : 'outline'}
          >
            Choose Basic
          </Button>
        </div>

        {/* Premium Plan */}
        <div
          onClick={() => setSelectedPlan('premium')}
          className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
            selectedPlan === 'premium'
              ? 'border-purple-500 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="absolute -top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            BEST VALUE
          </div>
          
          {selectedPlan === 'premium' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              SELECTED
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Crown className="text-purple-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Premium</h3>
          </div>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">$19</span>
            <span className="text-gray-600">/month</span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700 font-semibold">Unlimited credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">All platforms</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">Bulk optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">Advanced analytics</span>
            </div>
          </div>
          
          <Button
            onClick={() => handleUpgrade('premium')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            variant={selectedPlan === 'premium' ? 'primary' : 'outline'}
          >
            Choose Premium
          </Button>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">What you get with {selectedPlan === 'basic' ? 'Basic' : 'Premium'}:</h4>
        <div className="space-y-2">
          {plans[selectedPlan].features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
              <span className="text-xs text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="text-center text-xs text-gray-600 mb-4">
        <p>💳 Secure payment • 🔒 Cancel anytime • ✅ 30-day money-back guarantee</p>
      </div>

      {/* Continue with Free */}
      <button
        onClick={onClose}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Continue with free plan (0 credits remaining)
      </button>
    </Modal>
  );
}
