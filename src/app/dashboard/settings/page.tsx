'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Spinner from '@/components/ui/Spinner';
import { Check, CreditCard, Download, ShieldAlert, User, LayoutGrid, Clock, FileText, Settings2, Camera, Mail, Shield, Users, Plus, Trash2 } from 'lucide-react';

type Tab = 'profile' | 'overview' | 'history' | 'details' | 'subscriptions' | 'team';

const MOCK_INVOICES = [
  { plan: 'Free Plan', amount: '$0', date: 'March 18, 2026', status: 'paid' },
  { plan: 'Free Plan', amount: '$0', date: 'February 18, 2026', status: 'paid' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('editor');
  const [teamMembers, setTeamMembers] = useState<{ email: string; name: string; role: 'viewer' | 'editor'; addedAt: string }[]>([]);
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setTeamMembers(userData.teamMembers || []);
    }
  }, [userData]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Spinner size="lg" /></div>;
  if (!user || !userData) return null;

  const tierColor: Record<string, string> = {
    free: 'text-gray-600', starter: 'text-blue-600', professional: 'text-purple-600', enterprise: 'text-orange-600',
  };
  const tierPrice: Record<string, string> = {
    free: '$0/Month', starter: '$25/Month', professional: '$49/Month', enterprise: '$150/Month',
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile',       label: 'Profile',       icon: User },
    { key: 'overview',      label: 'Billing',        icon: LayoutGrid },
    { key: 'history',       label: 'History',        icon: Clock },
    { key: 'details',       label: 'Details',        icon: FileText },
    { key: 'subscriptions', label: 'Subscriptions',  icon: Settings2 },
    ...(userData.tier === 'enterprise' ? [{ key: 'team' as Tab, label: 'Team', icon: Users }] : []),
  ];

  const handleInvite = async () => {
    setInviteError('');
    if (!inviteEmail || !inviteName) { setInviteError('Please enter both name and email.'); return; }
    if (teamMembers.length >= 5) { setInviteError('Maximum 5 team members allowed on Enterprise plan.'); return; }
    setInviteLoading(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch('/api/team-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole }),
      });
      const data = await res.json();
      if (!data.success) { setInviteError(data.error || 'Failed to invite member.'); return; }

      setTeamMembers(prev => [...prev, data.data]);
      setInviteEmail(''); setInviteName('');

      // Fire a local notification so the owner sees it immediately in the bell
      const notif = {
        id: Date.now().toString(),
        title: 'Team Member Added',
        message: `${inviteName} (${inviteEmail}) was added as ${inviteRole}. An invite email has been sent.`,
        time: 'just now',
        read: false,
        type: 'success' as const,
      };
      window.dispatchEvent(new CustomEvent('lo:notification', { detail: notif }));
    } catch (err: any) {
      setInviteError(err.message || 'Something went wrong.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      const token = await user!.getIdToken();
      await fetch('/api/team-invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      setTeamMembers(prev => prev.filter(m => m.email !== email));
    } catch {
      setTeamMembers(prev => prev.filter(m => m.email !== email));
    }
  };

  return (
    <DashboardLayout title="Account Settings" subtitle="Manage your profile, billing & subscriptions">
      <div className="max-w-4xl">

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-600 mt-0.5">Manage your profile details and account info</p>
            </div>

            {/* Avatar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Photo</h3>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                    <span className="text-3xl font-black text-white">
                      {userData.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow border-2 border-white hover:bg-blue-700 transition-colors">
                    <Camera size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{userData.displayName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{userData.email}</p>
                  <button className="mt-2 text-xs text-blue-600 hover:underline font-medium">Upload new photo</button>
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Account Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Display Name</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{userData.email}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
              <button
                onClick={() => setProfileSaved(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {profileSaved ? '✅ Saved!' : 'Save Changes'}
              </button>
            </div>

            {/* Plan & status */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Account Plan', value: <span className="capitalize font-bold text-blue-600">{userData.tier} Plan</span> },
                  { label: 'Credits Used', value: `${userData.usageCount} / ${userData.usageLimit}` },
                  { label: 'Account Status', value: <span className="flex items-center gap-1.5 text-green-600 font-semibold"><span className="w-2 h-2 rounded-full bg-green-500" />Active</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-gray-700" />
                <h3 className="text-sm font-semibold text-gray-900">Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-xs text-gray-600">Last changed: never</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline font-medium">Change</button>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Auth</p>
                    <p className="text-xs text-gray-600">Add extra security to your account</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline font-medium">Enable</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Billing Overview</h2>
              <p className="text-sm text-gray-600 mt-0.5">Summarizes all your payment and subscription for the purchased Applications</p>
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Contact Details</h3>
                  <p className="text-xs text-gray-600 mt-1">Who should we contact if necessary?</p>
                  <button className="mt-3 text-xs text-blue-600 hover:underline font-medium">Manage Contact Details</button>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-blue-700">{userData.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{userData.displayName}</p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Account Email</p>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Current Plan</h3>
                  <p className="text-xs text-gray-600 mt-1">You can update your plan anytime for best benefit from the product</p>
                  <button onClick={() => router.push('/dashboard/checkout')} className="mt-3 text-xs text-blue-600 hover:underline font-medium">Switch Plan</button>
                </div>
                <div className="flex items-center gap-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 capitalize">{userData.tier} Plan</span>
                      <span className={`text-sm font-bold ${tierColor[userData.tier] || 'text-gray-600'}`}>{tierPrice[userData.tier] || '$0/Month'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {userData.usageCount} / {userData.usageLimit} optimizations used · {userData.usageLimit - userData.usageCount} remaining
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Payment Details</h3>
                  <p className="text-xs text-gray-600 mt-1">Select Default Payment method or switch card details</p>
                  <button className="mt-3 text-xs text-blue-600 hover:underline font-medium">Billing Details</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-black tracking-wider">VISA</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">Visa Card</p>
                      <p className="text-[11px] text-gray-600">•••• •••• •••• 4242</p>
                    </div>
                    <span className="text-[10px] text-gray-600">Primary Card</span>
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/checkout')}
                    className="w-full py-2.5 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    + Add payment method
                  </button>
                </div>
              </div>
            </div>

            {/* Billing History preview */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Billing History</h3>
                  <p className="text-xs text-gray-600 mt-1">Summary on the payment history for the subscription plan</p>
                  <button onClick={() => setTab('history')} className="mt-3 text-xs text-blue-600 hover:underline font-medium">Billing History</button>
                </div>
                <div>
                  <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-100">
                    <span>Invoice</span><span>Amount</span><span>Date</span><span>Status</span>
                  </div>
                  {MOCK_INVOICES.map((inv, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 py-3 border-b border-gray-50 items-center">
                      <span className="text-xs text-gray-700">{inv.plan}</span>
                      <span className="text-xs font-semibold text-gray-900">{inv.amount}</span>
                      <span className="text-xs text-gray-500">{inv.date}</span>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Paid
                        </span>
                        <button className="p-1 hover:bg-gray-100 rounded"><Download size={12} className="text-gray-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <ShieldAlert size={16} className="text-red-500" />
                </div>
                <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Billing History</h2>
              <p className="text-xs text-gray-600 mt-0.5">All your past invoices and payments</p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-4 gap-4 px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                <span>Invoice</span><span>Amount</span><span>Date</span><span>Status</span>
              </div>
              {MOCK_INVOICES.map((inv, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700">{inv.plan}</span>
                  <span className="text-sm font-semibold text-gray-900">{inv.amount}</span>
                  <span className="text-sm text-gray-500">{inv.date}</span>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Paid
                    </span>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Download size={14} className="text-gray-400" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'details' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Billing Details</h2>
            <div className="space-y-3">
              {[['Name', userData.displayName], ['Email', userData.email], ['Plan', `${userData.tier} — ${tierPrice[userData.tier] || '$0/Month'}`]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'subscriptions' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Manage Subscriptions</h2>
            <div className="flex items-center gap-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <CreditCard size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 capitalize">{userData.tier} Plan — {tierPrice[userData.tier] || '$0/Month'}</p>
                <p className="text-xs text-gray-500">Renews monthly · {userData.usageLimit} optimizations</p>
              </div>
              <button onClick={() => router.push('/dashboard/checkout')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors">
                Switch Plan
              </button>
            </div>
            <p className="text-xs text-gray-600">To cancel your subscription, please contact support or manage via your billing portal.</p>
          </div>
        )}

        {tab === 'team' && userData.tier === 'enterprise' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add up to 5 members to share access to your workspace.</p>
            </div>

            {/* Invite form */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Invite Member</h3>
                <span className="text-xs text-gray-400">{teamMembers.length} / 5 used</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
                <div className="flex gap-2">
                  {(['editor', 'viewer'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setInviteRole(r)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors capitalize ${
                        inviteRole === r
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {inviteRole === 'editor' ? 'Can create and optimize listings' : 'Can view listings and results only'}
                </p>
              </div>
              {inviteError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{inviteError}</p>}
              <button
                onClick={handleInvite}
                disabled={teamMembers.length >= 5 || inviteLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {inviteLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Plus size={14} />}
                {inviteLoading ? 'Sending...' : 'Add Member'}
              </button>
            </div>

            {/* Members list */}
            {teamMembers.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Current Members</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {teamMembers.map(member => (
                    <div key={member.email} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                        member.role === 'editor' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-[11px] text-gray-400 hidden sm:block">{member.addedAt}</span>
                      <button
                        onClick={() => handleRemoveMember(member.email)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {teamMembers.length === 0 && (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <Users size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No team members yet</p>
                <p className="text-xs text-gray-400 mt-1">Invite up to 5 people to collaborate</p>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
