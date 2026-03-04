'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogsProps {
  optimizations: any[];
  users: any[];
}

export default function ActivityLogs({ optimizations, users }: ActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  const filteredLogs = optimizations.filter(opt => {
    const matchesSearch = opt.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || opt.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const platforms = [...new Set(optimizations.map(o => o.platform))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="all">All Platforms</option>
          {platforms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Platform</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Mode</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-sm text-gray-900">{log.userEmail || 'Unknown'}</td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {log.platform}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">{log.mode}</td>
                  <td className="py-3 px-6 text-sm text-gray-500 max-w-xs truncate">
                    {log.optimized?.title || 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
