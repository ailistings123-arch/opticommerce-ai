'use client';

import { TrendingUp, TrendingDown, Users, Activity, Eye, MousePointer, Globe, Target, DollarSign, Filter } from 'lucide-react';
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
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${(totalOptimizations * 2.5).toLocaleString()}`,
      change: -34.0,
      icon: DollarSign,
      gradient: 'from-red-500 to-pink-500'
    },
    {
      title: 'Bounce Rate',
      value: `${((activeUsers / totalUsers) * 100).toFixed(1)}%`,
      change: 24.2,
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Subscriber',
      value: totalUsers.toLocaleString(),
      change: 8.3,
      changeLabel: `+${stats?.activeToday || 0} increased`,
      icon: Users,
      gradient: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = typeof stat.change === 'number' && stat.change > 0;
          
          return (
            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg flex-shrink-0`}>
                  <Icon className="text-white" size={18} />
                </div>
                {typeof stat.change === 'number' && !stat.changeLabel && (
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                {stat.changeLabel && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className={`${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '↑' : '↓'}
                    </span>
                    {stat.changeLabel}
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
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="text-green-600 font-semibold">15.8% ↑</span> +$143.50 increased
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter size={16} className="text-gray-600" />
              </button>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="optimizations" fill="url(#colorGradient1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="users" fill="url(#colorGradient2)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Total Subscriber</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="text-green-600 font-semibold">8.3% ↑</span> +749 increased
              </p>
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData.slice(0, 7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" fill="url(#colorGradient3)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
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
