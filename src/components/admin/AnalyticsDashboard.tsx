'use client';

import { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, Users, Activity, Target, Zap } from 'lucide-react';

interface AnalyticsDashboardProps {
  data: any;
}

const COLORS = ['#111827', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'30' | '60' | '90'>('90');
  const { analytics, users, optimizations } = data;

  // Filter data based on time range
  const filteredDailyStats = analytics?.dailyStats?.slice(-parseInt(timeRange)) || [];

  // Prepare chart data
  const activityData = filteredDailyStats.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    optimizations: day.optimizations,
    newUsers: day.newUsers,
    platforms: day.platforms
  }));

  // User engagement data
  const userEngagement = analytics?.userStats?.slice(0, 10).map((u: any) => ({
    user: u.email?.split('@')[0] || 'Unknown',
    optimizations: u.totalOptimizations,
    tier: u.tier
  })) || [];

  // Platform performance
  const platformPerformance = analytics?.platformData?.map((p: any) => ({
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    optimizations: p.optimizations,
    users: p.uniqueUsers
  })) || [];

  // Tier distribution
  const tierData = analytics?.tierPerformance?.map((t: any) => ({
    name: t.tier.charAt(0).toUpperCase() + t.tier.slice(1),
    value: t.users
  })) || [];

  // Hourly pattern
  const hourlyData = analytics?.hourlyPattern?.map((h: any) => ({
    hour: `${h.hour}:00`,
    activity: h.activity
  })) || [];

  // Mode distribution
  const modeData = Object.entries(analytics?.modeStats || {}).map(([name, value]) => ({
    name: name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: value as number
  }));

  // Key metrics
  const metrics = [
    {
      label: 'Avg Opts/User',
      value: analytics?.summary?.avgOptimizationsPerUser || '0',
      icon: Target,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Active Users',
      value: analytics?.summary?.activeUsers || 0,
      icon: Users,
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Growth Rate',
      value: `${analytics?.summary?.growthRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Top Platform',
      value: analytics?.summary?.topPlatform || 'N/A',
      icon: Zap,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
        </div>
        <div className="flex gap-2">
          {['30', '60', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === days
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className={`inline-flex p-3 rounded-lg ${metric.color} mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px' 
                }}
              />
              <Area type="monotone" dataKey="optimizations" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px' 
                }}
              />
              <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Users */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top 10 Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userEngagement} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis dataKey="user" type="category" stroke="#6B7280" style={{ fontSize: '12px' }} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="optimizations" fill="#111827" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Performance */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="optimizations" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="users" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">User Tiers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tierData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mode Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Optimization Modes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={modeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modeData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Pattern */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Hourly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#6B7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px' 
                }}
              />
              <Area type="monotone" dataKey="activity" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

