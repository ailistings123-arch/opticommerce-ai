'use client';

import { useState } from 'react';
import { Sparkles, Plus, Search } from 'lucide-react';

export type OptimizationMode = 'optimize-existing' | 'create-new' | 'analyze-url';

interface OptimizationModeSelectorProps {
  selectedMode: OptimizationMode;
  onModeChange: (mode: OptimizationMode) => void;
}

export default function OptimizationModeSelector({ 
  selectedMode, 
  onModeChange 
}: OptimizationModeSelectorProps) {
  const modes = [
    {
      id: 'optimize-existing' as OptimizationMode,
      icon: Sparkles,
      title: 'Optimize Existing',
      description: 'Improve your current product listing with AI-powered optimization',
      color: 'blue'
    },
    {
      id: 'create-new' as OptimizationMode,
      icon: Plus,
      title: 'Create New Product',
      description: 'Generate a complete optimized listing from scratch',
      color: 'green'
    },
    {
      id: 'analyze-url' as OptimizationMode,
      icon: Search,
      title: 'Analyze URL',
      description: 'Analyze competitor or your own product URL for insights',
      color: 'purple'
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Choose Optimization Mode
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? `border-${mode.color}-500 bg-${mode.color}-50` 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected 
                    ? `bg-${mode.color}-100 text-${mode.color}-600` 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className={`
                    font-semibold mb-1
                    ${isSelected ? `text-${mode.color}-900` : 'text-gray-900'}
                  `}>
                    {mode.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
