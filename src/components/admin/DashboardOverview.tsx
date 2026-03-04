'use client';

import { TrendingUp, TrendingDown, Users, Activity, Eye, MousePointer, Globe, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardOverviewProps {
  data: any;
  onRefresh: () => void;
}

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const { stats, analytics, users, optimizations } = data;

  // Calculate metrics
  const totalUsers = users?.length || 0;
  const totalOptimizations = optimizations?.length || 0;
  const activeUsers = analytics?.summary?.activeUsers || 0;
  const growthRate = parseFloat(analytics?.summary?.growthRate || 0);

  // Prepare chart data (last 30 days)
  const last30Days = analytics?.dailyStats?.slice(-30) || [];
  const chartData = last30Days.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: day.newUsers,
    optimizations: day.optimizations
  }));

  // Platform data
  const platformData = analytics?.platformData?.slice(0, 6).map((p: any) => ({
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    value: p.optimizations
  })) || [];

  const statCards = [
    {
      title: 'Page Views',
      value: totalOptimizations.toLocaleString(),
      change: growthRate,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: stats?.activeToday || 0,
      changeLabel: 'active today',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Rate',
      value: `${((activeUsers / totalUsers) * 100).toFixed(1)}%`,
      change: activeUsers,
      changeLabel: 'active users',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Optimizations',
      value: totalOptimizations.toLocaleString(),
      change: analytics?.summary?.last30DaysActivity || 0,
      changeLabel: 'last 30 days',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = typeof stat.change === 'number' && stat.change > 0;
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
                {typeof stat.change === 'number' && !stat.changeLabel && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.changeLabel && (
                  <p className="text-sm text-gray-500 mt-1">
                    {stat.change} {stat.changeLabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Activity Overview</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option>Last 30 Days</option>
              <option>Last 60 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="optimizations" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                name="Optimizations"
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Platform Usage</h3>
            <button className="text-sm text-gray-600 hover:text-gray-900">View All</button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#111827" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Platform</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Mode</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {optimizations?.slice(0, 10).map((opt: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-sm text-gray-900">{opt.userEmail || 'Unknown'}</td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {opt.platform}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">{opt.mode}</td>
                  <td className="py-3 px-6 text-sm text-gray-500">
                    {new Date(opt.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
