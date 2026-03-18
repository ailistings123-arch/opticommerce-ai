'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Mail, Menu } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'demo-1', title: 'Optimization Complete', message: 'Your Amazon listing has been optimized successfully.', time: '2m ago', read: false, type: 'success' },
  { id: 'demo-2', title: 'New Feature Available', message: 'Try the new Analyze URL mode for competitor insights.', time: '1h ago', read: false, type: 'info' },
  { id: 'demo-3', title: 'Credits Running Low', message: 'You have used 80% of your monthly credits.', time: '3h ago', read: true, type: 'warning' },
];

const DEMO_MESSAGES: Message[] = [
  { id: '1', from: 'Support Team', subject: 'Welcome to ListingOptimizer!', preview: 'Thanks for joining us. Here are some tips to get started...', time: '1h ago', read: false },
  { id: '2', from: 'Billing', subject: 'Your invoice is ready', preview: 'Your monthly invoice for March 2026 is now available...', time: '1d ago', read: false },
];

const NOTIF_STORAGE_KEY = 'lo_notifications';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function DashboardHeader({ title, subtitle, onMenuClick }: DashboardHeaderProps) {
  const { userData } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const notifRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLDivElement>(null);

  // Merge Firestore notifications (from userData) with demo ones, deduplicated
  useEffect(() => {
    const firestoreNotifs: Notification[] = (userData as any)?.notifications || [];
    // Stored read states
    let stored: Record<string, boolean> = {};
    try { stored = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '{}'); } catch {}

    const merged = [
      ...firestoreNotifs.map(n => ({ ...n, read: stored[n.id] ?? n.read })),
      ...DEMO_NOTIFICATIONS.filter(d => !firestoreNotifs.find(f => f.id === d.id))
        .map(n => ({ ...n, read: stored[n.id] ?? n.read })),
    ];
    setNotifications(merged);
  }, [userData]);

  // Listen for new team invite notifications pushed via custom event
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const newNotif: Notification = e.detail;
      setNotifications(prev => {
        if (prev.find(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    };
    window.addEventListener('lo:notification' as any, handler);
    return () => window.removeEventListener('lo:notification' as any, handler);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMails = messages.filter(m => !m.read).length;

  const persistReadState = (updated: Notification[]) => {
    const map: Record<string, boolean> = {};
    updated.forEach(n => { map[n.id] = n.read; });
    try { localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(map)); } catch {}
  };

  const markAllNotifsRead = () => {
    setNotifications(n => {
      const updated = n.map(x => ({ ...x, read: true }));
      persistReadState(updated);
      return updated;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (mailRef.current && !mailRef.current.contains(e.target as Node)) setMailOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllMailsRead = () => setMessages(m => m.map(x => ({ ...x, read: true })));

  const typeColor = (type: Notification['type']) => {
    if (type === 'success') return 'bg-green-100 text-green-600';
    if (type === 'warning') return 'bg-yellow-100 text-yellow-600';
    return 'bg-blue-100 text-blue-600';
  };

  return (
    <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 sm:px-8 flex-shrink-0">
      {/* Left: mobile menu + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex flex-col justify-center gap-1 pt-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 leading-tight">{subtitle}</p>}
        </div>
      </div>

      {/* Right: mail, notif, user */}
      <div className="flex items-center gap-2">
        {/* Mail */}
        <div className="relative" ref={mailRef}>
          <button
            onClick={() => { setMailOpen(o => !o); setNotifOpen(false); }}
            className="relative w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Mail size={16} className="text-gray-600" />
            {unreadMails > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadMails}
              </span>
            )}
          </button>

          {mailOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Messages</span>
                {unreadMails > 0 && (
                  <button onClick={markAllMailsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No messages</p>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!msg.read ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                          <p className="text-xs font-semibold text-gray-900 truncate">{msg.from}</p>
                        </div>
                        <p className="text-xs font-medium text-gray-700 truncate mt-0.5">{msg.subject}</p>
                        <p className="text-[11px] text-gray-400 truncate">{msg.preview}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:underline w-full text-center">View all messages</button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setMailOpen(false); }}
            className="relative w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Bell size={16} className="text-gray-600" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadNotifs > 0 && (
                  <button onClick={markAllNotifsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : notifications.map(notif => (
                  <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${typeColor(notif.type)}`}>
                        <Bell size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-900 truncate">{notif.title}</p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:underline w-full text-center">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-blue-700">
              {userData?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-900 max-w-[120px] truncate">
            {userData?.displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
