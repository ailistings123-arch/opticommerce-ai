import { Sparkles } from 'lucide-react';

interface ProgressIndicatorProps {
  stage: string;
  percent: number;
  isVisible: boolean;
}

export default function ProgressIndicator({ stage, percent, isVisible }: ProgressIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-4">
          <Sparkles className="mx-auto text-blue-600 animate-pulse" size={48} />
          <h3 className="text-lg font-semibold mt-4 text-gray-900">{stage}</h3>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-3 font-medium">
          {percent}% complete
        </p>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          This usually takes 30-60 seconds...
        </div>
      </div>
    </div>
  );
}
