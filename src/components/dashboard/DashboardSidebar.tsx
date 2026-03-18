'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/firebase/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { Sparkles, PlusCircle, Search, Settings, LogOut, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export type OptimizationMode = 'optimize-existing' | 'create-new' | 'analyze-url';

interface DashboardSidebarProps {
  mode?: OptimizationMode;
  onModeChange?: (mode: OptimizationMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const modes = [
  { id: 'optimize-existing' as OptimizationMode, icon: Sparkles,   label: 'Optimize Existing', emoji: '✨' },
  { id: 'create-new'        as OptimizationMode, icon: PlusCircle, label: 'Create New',          emoji: '🆕' },
  { id: 'analyze-url'       as OptimizationMode, icon: Search,     label: 'Analyze URL',         emoji: '🔍' },
];

export default function DashboardSidebar({ mode, onModeChange, collapsed, onToggleCollapse }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useAuth();

  const handleSignOut = async () => { await signOut(); router.push('/'); };

  const isDashboard = pathname === '/dashboard';
  const isSettings = pathname === '/dashboard/settings';

  const usagePct = userData ? Math.min((userData.usageCount / userData.usageLimit) * 100, 100) : 0;
  const barColor  = usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-blue-500';

  const navItem = (active: boolean, col: boolean) =>
    `w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${col ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`;

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Logo row — always visible */}
      <div className="flex items-center h-16 px-3 border-b border-gray-100 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          {!collapsed && <span className="text-sm font-bold text-gray-900 truncate">ListingOptimizer</span>}
        </Link>
        <button onClick={onToggleCollapse} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all flex-shrink-0 ml-1">
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Modes */}
      <div className="px-2 pt-5 pb-2 flex-shrink-0">
        {!collapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Modes</p>}
        <nav className="space-y-0.5">
          {modes.map(({ id, icon: Icon, label, emoji }) => {
            const active = isDashboard && mode === id;
            return (
              <button key={id} onClick={() => { onModeChange?.(id); if (!isDashboard) router.push('/dashboard'); }}
                title={collapsed ? label : undefined}
                className={navItem(active, collapsed)}>
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Usage bar */}
      {userData && (
        <div className={`mx-2 mt-1 mb-2 rounded-xl bg-gray-50 border border-gray-100 ${collapsed ? 'p-2' : 'px-3 py-3'}`}>
          {!collapsed ? (
            <>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-gray-700">Usage</span>
                <span className="text-[11px] font-bold text-gray-800">{Math.round(usagePct)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${usagePct}%` }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium">{userData.usageCount} / {userData.usageLimit} used</p>
            </>
          ) : (
            <div title={`${userData.usageCount}/${userData.usageLimit} used`} className="flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${barColor}`} style={{ opacity: Math.max(0.4, usagePct / 100) }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Account */}
      <div className="px-2 pb-2 flex-shrink-0">
        {!collapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Account</p>}
        <nav className="space-y-0.5">
          <Link href="/dashboard/settings" title={collapsed ? 'Settings' : undefined}
            className={navItem(isSettings, collapsed)}>
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && 'Settings'}
          </Link>
          <a href="mailto:support@listingoptimizer.site" title={collapsed ? 'Help & Support' : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}`}>
            <HelpCircle size={18} className="flex-shrink-0" />
            {!collapsed && 'Help & Support'}
          </a>
          <button onClick={handleSignOut} title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}`}>
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && 'Sign Out'}
          </button>
        </nav>
      </div>

      {/* User card */}
      {userData && (
        <div className={`mx-2 mb-3 pt-3 border-t border-gray-100 flex items-center gap-2.5 ${collapsed ? 'justify-center px-1' : 'px-2'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">{userData.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{userData.displayName}</p>
              <p className="text-[10px] text-gray-500 truncate capitalize">{userData.tier} plan</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
