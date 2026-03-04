'use client';

import { DollarSign, TrendingUp, CreditCard, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueAnalyticsProps {
  revenue: any;
}

export default function RevenueAnalytics({ revenue }: RevenueAnalyticsProps) {
  if (!revenue) return <div>Loading...</div>;

  const revenueCards = [
    { label: 'MRR', value: `${revenue.mrr}`, icon: DollarSign, gradient: 'from-purple-600 to-blue-600' },
    { label: 'ARR', value: `${revenue.arr}`, icon: TrendingUp, gradient: 'from-blue-600 to-cyan-600' },
    { label: 'Total Revenue', value: `${revenue.totalRevenue.toFixed(2)}`, icon: CreditCard, gradient: 'from-purple-500 to-pink-600' },
    { label: 'Conversion', value: `${revenue.conversionRate}%`, icon: Percent, gradient: 'from-cyan-600 to-blue-600' }
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
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white mb-4 shadow-lg shadow-purple-500/30`}>
                <Icon size={24} />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">Revenue by Tier</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tierRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="tier" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1)' }} />
            <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
