'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import StatsCards from '@/components/admin/StatsCards';
import UsersTable from '@/components/admin/UsersTable';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import { 
  Users, 
  FileText, 
  Shield,
  Activity,
  Settings,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';

// ADMIN EMAILS - Only these emails can access the admin panel
const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'optimizations' | 'analytics' | 'settings'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Admin Panel - Auth State:', { user: user?.email, authLoading });
    
    if (!authLoading) {
      if (!user) {
        console.log('No user - redirecting to login');
        router.push('/login');
      } else if (!ADMIN_EMAILS.includes(user.email || '')) {
        console.log('Not admin - redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('Admin user detected - loading data');
        loadAdminData();
      }
    }
  }, [user, authLoading, router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching admin data...');
      
      const token = await user!.getIdToken();
      
      // Fetch all data in parallel
      const [statsRes, usersRes, optimizationsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/optimizations', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data);
      }
      
      if (optimizationsRes.ok) {
        const optimizationsData = await optimizationsRes.json();
        setOptimizations(optimizationsData.data);
      }

    } catch (error) {
      console.error('Failed to load admin data:', error);
      setError('Failed to load admin data. Check console for details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const updateUserTier = async (userId: string, newTier: string) => {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user!.getIdToken()}`
        },
        body: JSON.stringify({ userId, tier: newTier })
      });

      if (response.ok) {
        alert('User tier updated successfully');
        loadAdminData();
      } else {
        alert('Failed to update user tier');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Error updating user');
    }
  };

  const resetUserCredits = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s credits to 0?')) return;
    
    try {
      const response = await fetch('/api/admin/reset-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user!.getIdToken()}`
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('User credits reset successfully');
        loadAdminData();
      } else {
        alert('Failed to reset credits');
      }
    } catch (error) {
      console.error('Failed to reset credits:', error);
      alert('Error resetting credits');
    }
  };

  const exportAllData = () => {
    const data = {
      stats,
      users,
      optimizations,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <Spinner size="lg" />
        <p className="text-gray-400 mt-4">Loading admin panel...</p>
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <Shield className="text-red-500 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-900 border-b border-red-700 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-200 text-sm">⚠️ {error}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="text-red-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">Listing Optimizer Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={exportAllData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Download size={16} />
                Export All
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="text-white font-medium text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-[88px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Activity className="inline mr-2" size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <BarChart3 className="inline mr-2" size={16} />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="inline mr-2" size={16} />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('optimizations')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'optimizations'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              Optimizations ({optimizations.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Settings className="inline mr-2" size={16} />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <StatsCards stats={stats} />
            
            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {optimizations.slice(0, 10).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{opt.userEmail || 'Unknown User'}</p>
                      <p className="text-gray-400 text-xs">{opt.platform} • {opt.mode}</p>
                    </div>
                    <p className="text-gray-500 text-xs">{new Date(opt.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts stats={stats} users={users} optimizations={optimizations} />
        )}

        {activeTab === 'users' && (
          <UsersTable 
            users={users} 
            onUpdateTier={updateUserTier} 
            onResetCredits={resetUserCredits} 
          />
        )}

        {activeTab === 'optimizations' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Platform</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Mode</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {optimizations.map((opt: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-750 transition-colors">
                      <td className="py-3 px-4 text-sm text-white">{opt.userEmail || 'Unknown'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs font-medium">
                          {opt.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">{opt.mode}</td>
                      <td className="py-3 px-4 text-sm text-gray-400 max-w-xs truncate">
                        {opt.optimized?.title || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(opt.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Admin Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Emails
                  </label>
                  <div className="space-y-2">
                    {ADMIN_EMAILS.map((email, idx) => (
                      <input
                        key={idx}
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    To change admin emails, update ADMIN_EMAILS in src/app/admin/page.tsx
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Refresh All Data
                    </button>
                    <button
                      onClick={exportAllData}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Export All Data
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">System Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Total Users</p>
                      <p className="text-white font-semibold text-lg">{users.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Optimizations</p>
                      <p className="text-white font-semibold text-lg">{optimizations.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Paid Conversion Rate</p>
                      <p className="text-white font-semibold text-lg">
                        {users.length > 0 ? Math.round((stats?.paidUsers / users.length) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Active Today</p>
                      <p className="text-white font-semibold text-lg">{stats?.activeToday || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
