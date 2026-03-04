'use client';

import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Activity, Target, Zap } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: any;
  users: any[];
  optimizations: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

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
  
  const platformData = Object.entries(platformCounts)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      optimizations: value
    }))
    .sort((a, b) => b.optimizations - a.optimizations);

  // Daily activity (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyActivity = last30Days.map(date => {
    const count = optimizations.filter(opt => 
      opt.createdAt?.startsWith(date)
    ).length;
    const newUsers = users.filter(u => 
      u.createdAt?.startsWith?.(date)
    ).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      optimizations: count,
      newUsers: newUsers
    };
  });

  // User engagement - optimizations per user
  const userEngagement = users.map(user => {
    const userOpts = optimizations.filter(opt => opt.userId === user.id).length;
    return {
      email: user.email?.split('@')[0] || 'Unknown',
      optimizations: userOpts,
      tier: user.tier
    };
  }).sort((a, b) => b.optimizations - a.optimizations).slice(0, 10);

  // Usage by tier
  const usageByTier = [
    { 
      tier: 'Free', 
      users: stats?.tierBreakdown?.free || 0,
      optimizations: optimizations.filter(opt => {
        const user = users.find(u => u.id === opt.userId);
        return user?.tier === 'free';
      }).length,
      avgPerUser: 0
    },
    { 
      tier: 'Starter', 
      users: stats?.tierBreakdown?.starter || 0,
      optimizations: optimizations.filter(opt => {
        const user = users.find(u => u.id === opt.userId);
        return user?.tier === 'starter';
      }).length,
      avgPerUser: 0
    },
    { 
      tier: 'Professional', 
      users: stats?.tierBreakdown?.professional || 0,
      optimizations: optimizations.filter(opt => {
        const user = users.find(u => u.id === opt.userId);
        return user?.tier === 'professional';
      }).length,
      avgPerUser: 0
    },
    { 
      tier: 'Enterprise', 
      users: stats?.tierBreakdown?.enterprise || 0,
      optimizations: optimizations.filter(opt => {
        const user = users.find(u => u.id === opt.userId);
        return user?.tier === 'enterprise';
      }).length,
      avgPerUser: 0
    }
  ].map(item => ({
    ...item,
    avgPerUser: item.users > 0 ? (item.optimizations / item.users).toFixed(1) : 0
  }));

  // Hourly activity pattern (last 24 hours)
  const hourlyPattern = Array.from({ length: 24 }, (_, hour) => {
    const count = optimizations.filter(opt => {
      if (!opt.createdAt) return false;
      const optHour = new Date(opt.createdAt).getHours();
      return optHour === hour;
    }).length;
    return {
      hour: `${hour}:00`,
      activity: count
    };
  });

  // User growth trend (last 30 days)
  const userGrowth = last30Days.map((date, index) => {
    const newUsers = users.filter(u => 
      u.createdAt?.startsWith?.(date)
    ).length;
    const totalUsers = users.filter(u => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt) <= new Date(date);
    }).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      newUsers,
      totalUsers
    };
  });

  // Platform performance radar
  const platformPerformance = platformData.slice(0, 6).map(p => ({
    platform: p.name,
    usage: p.optimizations,
    fullMark: Math.max(...platformData.map(pd => pd.optimizations))
  }));

  // Calculate key metrics
  const totalOpts = optimizations.length;
  const avgOptsPerUser = users.length > 0 ? (totalOpts / users.length).toFixed(2) : 0;
  const activeUsers = users.filter(u => {
    const userOpts = optimizations.filter(opt => opt.userId === u.id);
    return userOpts.length > 0;
  }).length;
  const activeRate = users.length > 0 ? ((activeUsers / users.length) * 100).toFixed(1) : 0;

  // Mode distribution
  const modeData = optimizations.reduce((acc: any, opt) => {
    const mode = opt.mode || 'unknown';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  const modeChartData = Object.entries(modeData).map(([name, value]) => ({
    name: name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: value as number
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 border border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Avg Opts/User</p>
              <p className="text-3xl font-bold text-white mt-1">{avgOptsPerUser}</p>
            </div>
            <Target className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 border border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-white mt-1">{activeUsers}</p>
              <p className="text-green-300 text-xs">{activeRate}% of total</p>
            </div>
            <Users className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-4 border border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Activity</p>
              <p className="text-3xl font-bold text-white mt-1">{totalOpts}</p>
            </div>
            <Activity className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-4 border border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">Platforms Used</p>
              <p className="text-3xl font-bold text-white mt-1">{platformData.length}</p>
            </div>
            <Zap className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
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
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Usage */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="optimizations" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Active Users */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top 10 Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userEngagement} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="email" type="category" stroke="#9CA3AF" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="optimizations" fill="#10B981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Usage by Tier */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Usage by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={usageByTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="tier" stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="optimizations" fill="#3B82F6" name="Total Optimizations" />
              <Line yAxisId="right" type="monotone" dataKey="avgPerUser" stroke="#10B981" strokeWidth={3} name="Avg per User" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Width Charts */}
      <div className="space-y-6">
        {/* Daily Activity & User Growth */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Activity & User Growth (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="optimizations" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.6} name="Optimizations" />
              <Line yAxisId="right" type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={3} name="New Users" dot={{ fill: '#10B981', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Trend */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Cumulative User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Area type="monotone" dataKey="totalUsers" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Total Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mode Distribution & Hourly Pattern */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mode Distribution */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Optimization Modes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Activity Pattern */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Hourly Activity Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="activity" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Performance Radar */}
        {platformPerformance.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={platformPerformance}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="platform" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar name="Usage" dataKey="usage" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
