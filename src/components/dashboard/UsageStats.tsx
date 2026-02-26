'use client';

import { User } from '@/types';

interface UsageStatsProps {
  userData: User;
}

export default function UsageStats({ userData }: UsageStatsProps) {
  const percentage = (userData.usageCount / userData.usageLimit) * 100;
  const tierColors: Record<string, string> = {
    free: 'bg-gray-500',
    basic: 'bg-blue-500',
    premium: 'bg-purple-500',
    enterprise: 'bg-gold-500',
  };

  const handleUpgrade = (tier: string) => {
    window.location.href = `/dashboard/checkout?plan=${tier}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 sticky top-4">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Usage This Month</h3>
          <span
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-xs font-medium uppercase ${
              tierColors[userData.tier]
            }`}
          >
            {userData.tier}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-gray-600">
              {userData.usageCount} / {userData.usageLimit} used
            </span>
            <span className="text-gray-600 font-medium">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {userData.usageCount >= userData.usageLimit && (
          <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-xs sm:text-sm font-medium">
              🚫 You've used all {userData.usageLimit} credits!
            </p>
            <p className="text-red-700 text-xs mt-1">
              Upgrade to continue optimizing your listings.
            </p>
          </div>
        )}

        {userData.tier === 'free' && userData.usageCount < userData.usageLimit && (
          <div className="p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-xs sm:text-sm">
              💡 {userData.usageLimit - userData.usageCount} credits remaining
            </p>
          </div>
        )}

        {userData.tier === 'free' && (
          <div className="pt-4 sm:pt-6 border-t space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Upgrade to unlock more optimizations
            </p>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Starter</p>
                  <p className="text-xs text-gray-500">30 credits/month</p>
                </div>
                <button 
                  onClick={() => handleUpgrade('starter')}
                  className="px-2.5 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  $19/mo
                </button>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Professional</p>
                  <p className="text-xs text-gray-500">Unlimited credits</p>
                </div>
                <button 
                  onClick={() => handleUpgrade('professional')}
                  className="px-2.5 sm:px-3 py-1 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  $45/mo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
