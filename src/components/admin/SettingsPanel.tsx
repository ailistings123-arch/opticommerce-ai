'use client';

import { Settings, Shield, Database, Bell } from 'lucide-react';

interface SettingsPanelProps {
  user: any;
}

export default function SettingsPanel({ user }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Admin Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value="Administrator"
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="text-gray-600" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">Security</p>
                <p className="text-xs text-gray-500">Manage security settings</p>
              </div>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">Configure</button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Database className="text-gray-600" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Database configuration</p>
              </div>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">Configure</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="text-gray-600" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">Email notifications</p>
              </div>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">Configure</button>
          </div>
        </div>
      </div>
    </div>
  );
}
