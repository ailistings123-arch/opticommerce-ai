'use client';

import { Settings, Shield, Database, Bell } from 'lucide-react';

interface SettingsPanelProps {
  user: any;
}

export default function SettingsPanel({ user }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">Admin Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value="Administrator"
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Security</p>
                <p className="text-xs text-gray-500">Manage security settings</p>
              </div>
            </div>
            <button className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">Configure</button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <Database size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Database configuration</p>
              </div>
            </div>
            <button className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">Configure</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">Email notifications</p>
              </div>
            </div>
            <button className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">Configure</button>
          </div>
        </div>
      </div>
    </div>
  );
}
