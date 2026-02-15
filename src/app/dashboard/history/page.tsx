'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getOptimizationHistory } from '@/lib/firebase/firestore';
import HistoryTable from '@/components/dashboard/HistoryTable';
import Spinner from '@/components/ui/Spinner';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Optimization } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      console.log('Loading optimization history...');
      const history = await getOptimizationHistory(user!.uid);
      console.log('History loaded:', history.length, 'items');
      setOptimizations(history);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load history:', error);
      
      // Set user-friendly error message
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        setError('Database index required. Please check the console for setup instructions.');
      } else if (error.code === 'permission-denied') {
        setError('Permission denied. Please check Firestore security rules.');
      } else {
        setError('Failed to load history. Please check the browser console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="text-blue-600" size={24} />
              <span className="text-xl font-semibold text-gray-900">ListingOptimizer</span>
            </Link>
            <Link href="/dashboard">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimization History</h1>
          <p className="text-gray-600">View all your past product optimizations</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading History</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={loadHistory}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <HistoryTable optimizations={optimizations} />
      </main>
    </div>
  );
}
