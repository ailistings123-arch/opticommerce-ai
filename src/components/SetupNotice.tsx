'use client';

import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SetupNotice() {
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">
            Firebase Setup Required
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            Firestore database is not configured. The app will work with limited functionality.
          </p>
          <div className="space-y-2 text-sm text-yellow-800">
            <p className="font-medium">To enable full features:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Firebase Console</li>
              <li>Enable Firestore Database</li>
              <li>Apply security rules</li>
              <li>Enable Authentication</li>
            </ol>
          </div>
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors"
          >
            Open Firebase Console
            <ExternalLink size={14} />
          </a>
        </div>
        <button
          onClick={() => {
            const notice = document.querySelector('[data-setup-notice]');
            if (notice) notice.remove();
          }}
          className="text-yellow-600 hover:text-yellow-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}
