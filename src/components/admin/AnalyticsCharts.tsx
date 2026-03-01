'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsChartsProps {
  stats: any;
  users: any[];
  optimizations: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function AnalyticsCharts({ stats, users, optimizations }: AnalyticsChartsProps) {
  // Tier distribution data
  const tierData = [
    { name: 'Free', value: stats?.tierBreakdown?.free || 0, color: '#6B7280' },
    { name: 'Starter', value: stats?.tierBreakdown?.starter || 0, color: '#10B981' },
    { name: 'Professional', value: stats?.tierBreakdown?.professional || 0, color: '#3B82F6' },
    { name: 'Enterprise', value: stats?.tierBreakdown?.enterprise || 0, color: '#8B5CF6' },
  ];

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  optimizations.forEach(opt => {
    platformCounts[opt.platform] = (platformCounts[opt.platform] || 0) + 1;
  });
  
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Daily activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyActivity = last7Days.map(date => {
    const count = optimizations.filter(opt => 
      opt.createdAt?.startsWith(date)
    ).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      optimizations: count
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Tier Distribution */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">User Tier Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tierData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {tierData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Usage */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Activity (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="optimizations" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
