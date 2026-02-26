'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import OptimizationModeSelector, { OptimizationMode } from '@/components/dashboard/OptimizationModeSelector';
import Mode1OptimizeExisting, { Mode1Data } from '@/components/dashboard/modes/Mode1OptimizeExisting';
import Mode2CreateNew, { Mode2Data } from '@/components/dashboard/modes/Mode2CreateNew';
import Mode3AnalyzeUrl, { Mode3Data } from '@/components/dashboard/modes/Mode3AnalyzeUrl';
import ResultCard from '@/components/dashboard/ResultCard';
import SimpleResultCard from '@/components/dashboard/SimpleResultCard';
import UsageStats from '@/components/dashboard/UsageStats';
import Spinner from '@/components/ui/Spinner';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Sparkles, LogOut, History, Settings, AlertCircle, AlertTriangle, FileEdit, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading, refreshUserData } = useAuth();
  const [mode, setMode] = useState<OptimizationMode>('optimize-existing');
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [showSetupNotice, setShowSetupNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0, isVisible: false });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; isEtsyError: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    isEtsyError: false,
  });

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

  const handleMode1Submit = async (data: Mode1Data) => {
    // Check if user has credits available
    if (userData && userData.usageCount >= userData.usageLimit) {
      setErrorModal({
        isOpen: true,
        title: 'No Credits Remaining',
        message: `You've used all ${userData.usageLimit} credits. Please upgrade your plan to continue optimizing.`,
        isEtsyError: false,
      });
      return;
    }

    setSubmitting(true);
    setProgress({ stage: 'Analyzing your product...', percent: 10, isVisible: true });
    
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      
      setProgress({ stage: 'Researching keywords...', percent: 30, isVisible: true });
      
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: 'optimize-existing',
          title: data.currentTitle,
          description: data.currentDescription,
          platform: data.platform,
          keywords: data.currentKeywords,
          additionalData: data,
        }),
      });

      setProgress({ stage: 'Generating optimized content...', percent: 70, isVisible: true });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Optimization failed');
      }

      const result = await response.json();
      
      setProgress({ stage: 'Finalizing results...', percent: 95, isVisible: true });
      console.log('Mode 1 API response:', result);
      
      if (result.success && result.data) {
        setOptimizationResult(result.data.optimized);
        setOriginalData({ title: data.currentTitle, description: data.currentDescription });
        setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
        
        setTimeout(() => {
          setProgress({ stage: '', percent: 0, isVisible: false });
        }, 500);
      } else {
        throw new Error('Invalid response format');
      }
      await refreshUserData();
    } catch (error: any) {
      console.error('Optimization error:', error);
      setProgress({ stage: '', percent: 0, isVisible: false });
      alert(error.message || 'Failed to optimize listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMode2Submit = async (data: Mode2Data) => {
    // Check if user has credits available
    if (userData && userData.usageCount >= userData.usageLimit) {
      setErrorModal({
        isOpen: true,
        title: 'No Credits Remaining',
        message: `You've used all ${userData.usageLimit} credits. Please upgrade your plan to continue optimizing.`,
        isEtsyError: false,
      });
      return;
    }

    setSubmitting(true);
    setProgress({ stage: 'Analyzing product details...', percent: 15, isVisible: true });
    
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      
      setProgress({ stage: 'Generating product listing...', percent: 40, isVisible: true });
      
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: 'create-new',
          platform: data.platform,
          productData: data,
        }),
      });

      setProgress({ stage: 'Optimizing content...', percent: 75, isVisible: true });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Creation failed');
      }

      const result = await response.json();
      
      setProgress({ stage: 'Finalizing...', percent: 95, isVisible: true });
      console.log('Mode 2 API response:', result);
      
      if (result.success && result.data) {
        setOptimizationResult(result.data.optimized);
        setOriginalData(null);
        setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
        
        setTimeout(() => {
          setProgress({ stage: '', percent: 0, isVisible: false });
        }, 500);
      } else {
        throw new Error('Invalid response format');
      }
      await refreshUserData();
    } catch (error: any) {
      console.error('Creation error:', error);
      setProgress({ stage: '', percent: 0, isVisible: false });
      alert(error.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMode3Submit = async (data: Mode3Data) => {
    // Check if user has credits available
    if (userData && userData.usageCount >= userData.usageLimit) {
      setErrorModal({
        isOpen: true,
        title: 'No Credits Remaining',
        message: `You've used all ${userData.usageLimit} credits. Please upgrade your plan to continue optimizing.`,
        isEtsyError: false,
      });
      return;
    }

    setSubmitting(true);
    setProgress({ stage: 'Analyzing URL...', percent: 20, isVisible: true });
    
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      
      setProgress({ stage: 'Extracting product data...', percent: 45, isVisible: true });
      
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      setProgress({ stage: 'Optimizing listing...', percent: 75, isVisible: true });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const result = await response.json();
      
      setProgress({ stage: 'Finalizing analysis...', percent: 95, isVisible: true });
      console.log('Mode 3 API response:', result);
      
      if (result.success && result.data) {
        setOptimizationResult(result.data.optimized || result.data.analysis);
        setOriginalData(result.data.scrapedData);
        setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
        
        setTimeout(() => {
          setProgress({ stage: '', percent: 0, isVisible: false });
        }, 500);
      } else {
        throw new Error('Invalid response format');
      }
      await refreshUserData();
    } catch (error: any) {
      console.error('Analysis error:', error);
      setProgress({ stage: '', percent: 0, isVisible: false });
      
      // Check if it's an Etsy-specific error
      const isEtsyError = error.message?.includes('anti-bot') || error.message?.includes('ALTERNATIVE OPTIONS');
      
      setErrorModal({
        isOpen: true,
        title: isEtsyError ? 'Etsy Anti-Bot Protection' : 'Analysis Failed',
        message: error.message || 'Failed to analyze URL',
        isEtsyError,
      });
    } finally {
      setSubmitting(false);
    }
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
      {showSetupNotice && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
              <div className="text-xs sm:text-sm min-w-0">
                <span className="font-semibold text-yellow-900 block sm:inline">Setup Required: </span>
                <span className="text-yellow-800 block sm:inline">
                  Firestore database is not configured. 
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1 font-medium hover:text-yellow-900 break-words"
                  >
                    Enable Firestore now
                  </a>
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSetupNotice(false)}
              className="text-yellow-600 hover:text-yellow-800 text-xl leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="text-blue-600" size={20} />
              <span className="text-base sm:text-xl font-semibold text-gray-900 truncate">ListingOptimizer</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Link href="/dashboard/history">
                <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 sm:gap-2">
                  <History size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">History</span>
                </button>
              </Link>
              <Link href="/dashboard/settings">
                <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 sm:gap-2">
                  <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </Link>
              <button 
                onClick={handleSignOut}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 sm:gap-2"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back, {userData.displayName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Optimize your product listings with AI-powered suggestions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6">
              <OptimizationModeSelector
                selectedMode={mode}
                onModeChange={(newMode) => {
                  setMode(newMode);
                  setOptimizationResult(null);
                  setOriginalData(null);
                }}
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                {mode === 'optimize-existing' && 'Optimize Existing Listing'}
                {mode === 'create-new' && 'Create New Product'}
                {mode === 'analyze-url' && 'Analyze Product URL'}
              </h2>
              
              {mode === 'optimize-existing' && (
                <Mode1OptimizeExisting onSubmit={handleMode1Submit} loading={submitting} />
              )}
              
              {mode === 'create-new' && (
                <Mode2CreateNew onSubmit={handleMode2Submit} loading={submitting} />
              )}
              
              {mode === 'analyze-url' && (
                <Mode3AnalyzeUrl onSubmit={handleMode3Submit} loading={submitting} />
              )}
            </div>

            {optimizationResult && (
              <>
                {mode === 'create-new' ? (
                  <SimpleResultCard optimized={optimizationResult} />
                ) : mode === 'analyze-url' ? (
                  originalData ? (
                    <ResultCard original={originalData} optimized={optimizationResult} />
                  ) : (
                    <SimpleResultCard optimized={optimizationResult} />
                  )
                ) : (
                  originalData && <ResultCard original={originalData} optimized={optimizationResult} />
                )}
              </>
            )}
          </div>

          <div>
            <UsageStats userData={userData} />
          </div>
        </div>
      </main>
      
      <ProgressIndicator 
        stage={progress.stage}
        percent={progress.percent}
        isVisible={progress.isVisible}
      />

      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
      >
        <div className="space-y-4">
          {errorModal.isEtsyError ? (
            <>
              <div className="flex items-center justify-center">
                <div className="bg-yellow-100 p-4 rounded-full">
                  <AlertTriangle className="text-yellow-600" size={48} />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-700 text-sm mb-4">
                  Etsy actively blocks automated scraping to protect their sellers. We respect their policies.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={20} />
                  Alternative Options:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <PlusCircle className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">1. Create New Product Mode</p>
                      <p className="text-xs text-gray-600">Manually copy/paste your product details for AI optimization</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <FileEdit className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">2. Optimize Existing Mode</p>
                      <p className="text-xs text-gray-600">Copy your current listing text and get improvements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Sparkles className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">3. Direct Copy-Paste</p>
                      <p className="text-xs text-gray-600">Copy title and description from Etsy, paste directly</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-green-800 text-center">
                  ✨ You'll still get full AI optimization with any of these methods!
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => {
                    setErrorModal({ ...errorModal, isOpen: false });
                    setMode('create-new');
                  }}
                >
                  Switch to Create New Product
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setErrorModal({ ...errorModal, isOpen: false });
                    setMode('optimize-existing');
                  }}
                >
                  Switch to Optimize Existing
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="text-red-600" size={48} />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {errorModal.message}
                </p>
              </div>

              {errorModal.title === 'No Credits Remaining' ? (
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setErrorModal({ ...errorModal, isOpen: false });
                      router.push('/dashboard/checkout?plan=starter');
                    }}
                  >
                    Upgrade to Starter - $25/mo
                  </Button>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setErrorModal({ ...errorModal, isOpen: false });
                      router.push('/dashboard/checkout?plan=professional');
                    }}
                  >
                    Upgrade to Professional - $49/mo
                  </Button>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      setErrorModal({ ...errorModal, isOpen: false });
                      router.push('/dashboard/checkout?plan=enterprise');
                    }}
                  >
                    Upgrade to Enterprise - $150/mo
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                >
                  Close
                </Button>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
