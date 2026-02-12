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
      const history = await getOptimizationHistory(user!.uid);
      setOptimizations(history);
    } catch (error) {
      console.error('Failed to load history:', error);
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
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-600" size={24} />
              <span className="text-xl font-semibold text-gray-900">OptiCommerce AI</span>
            </div>
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

        <HistoryTable optimizations={optimizations} />
      </main>
    </div>
  );
}
