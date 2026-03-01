'use client';

import { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: any[];
  onSend: (subject: string, message: string) => Promise<void>;
}

export default function EmailModal({ isOpen, onClose, selectedUsers, onSend }: EmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      await onSend(subject, message);
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-white">Email Users</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipients ({selectedUsers.length} users)
            </label>
            <div className="bg-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
              {selectedUsers.map((user, idx) => (
                <div key={idx} className="text-sm text-gray-300 py-1">
                  {user.email}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={8}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Note: Email functionality requires integration with an email service provider (SendGrid, AWS SES, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
