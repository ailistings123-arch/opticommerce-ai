'use client';

/**
 * Engine Selector Component
 * 
 * Allows users to choose between Gemini and DeepSeek optimization engines.
 * Stores selection in session storage for persistence.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';

export type Engine = 'gemini' | 'deepseek';

interface EngineSelectorProps {
  selectedEngine: Engine;
  onEngineChange: (engine: Engine) => void;
  disabled?: boolean;
}

export default function EngineSelector({
  selectedEngine,
  onEngineChange,
  disabled = false
}: EngineSelectorProps) {
  const [isDeepSeekAvailable, setIsDeepSeekAvailable] = useState(true);

  useEffect(() => {
    // Check if DeepSeek is available
    const checkDeepSeekAvailability = async () => {
      try {
        const response = await fetch('/api/check-deepseek');
        const data = await response.json();
        setIsDeepSeekAvailable(data.available);
      } catch (error) {
        console.warn('Could not check DeepSeek availability:', error);
        setIsDeepSeekAvailable(false);
      }
    };

    checkDeepSeekAvailability();
  }, []);

  const handleEngineChange = (engine: Engine) => {
    if (disabled) return;
    
    // Store selection in session storage (Requirement 2.3)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedEngine', engine);
    }
    
    onEngineChange(engine);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-gray-800">
        AI Engine
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Gemini Option */}
        <button
          type="button"
          onClick={() => handleEngineChange('gemini')}
          disabled={disabled}
          className={`
            relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${selectedEngine === 'gemini'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Sparkles className={`w-6 h-6 mb-2 ${selectedEngine === 'gemini' ? 'text-blue-600' : 'text-gray-500'}`} />
          <span className="font-semibold text-sm">Gemini</span>
          <span className="text-xs text-gray-500 mt-1">Google AI</span>
          
          {selectedEngine === 'gemini' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </button>

        {/* DeepSeek Option */}
        <button
          type="button"
          onClick={() => handleEngineChange('deepseek')}
          disabled={disabled || !isDeepSeekAvailable}
          className={`
            relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${selectedEngine === 'deepseek'
              ? 'border-purple-500 bg-purple-50 text-purple-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }
            ${disabled || !isDeepSeekAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Zap className={`w-6 h-6 mb-2 ${selectedEngine === 'deepseek' ? 'text-purple-600' : 'text-gray-500'}`} />
          <span className="font-semibold text-sm">DeepSeek</span>
          <span className="text-xs text-gray-500 mt-1">
            {isDeepSeekAvailable ? 'E-commerce AI' : 'Not configured'}
          </span>
          
          {selectedEngine === 'deepseek' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          )}
        </button>
      </div>

      {/* Engine Description */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          {selectedEngine === 'gemini' ? (
            <>
              <strong>Gemini:</strong> Google's powerful AI model with broad knowledge and creative capabilities.
            </>
          ) : (
            <>
              <strong>DeepSeek:</strong> Specialized AI optimized for e-commerce copywriting with platform-specific rules and quality checks.
            </>
          )}
        </p>
      </div>

      {!isDeepSeekAvailable && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment variables to enable it.
        </div>
      )}
    </div>
  );
}
