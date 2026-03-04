'use client';

import { DollarSign, TrendingUp, CreditCard, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueAnalyticsProps {
  revenue: any;
}

export default function RevenueAnalytics({ revenue }: RevenueAnalyticsProps) {
  if (!revenue) return <div>Loading...</div>;

  const revenueCards = [
    { label: 'MRR', value: `$${revenue.mrr}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'ARR', value: `$${revenue.arr}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue', value: `$${revenue.totalRevenue.toFixed(2)}`, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
    { label: 'Conversion', value: `${revenue.conversionRate}%`, icon: Percent, color: 'bg-orange-50 text-orange-600' }
  ];

  const tierRevenue = [
    { tier: 'Starter', revenue: revenue.revenueByTier.starter },
    { tier: 'Professional', revenue: revenue.revenueByTier.professional },
    { tier: 'Enterprise', revenue: revenue.revenueByTier.enterprise }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className={`inline-flex p-3 rounded-lg ${card.color} mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Tier</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tierRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="tier" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
            <Bar dataKey="revenue" fill="#111827" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
