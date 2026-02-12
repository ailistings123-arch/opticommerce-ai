'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import OptimizationForm from '@/components/dashboard/OptimizationForm';
import CreateProductForm from '@/components/dashboard/CreateProductForm';
import UrlOptimizationForm from '@/components/dashboard/UrlOptimizationForm';
import ResultCard from '@/components/dashboard/ResultCard';
import UsageStats from '@/components/dashboard/UsageStats';
import Spinner from '@/components/ui/Spinner';
import { Sparkles, LogOut, History, Settings, FileText, Plus, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type OptimizationMode = 'existing' | 'new' | 'url';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [mode, setMode] = useState<OptimizationMode>('existing');
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [showSetupNotice, setShowSetupNotice] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Check if we're using default userData (Firestore not set up)
    if (userData && userData.usageCount === 0 && !userData.createdAt) {
      setShowSetupNotice(true);
    }
  }, [userData]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleOptimizationSuccess = (result: any, original: any) => {
    setOptimizationResult(result.optimized);
    setOriginalData(original);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Setup Notice */}
      {showSetupNotice && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <div className="text-sm">
                <span className="font-semibold text-yellow-900">Setup Required: </span>
                <span className="text-yellow-800">
                  Firestore database is not configured. 
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1 font-medium hover:text-yellow-900"
                  >
                    Enable Firestore now
                  </a>
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSetupNotice(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-600" size={24} />
              <span className="text-xl font-semibold text-gray-900">OptiCommerce AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/history">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                  <History size={18} />
                  History
                </button>
              </Link>
              <Link href="/dashboard/settings">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                  <Settings size={18} />
                  Settings
                </button>
              </Link>
              <button 
                onClick={handleSignOut}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userData.displayName}!
          </h1>
          <p className="text-gray-600">
            Optimize your product listings with AI-powered suggestions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Optimization Mode</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setMode('existing')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mode === 'existing'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`mb-3 ${mode === 'existing' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                  <h3 className="font-semibold text-gray-900 mb-1">Optimize Existing</h3>
                  <p className="text-sm text-gray-600">Improve your current listing</p>
                </button>

                <button
                  onClick={() => setMode('new')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mode === 'new'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Plus className={`mb-3 ${mode === 'new' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                  <h3 className="font-semibold text-gray-900 mb-1">Create New Product</h3>
                  <p className="text-sm text-gray-600">Add photos & details</p>
                </button>

                <button
                  onClick={() => setMode('url')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mode === 'url'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LinkIcon className={`mb-3 ${mode === 'url' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                  <h3 className="font-semibold text-gray-900 mb-1">Analyze URL</h3>
                  <p className="text-sm text-gray-600">Paste product link</p>
                </button>
              </div>
            </div>

            {/* Optimization Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {mode === 'existing' && 'Optimize Existing Listing'}
                {mode === 'new' && 'Create New Product'}
                {mode === 'url' && 'Analyze Product URL'}
              </h2>
              
              {mode === 'existing' && (
                <OptimizationForm onSuccess={handleOptimizationSuccess} />
              )}
              
              {mode === 'new' && (
                <CreateProductForm onSuccess={handleOptimizationSuccess} />
              )}
              
              {mode === 'url' && (
                <UrlOptimizationForm onSuccess={handleOptimizationSuccess} />
              )}
            </div>

            {/* Results */}
            {optimizationResult && originalData && (
              <ResultCard original={originalData} optimized={optimizationResult} />
            )}
          </div>

          {/* Sidebar */}
          <div>
            <UsageStats userData={userData} />
          </div>
        </div>
      </main>
    </div>
  );
}
