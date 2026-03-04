'use client';

import { useState } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Globe, X } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogsProps {
  optimizations: any[];
  users: any[];
}

export default function ActivityLogs({ optimizations, users }: ActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const filteredLogs = optimizations.filter(opt => {
    const matchesSearch = opt.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opt.optimized?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || opt.platform === filterPlatform;
    const matchesMode = filterMode === 'all' || opt.mode === filterMode;
    return matchesSearch && matchesPlatform && matchesMode;
  });

  // Helper function to safely convert Firestore Timestamp to Date
  const toDate = (timestamp: any): Date => {
    try {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) return date;
      }
      return new Date();
    } catch (error) {
      console.error('Error converting timestamp:', error);
      return new Date();
    }
  };

  const platforms = [...new Set(optimizations.map(o => o.platform).filter(Boolean))];
  const modes = [...new Set(optimizations.map(o => o.mode).filter(Boolean))];

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'User', 'Platform', 'Mode', 'Title'];
      const rows = filteredLogs
        .filter(log => {
          try {
            const date = toDate(log.createdAt);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        })
        .map(log => [
          format(toDate(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          log.userEmail || 'Unknown',
          log.platform || 'Unknown',
          log.mode || 'Unknown',
          log.optimized?.title || 'N/A'
        ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: any = {
      amazon: 'from-orange-500 to-yellow-500',
      shopify: 'from-green-500 to-emerald-500',
      etsy: 'from-orange-600 to-red-500',
      ebay: 'from-blue-500 to-cyan-500',
      walmart: 'from-blue-600 to-indigo-600',
      woocommerce: 'from-purple-600 to-pink-600'
    };
    return colors[platform.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  const getModeColor = (mode: string) => {
    const colors: any = {
      'optimize-existing': 'bg-blue-100 text-blue-700',
      'create-new': 'bg-green-100 text-green-700',
      'analyze-url': 'bg-purple-100 text-purple-700'
    };
    return colors[mode] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Activity Logs
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Monitor all user optimizations and activities</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{optimizations.length}</span> activities
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex-shrink-0">
              <Globe size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Total Activities</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{optimizations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex-shrink-0">
              <User size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Active Users</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{new Set(optimizations.map(o => o.userId)).size}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex-shrink-0">
              <Globe size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Platforms Used</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{platforms.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex-shrink-0">
              <Calendar size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {(() => {
                  try {
                    const today = new Date().toDateString();
                    return optimizations.filter(o => {
                      try {
                        const activityDate = toDate(o.createdAt);
                        if (isNaN(activityDate.getTime())) return false;
                        return activityDate.toDateString() === today;
                      } catch {
                        return false;
                      }
                    }).length;
                  } catch {
                    return 0;
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by user or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
          >
            <option value="all">All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
          >
            <option value="all">All Modes</option>
            {modes.map(m => (
              <option key={m} value={m}>{m.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Desktop Activity Table */}
      <div className="hidden lg:block bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Platform</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Mode</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log: any, idx: number) => {
                // Skip logs with invalid dates
                try {
                  const logDate = toDate(log.createdAt);
                  if (isNaN(logDate.getTime())) {
                    console.warn('Skipping log with invalid date:', log.id);
                    return null;
                  }
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 xl:px-6">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{format(logDate, 'MMM dd, yyyy')}</p>
                          <p className="text-xs text-gray-500">{format(logDate, 'HH:mm:ss')}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 xl:px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-white" />
                          </div>
                          <span className="text-sm text-gray-900 truncate max-w-[150px]">{log.userEmail || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 xl:px-6">
                        <span className={`px-2 xl:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPlatformColor(log.platform)} text-white shadow-lg`}>
                          {log.platform}
                        </span>
                      </td>
                      <td className="py-4 px-4 xl:px-6">
                        <span className={`px-2 xl:px-3 py-1 rounded-full text-xs font-semibold ${getModeColor(log.mode)}`}>
                          {log.mode.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 xl:px-6">
                        <p className="text-sm text-gray-900 max-w-xs truncate">
                          {log.optimized?.title || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-4 xl:px-6">
                        <button
                          onClick={() => setSelectedActivity(log)}
                          className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                } catch (error) {
                  console.error('Error rendering log:', error, log);
                  return null;
                }
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 xl:px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredLogs.length}</span> of <span className="font-semibold text-gray-900">{optimizations.length}</span> activities
          </p>
        </div>
      </div>

      {/* Mobile Activity Cards */}
      <div className="lg:hidden space-y-3">
        {filteredLogs.map((log: any, idx: number) => {
          try {
            const logDate = toDate(log.createdAt);
            if (isNaN(logDate.getTime())) {
              return null;
            }

            return (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{log.userEmail || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{format(logDate, 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedActivity(log)}
                    className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex-shrink-0 ml-2"
                  >
                    <Eye size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPlatformColor(log.platform)} text-white`}>
                      {log.platform}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getModeColor(log.mode)}`}>
                      {log.mode.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {log.optimized?.title || 'N/A'}
                  </p>
                </div>
              </div>
            );
          } catch (error) {
            return null;
          }
        })}

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            Showing <span className="font-semibold text-gray-900">{filteredLogs.length}</span> of <span className="font-semibold text-gray-900">{optimizations.length}</span> activities
          </p>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold">Activity Details</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">User</label>
                <p className="text-sm text-gray-900 mt-1 break-words">{selectedActivity.userEmail}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Platform</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedActivity.platform}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Mode</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedActivity.mode}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Date & Time</label>
                <p className="text-sm text-gray-900 mt-1">
                  {(() => {
                    try {
                      const date = toDate(selectedActivity.createdAt);
                      return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'PPpp');
                    } catch {
                      return 'Invalid date';
                    }
                  })()}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Optimized Title</label>
                <p className="text-sm text-gray-900 mt-1 break-words">{selectedActivity.optimized?.title || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                <p className="text-sm text-gray-900 mt-1 max-h-32 overflow-y-auto break-words">{selectedActivity.optimized?.description || 'N/A'}</p>
              </div>
              {selectedActivity.optimized?.tags && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedActivity.optimized.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
