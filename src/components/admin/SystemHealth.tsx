'use client';

import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

interface SystemHealthProps {
  stats: any;
  users: any[];
  optimizations: any[];
}

export default function SystemHealth({ stats, users, optimizations }: SystemHealthProps) {
  // Calculate system health metrics
  const avgOptimizationsPerUser = users.length > 0 
    ? (optimizations.length / users.length).toFixed(2) 
    : '0';

  const activeUsersPercent = users.length > 0
    ? ((stats?.activeToday / users.length) * 100).toFixed(1)
    : '0';

  const paidConversionRate = users.length > 0
    ? ((stats?.paidUsers / users.length) * 100).toFixed(1)
    : '0';

  // Health checks
  const healthChecks = [
    {
      name: 'Database Connection',
      status: users.length > 0 ? 'healthy' : 'warning',
      message: users.length > 0 ? 'Connected' : 'No users found'
    },
    {
      name: 'User Activity',
      status: stats?.activeToday > 0 ? 'healthy' : 'warning',
      message: `${stats?.activeToday || 0} active today`
    },
    {
      name: 'Paid Conversion',
      status: parseFloat(paidConversionRate) > 5 ? 'healthy' : parseFloat(paidConversionRate) > 0 ? 'warning' : 'error',
      message: `${paidConversionRate}% conversion rate`
    },
    {
      name: 'User Engagement',
      status: parseFloat(avgOptimizationsPerUser) > 1 ? 'healthy' : 'warning',
      message: `${avgOptimizationsPerUser} optimizations per user`
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Activity className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900 border-green-700';
      case 'warning':
        return 'bg-yellow-900 border-yellow-700';
      case 'error':
        return 'bg-red-900 border-red-700';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity size={24} />
        System Health
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthChecks.map((check, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-4 border ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{check.name}</p>
                <p className="text-gray-300 text-sm mt-1">{check.message}</p>
              </div>
              {getStatusIcon(check.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Active Today</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.activeToday || 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Optimizations</p>
            <p className="text-2xl font-bold text-white mt-1">{optimizations.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Paid Users</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.paidUsers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
