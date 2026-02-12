'use client';

import { User } from '@/types';

interface UsageStatsProps {
  userData: User;
}

export default function UsageStats({ userData }: UsageStatsProps) {
  const percentage = (userData.usageCount / userData.usageLimit) * 100;
  const tierColors = {
    free: 'bg-gray-500',
    basic: 'bg-blue-500',
    premium: 'bg-purple-500',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Usage This Month</h3>
          <span
            className={`px-3 py-1 rounded-full text-white text-xs font-medium uppercase ${
              tierColors[userData.tier]
            }`}
          >
            {userData.tier}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
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
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              You've reached your monthly limit. Upgrade to continue!
            </p>
          </div>
        )}

        {userData.tier === 'free' && (
          <div className="pt-6 border-t space-y-4">
            <p className="text-sm text-gray-600">
              Upgrade to unlock more optimizations
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Basic</p>
                  <p className="text-xs text-gray-500">20/month</p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                  $19/mo
                </button>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Premium</p>
                  <p className="text-xs text-gray-500">75/month</p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                  $49/mo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
