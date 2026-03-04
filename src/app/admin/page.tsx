'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  FileText,
  TrendingUp,
  Activity,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Eye,
  MousePointer,
  Globe
} from 'lucide-react';

// Import new components
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
      const token = await user!.getIdToken();
      
      const [statsRes, usersRes, optimizationsRes, analyticsRes, revenueRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/optimizations', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/revenue', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const stats = statsRes.ok ? await statsRes.json() : null;
      const users = usersRes.ok ? await usersRes.json() : null;
      const optimizations = optimizationsRes.ok ? await optimizationsRes.json() : null;
      const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
      const revenue = revenueRes.ok ? await revenueRes.json() : null;

      setData({
        stats: stats?.data,
        users: users?.data || [],
        optimizations: optimizations?.data || [],
        analytics: analytics?.data,
        revenue: revenue?.data
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronDown className={`transform ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'} transition-transform`} size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-gray-200">
          {!sidebarCollapsed && (
            <div>
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'dashboard' && data && (
            <DashboardOverview data={data} onRefresh={loadData} />
          )}
          {activeTab === 'analytics' && data && (
            <AnalyticsDashboard data={data} />
          )}
          {activeTab === 'users' && data && (
            <UsersManagement users={data.users} onRefresh={loadData} />
          )}
          {activeTab === 'revenue' && data && (
            <RevenueAnalytics revenue={data.revenue} />
          )}
          {activeTab === 'activity' && data && (
            <ActivityLogs optimizations={data.optimizations} users={data.users} />
          )}
          {activeTab === 'settings' && (
            <SettingsPanel user={user} />
          )}
        </div>
      </main>
    </div>
  );
}
