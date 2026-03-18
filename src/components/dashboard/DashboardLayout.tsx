'use client';

import { useState } from 'react';
import DashboardSidebar, { OptimizationMode } from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  mode?: OptimizationMode;
  onModeChange?: (mode: OptimizationMode) => void;
}

export default function DashboardLayout({ children, title, subtitle, mode, onModeChange }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <DashboardSidebar
          mode={mode}
          onModeChange={onModeChange}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-64 flex flex-col shadow-xl">
            <DashboardSidebar
              mode={mode}
              onModeChange={(m) => { onModeChange?.(m); setMobileOpen(false); }}
              collapsed={false}
              onToggleCollapse={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-6 sm:px-8 lg:px-10 py-8 pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
