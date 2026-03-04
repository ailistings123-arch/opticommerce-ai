'use client';

import { useState } from 'react';
import { Search, Download, Edit2, X, Check, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface UsersManagementProps {
  users: any[];
  onRefresh: () => void;
  authToken?: string;
}

interface EditingUser {
  id: string;
  usageLimit: number;
  usageCount: number;
}

export default function UsersManagement({ users, onRefresh, authToken }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper function to safely convert Firestore Timestamp to Date
  const toDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || user.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const startEditing = (user: any) => {
    setEditingUser({
      id: user.id,
      usageLimit: user.usageLimit || 0,
      usageCount: user.usageCount || 0
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  const saveChanges = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      // Get fresh token
      const token = authToken || '';
      
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingUser.id,
          usageLimit: editingUser.usageLimit,
          usageCount: editingUser.usageCount
        })
      });

      if (response.ok) {
        setEditingUser(null);
        onRefresh();
      } else {
        const error = await response.json();
        alert(`Failed to update user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const adjustValue = (field: 'usageLimit' | 'usageCount', delta: number) => {
    if (!editingUser) return;
    
    const newValue = Math.max(0, editingUser[field] + delta);
    setEditingUser({
      ...editingUser,
      [field]: newValue
    });
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Name', 'Tier', 'Usage', 'Limit', 'Created'];
    const rows = filteredUsers.map(user => [
      user.email,
      user.displayName || '',
      user.tier,
      user.usageCount,
      user.usageLimit,
      format(toDate(user.createdAt), 'yyyy-MM-dd')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Users Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage user accounts and optimization limits</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{users.length}</span> users
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Tier</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Usage</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Limit</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Joined</th>
                <th className="text-left py-4 px-4 xl:px-6 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user: any) => {
                const isEditing = editingUser?.id === user.id;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 xl:px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{user.email}</p>
                        {user.displayName && (
                          <p className="text-xs text-gray-500">{user.displayName}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 xl:px-6">
                      <span className={`px-2 xl:px-3 py-1 rounded-full text-xs font-semibold ${
                        user.tier === 'enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' :
                        user.tier === 'professional' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' :
                        user.tier === 'starter' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="py-4 px-4 xl:px-6">
                      {isEditing ? (
                        <div className="flex items-center gap-1 xl:gap-2">
                          <button
                            onClick={() => adjustValue('usageCount', -1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={editingUser.usageCount}
                            onChange={(e) => setEditingUser({ ...editingUser, usageCount: parseInt(e.target.value) || 0 })}
                            className="w-16 xl:w-20 px-2 py-1 border border-purple-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => adjustValue('usageCount', 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{user.usageCount}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 xl:px-6">
                      {isEditing ? (
                        <div className="flex items-center gap-1 xl:gap-2">
                          <button
                            onClick={() => adjustValue('usageLimit', -10)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={editingUser.usageLimit}
                            onChange={(e) => setEditingUser({ ...editingUser, usageLimit: parseInt(e.target.value) || 0 })}
                            className="w-16 xl:w-20 px-2 py-1 border border-purple-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => adjustValue('usageLimit', 10)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{user.usageLimit}</span>
                          <div className="w-16 xl:w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((user.usageCount / user.usageLimit) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 xl:px-6 text-sm text-gray-500">
                      {format(toDate(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-4 px-4 xl:px-6">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveChanges}
                            disabled={saving}
                            className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                            title="Save Changes"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(user)}
                          className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 xl:px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of <span className="font-semibold text-gray-900">{users.length}</span> users
          </p>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.map((user: any) => {
          const isEditing = editingUser?.id === user.id;
          
          return (
            <div key={user.id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  {user.displayName && (
                    <p className="text-xs text-gray-500 mt-0.5">{user.displayName}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0 ${
                  user.tier === 'enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                  user.tier === 'professional' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' :
                  user.tier === 'starter' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.tier}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Usage</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustValue('usageCount', -1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={editingUser.usageCount}
                        onChange={(e) => setEditingUser({ ...editingUser, usageCount: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 border border-purple-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => adjustValue('usageCount', 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">{user.usageCount}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Limit</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustValue('usageLimit', -10)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={editingUser.usageLimit}
                        onChange={(e) => setEditingUser({ ...editingUser, usageLimit: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 border border-purple-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => adjustValue('usageLimit', 10)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{user.usageLimit}</span>
                  )}
                </div>

                {!isEditing && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((user.usageCount / user.usageLimit) * 100, 100)}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Joined {format(toDate(user.createdAt), 'MMM dd, yyyy')}
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveChanges}
                        disabled={saving}
                        className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-xs font-medium flex items-center gap-1"
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={saving}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-xs font-medium flex items-center gap-1"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(user)}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-xs font-medium flex items-center gap-1"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of <span className="font-semibold text-gray-900">{users.length}</span> users
          </p>
        </div>
      </div>
    </div>
  );
}
