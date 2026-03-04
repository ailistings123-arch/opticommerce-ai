'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import Spinner from '@/components/ui/Spinner';
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Activity,
  DollarSign,
  Download,
  RefreshCw,
  LogOut,
  Bell,
  User,
  ChevronDown
} from 'lucide-react';

// Import components
import DashboardOverview from '@/components/admin/DashboardOverview';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import RevenueAnalytics from '@/components/admin/RevenueAnalytics';
import ActivityLogs from '@/components/admin/ActivityLogs';
import SettingsPanel from '@/components/admin/SettingsPanel';

const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

type TabType = 'dashboard' | 'analytics' | 'users' | 'revenue' | 'activity' | 'settings';

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');

  // Update document title
  useEffect(() => {
    document.title = 'ListingOPT Admin Panel';
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/admin/login');
      } else if (!ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/dashboard');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const token = await user.getIdToken();
      setAuthToken(token);
      
      const [statsRes, usersRes, optimizationsRes, analyticsRes, revenueRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/optimizations', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/revenue', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [stats, users, optimizations, analytics, revenue] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        optimizationsRes.json(),
        analyticsRes.json(),
        revenueRes.json()
      ]);

      setData({
        stats: stats.data,
        users: users.data,
        optimizations: optimizations.data,
        analytics: analytics.data,
        revenue: revenue.data
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-xs sm:text-sm tracking-tight">LO</span>
              </div>
              <div className="hidden sm:flex items-baseline gap-0.5">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Listing</span>
                <span className="text-lg sm:text-xl font-bold text-blue-600">OPT</span>
              </div>
              <span className="text-xs font-semibold text-gray-400 px-2 py-1 bg-gray-100 rounded-full">Admin</span>
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden flex-1 max-w-xs">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <button
                onClick={loadData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} className="text-gray-600" />
              </button>
              
              <button
                onClick={handleExport}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden md:inline">Export</span>
              </button>

              <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={18} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <User size={15} className="text-white" />
                  </div>
                  <ChevronDown size={16} className="text-gray-600 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Administrator</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto">
        {activeTab === 'dashboard' && data && (
          <DashboardOverview data={data} onRefresh={loadData} />
        )}
        {activeTab === 'analytics' && data && (
          <AnalyticsDashboard data={data} />
        )}
        {activeTab === 'users' && data && (
          <UsersManagement users={data.users} onRefresh={loadData} authToken={authToken} />
        )}
        {activeTab === 'revenue' && data && (
          <RevenueAnalytics revenue={data.revenue} />
        )}
        {activeTab === 'activity' && data && (
          <ActivityLogs optimizations={data.optimizations} users={data.users} />
        )}
        {activeTab === 'settings' && user && (
          <SettingsPanel user={user} />
        )}
      </main>
    </div>
  );
}
