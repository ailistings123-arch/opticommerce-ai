'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Shield,
  Database,
  Activity,
  Settings
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'optimizations' | 'settings'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!ADMIN_EMAILS.includes(user.email || '')) {
        // Not admin - redirect to dashboard
        router.push('/dashboard');
      } else {
        loadAdminData();
      }
    }
  }, [user, authLoading, router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${await user!.getIdToken()}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch all users
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${await user!.getIdToken()}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data);
      }

      // Fetch recent optimizations
      const optimizationsResponse = await fetch('/api/admin/optimizations', {
        headers: {
          'Authorization': `Bearer ${await user!.getIdToken()}`
        }
      });
      
      if (optimizationsResponse.ok) {
        const optimizationsData = await optimizationsResponse.json();
        setOptimizations(optimizationsData.data);
      }

    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-red-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">Listing Optimizer Management</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Activity className="inline mr-2" size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'optimizations'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              Optimizations
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers || 0}</p>
                  </div>
                  <Users className="text-blue-500" size={40} />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Optimizations</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalOptimizations || 0}</p>
                  </div>
                  <FileText className="text-green-500" size={40} />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Paid Users</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.paidUsers || 0}</p>
                  </div>
                  <DollarSign className="text-yellow-500" size={40} />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Today</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.activeToday || 0}</p>
                  </div>
                  <TrendingUp className="text-purple-500" size={40} />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {optimizations.slice(0, 10).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div>
                      <p className="text-white text-sm">{opt.userEmail || 'Unknown User'}</p>
                      <p className="text-gray-400 text-xs">{opt.platform} • {opt.mode}</p>
                    </div>
                    <p className="text-gray-500 text-xs">{new Date(opt.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Tier</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Usage</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Created</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-750">
                      <td className="py-3 px-4 text-sm text-white">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.tier === 'enterprise' ? 'bg-purple-900 text-purple-200' :
                          user.tier === 'professional' ? 'bg-blue-900 text-blue-200' :
                          user.tier === 'starter' ? 'bg-green-900 text-green-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {user.usageCount} / {user.usageLimit}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => updateUserTier(user.id, e.target.value)}
                            className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                            defaultValue={user.tier}
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="professional">Professional</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                          <button
                            onClick={() => resetUserCredits(user.id)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                          >
                            Reset Credits
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'optimizations' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
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
                    <tr key={idx} className="hover:bg-gray-750">
                      <td className="py-3 px-4 text-sm text-white">{opt.userEmail || 'Unknown'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
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
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
                  <button
                    onClick={loadAdminData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
