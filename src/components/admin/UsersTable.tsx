'use client';

import { useState } from 'react';
import { Search, Download, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface UsersTableProps {
  users: any[];
  onUpdateTier: (userId: string, tier: string) => void;
  onResetCredits: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onEmailUsers?: (users: any[]) => void;
}

export default function UsersTable({ users, onUpdateTier, onResetCredits, onDeleteUser, onEmailUsers }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || user.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Display Name', 'Tier', 'Usage', 'Limit', 'Created At'];
    const rows = filteredUsers.map(user => [
      user.email,
      user.displayName || '',
      user.tier,
      user.usageCount,
      user.usageLimit,
      format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handleEmailSelected = () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user');
      return;
    }
    const selected = filteredUsers.filter(u => selectedUsers.has(u.id));
    onEmailUsers?.(selected);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-2">
            {onEmailUsers && (
              <button
                onClick={handleEmailSelected}
                disabled={selectedUsers.size === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                Email ({selectedUsers.size})
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <span>{selectedUsers.size} user(s) selected</span>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="text-gray-400 hover:text-white underline"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Name</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Tier</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Usage</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Created</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-3 px-4 text-sm text-white">{user.email}</td>
                <td className="py-3 px-4 text-sm text-gray-300">{user.displayName || '-'}</td>
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
                  <div className="flex items-center gap-2">
                    <span>{user.usageCount} / {user.usageLimit}</span>
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((user.usageCount / user.usageLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400">
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => onUpdateTier(user.id, e.target.value)}
                      className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={user.tier}
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <button
                      onClick={() => onResetCredits(user.id)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                      title="Reset Credits"
                    >
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
