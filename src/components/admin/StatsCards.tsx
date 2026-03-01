'use client';

import { Users, FileText, DollarSign, TrendingUp, Activity, CreditCard } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    totalOptimizations: number;
    paidUsers: number;
    activeToday: number;
    revenue?: number;
    avgOptimizationsPerUser?: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">Total Users</p>
            <p className="text-4xl font-bold text-white mt-2">{stats.totalUsers || 0}</p>
            <p className="text-blue-300 text-xs mt-1">All registered users</p>
          </div>
          <Users className="text-blue-400" size={48} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-sm font-medium">Total Optimizations</p>
            <p className="text-4xl font-bold text-white mt-2">{stats.totalOptimizations || 0}</p>
            <p className="text-green-300 text-xs mt-1">All time</p>
          </div>
          <FileText className="text-green-400" size={48} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6 border border-yellow-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-200 text-sm font-medium">Paid Users</p>
            <p className="text-4xl font-bold text-white mt-2">{stats.paidUsers || 0}</p>
            <p className="text-yellow-300 text-xs mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.paidUsers / stats.totalUsers) * 100) : 0}% conversion
            </p>
          </div>
          <DollarSign className="text-yellow-400" size={48} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium">Active Today</p>
            <p className="text-4xl font-bold text-white mt-2">{stats.activeToday || 0}</p>
            <p className="text-purple-300 text-xs mt-1">Users active in last 24h</p>
          </div>
          <Activity className="text-purple-400" size={48} />
        </div>
      </div>
    </div>
  );
}
