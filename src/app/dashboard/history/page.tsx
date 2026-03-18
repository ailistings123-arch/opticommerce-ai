'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getOptimizationHistory } from '@/lib/firebase/firestore';
import HistoryTable from '@/components/dashboard/HistoryTable';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Spinner from '@/components/ui/Spinner';
import { Optimization } from '@/types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const history = await getOptimizationHistory(user!.uid);
      setOptimizations(history);
      setError(null);
    } catch (err: any) {
      if (err.code === 'failed-precondition' || err.message?.includes('index')) {
        setError('Database index required. Please check the console for setup instructions.');
      } else if (err.code === 'permission-denied') {
        setError('Permission denied. Please check Firestore security rules.');
      } else {
        setError('Failed to load history. Please check the browser console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Spinner size="lg" /></div>;
  }
  if (!user) return null;

  return (
    <DashboardLayout title="Optimization History" subtitle="View and search all your past product optimizations">
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-700 font-medium">
                {optimizations.length > 0
                  ? `${optimizations.length} optimization${optimizations.length !== 1 ? 's' : ''} found`
                  : 'No optimizations yet'}
              </p>
            </div>
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-red-900">Error Loading History</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
                <button onClick={loadHistory} className="mt-2 text-sm text-red-600 hover:underline">Try Again</button>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <HistoryTable optimizations={optimizations} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
