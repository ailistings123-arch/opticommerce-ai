'use client';

import { Upload, Sparkles, Download, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      number: '1',
      title: 'Input Your Product',
      description: 'Paste your existing listing, create from scratch, or analyze a competitor URL',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Sparkles,
      number: '2',
      title: 'AI Optimization',
      description: 'Our multi-AI system (Groq, Cloudflare, Gemini) analyzes and optimizes with professional SEO',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      number: '3',
      title: 'Review & Compare',
      description: 'See before/after comparison with SEO scores, keyword analysis, and improvement suggestions',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Download,
      number: '4',
      title: 'Export & Publish',
      description: 'Copy optimized content to your platform and watch your rankings improve',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Get professional SEO-optimized listings in 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile, shown on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-gray-200" />
                )}

                {/* Step Card */}
                <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  {/* Number Badge */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="text-white" size={32} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Provider Info - REMOVED */}
      </div>
    </section>
  );
}
