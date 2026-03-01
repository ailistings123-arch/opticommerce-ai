'use client';

import { DollarSign, TrendingUp, CreditCard, Percent } from 'lucide-react';

interface RevenueCardsProps {
  revenue: {
    mrr: number;
    arr: number;
    totalRevenue: number;
    conversionRate: string;
    revenueByTier: {
      starter: number;
      professional: number;
      enterprise: number;
    };
  };
}

export default function RevenueCards({ revenue }: RevenueCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-sm font-medium">MRR</p>
            <p className="text-4xl font-bold text-white mt-2">${revenue.mrr}</p>
            <p className="text-green-300 text-xs mt-1">Monthly Recurring Revenue</p>
          </div>
          <DollarSign className="text-green-400" size={48} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">ARR</p>
            <p className="text-4xl font-bold text-white mt-2">${revenue.arr}</p>
            <p className="text-blue-300 text-xs mt-1">Annual Recurring Revenue</p>
          </div>
          <TrendingUp className="text-blue-400" size={48} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium">Total Revenue</p>
            <p className="text-4xl font-bold text-white mt-2">${revenue.totalRevenue.toFixed(2)}</p>
            <p className="text-purple-300 text-xs mt-1">All time payments</p>
          </div>
          <CreditCard className="text-purple-400" size={48} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6 border border-yellow-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-200 text-sm font-medium">Conversion Rate</p>
            <p className="text-4xl font-bold text-white mt-2">{revenue.conversionRate}%</p>
            <p className="text-yellow-300 text-xs mt-1">Free to paid conversion</p>
          </div>
          <Percent className="text-yellow-400" size={48} />
        </div>
      </div>
    </div>
  );
}
