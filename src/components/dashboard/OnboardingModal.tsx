'use client';

import { useState, useEffect } from 'react';
import { Sparkles, PlusCircle, Search, ArrowRight, CheckCircle, X } from 'lucide-react';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to ListingOptimizer!',
    desc: 'Your AI-powered tool to craft high-converting product listings for Amazon, Walmart, Etsy & more.',
    highlight: 'Boost your sales with optimized titles, descriptions & keywords — in seconds.',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-700',
  },
  {
    emoji: '✨',
    title: 'Optimize Existing Listings',
    desc: 'Paste your current product title & description. Our AI rewrites it with better keywords, structure, and SEO.',
    highlight: 'Perfect for improving listings that aren\'t converting well.',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-700',
  },
  {
    emoji: '🆕',
    title: 'Create Brand New Listings',
    desc: 'Just describe your product and choose a platform. We\'ll generate a complete, optimized listing from scratch.',
    highlight: 'Great for new products launching on any marketplace.',
    icon: PlusCircle,
    color: 'from-green-500 to-green-700',
  },
  {
    emoji: '🔍',
    title: 'Analyze Any Product URL',
    desc: 'Paste a competitor or your own product URL. We\'ll scrape, analyze, and generate an improved version.',
    highlight: 'Supports Amazon, Walmart, eBay & more.',
    icon: Search,
    color: 'from-orange-500 to-orange-700',
  },
  {
    emoji: '🚀',
    title: 'You\'re All Set!',
    desc: 'Start with any mode from the left sidebar. Your results are saved in History for easy access.',
    highlight: 'Need help? Click Help & Support in the sidebar anytime.',
    icon: CheckCircle,
    color: 'from-blue-600 to-indigo-700',
  },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('lo_onboarding_done');
    if (!seen) setOpen(true);
  }, []);

  const close = () => {
    localStorage.setItem('lo_onboarding_done', '1');
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${current.color} p-8 text-center relative`}>
          <button onClick={close} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X size={14} />
          </button>
          <div className="text-5xl mb-3">{current.emoji}</div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Icon size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">{current.desc}</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-blue-800 text-xs font-medium">💡 {current.highlight}</p>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 pt-1">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            {isLast ? (
              <button onClick={close}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                🚀 Get Started
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                Next <ArrowRight size={15} />
              </button>
            )}
          </div>
          <button onClick={close} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
