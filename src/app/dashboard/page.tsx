'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { trackEvent, trackOptimization, trackUrlAnalysis, trackPlatformSelection, trackModeSelection } from '@/lib/firebase/analytics';
import { OptimizationMode } from '@/components/dashboard/DashboardSidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Mode1OptimizeExisting, { Mode1Data } from '@/components/dashboard/modes/Mode1OptimizeExisting';
import Mode2CreateNew, { Mode2Data } from '@/components/dashboard/modes/Mode2CreateNew';
import Mode3AnalyzeUrl, { Mode3Data } from '@/components/dashboard/modes/Mode3AnalyzeUrl';
import ResultCard from '@/components/dashboard/ResultCard';
import SimpleResultCard from '@/components/dashboard/SimpleResultCard';
import Spinner from '@/components/ui/Spinner';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Sparkles, AlertCircle, AlertTriangle, FileEdit, PlusCircle, Users } from 'lucide-react';
import OnboardingModal from '@/components/dashboard/OnboardingModal';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading, refreshUserData } = useAuth();
  const [showWorkspaceBanner, setShowWorkspaceBanner] = useState(false);
  const [mode, setMode] = useState<OptimizationMode>('optimize-existing');
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [showSetupNotice, setShowSetupNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0, isVisible: false });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; isEtsyError: boolean }>({
    isOpen: false, title: '', message: '', isEtsyError: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (searchParams.get('workspace') === 'joined') {
      setShowWorkspaceBanner(true);
      refreshUserData();
    }
  }, [searchParams]);

  useEffect(() => {
    if (userData && userData.usageCount === 0 && !userData.createdAt) setShowSetupNotice(true);
  }, [userData]);

  const handleMode1Submit = async (data: Mode1Data) => {
    if (userData && userData.usageCount >= userData.usageLimit) {
      setErrorModal({ isOpen: true, title: 'No Credits Remaining', message: `You've used all ${userData.usageLimit} credits. Please upgrade your plan to continue optimizing.`, isEtsyError: false });
      return;
    }
    setOptimizationResult(null); setOriginalData(null); setSubmitting(true);
    setProgress({ stage: 'Analyzing your product...', percent: 10, isVisible: true });
    trackOptimization('started', data.platform, 'optimize-existing', user?.uid);
    trackPlatformSelection(data.platform, user?.uid);
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      setProgress({ stage: 'Researching keywords...', percent: 30, isVisible: true });
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ mode: 'optimize-existing', title: data.currentTitle, description: data.currentDescription, platform: data.platform, keywords: data.currentKeywords, additionalData: data }),
      });
      setProgress({ stage: 'Generating optimized content...', percent: 70, isVisible: true });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Optimization failed'); }
      const result = await response.json();
      setProgress({ stage: 'Finalizing results...', percent: 95, isVisible: true });
      if (result.success && result.data) {
        setOptimizationResult(result.data.optimized);
        setOriginalData({ title: data.currentTitle, description: data.currentDescription });
        setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
        trackOptimization('completed', data.platform, 'optimize-existing', user?.uid);
        setTimeout(() => setProgress({ stage: '', percent: 0, isVisible: false }), 500);
      } else throw new Error('Invalid response format');
      await refreshUserData();
    } catch (error: any) {
      setProgress({ stage: '', percent: 0, isVisible: false });
      trackOptimization('failed', data.platform, 'optimize-existing', user?.uid, error.message);
      alert(error.message || 'Failed to optimize listing');
    } finally { setSubmitting(false); }
  };

  const handleMode2Submit = async (data: Mode2Data) => {
    if (userData && userData.usageCount >= userData.usageLimit) {
      setErrorModal({ isOpen: true, title: 'No Credits Remaining', message: `You've used all ${userData.usageLimit} credits. Please upgrade your plan to continue optimizing.`, isEtsyError: false });
      return;
    }
    setOptimizationResult(null); setOriginalData(null); setSubmitting(true);
    setProgress({ stage: 'Analyzing product details...', percent: 15, isVisible: true });
    trackOptimization('started', data.platform, 'create-new', user?.uid);
    trackPlatformSelection(data.platform, user?.uid);
    trackEvent('listing_generated', { platform: data.platform, user_id: user?.uid });
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      setProgress({ stage: 'Generating product listing...', percent: 40, isVisible: true });
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ mode: 'create-new', platform: data.platform, productData: data }),
      });
      setProgress({ stage: 'Optimizing content...', percent: 75, isVisible: true });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Creation failed'); }
      const result = await response.json();
      setProgress({ stage: 'Finalizing...', percent: 95, isVisible: true });
      if (result.success && result.data) {
        setOptimizationResult(result.data.optimized);
        setOriginalData(null);
        setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
        trackOptimization('completed', data.platform, 'create-new', user?.uid);
        setTimeout(() => setProgress({ stage: '', percent: 0, isVisible: false }), 500);
      } else throw new Error('Invalid response format');
      await refreshUserData();
    } catch (error: any) {
      setProgress({ stage: '', percent: 0, isVisible: false });
      trackOptimization('failed', data.platform, 'create-new', user?.uid, error.message);
      alert(error.message || 'Failed to create listing');
    } finally { setSubmitting(false); }
  };

  const handleMode3Submit = async (data: Mode3Data) => {
    if (userData && userData.usageCount >= userData.usageLimit) {
      setErrorModal({ isOpen: true, title: 'No Credits Remaining', message: `You've used all ${userData.usageLimit} credits. Please upgrade your plan to continue optimizing.`, isEtsyError: false });
      return;
    }
    setOptimizationResult(null); setOriginalData(null); setSubmitting(true);
    setProgress({ stage: 'Analyzing URL...', percent: 20, isVisible: true });
    trackUrlAnalysis('started', data.url, user?.uid);
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      setProgress({ stage: 'Extracting product data...', percent: 45, isVisible: true });
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        body: JSON.stringify(data),
      });
      setProgress({ stage: 'Optimizing listing...', percent: 75, isVisible: true });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Analysis failed'); }
      const result = await response.json();
      setProgress({ stage: 'Finalizing analysis...', percent: 95, isVisible: true });
      if (result.success && result.data) {
        setOptimizationResult(result.data.optimized || result.data.analysis);
        setOriginalData(result.data.scrapedData);
        setProgress({ stage: 'Complete!', percent: 100, isVisible: true });
        trackUrlAnalysis('completed', data.url, user?.uid);
        trackOptimization('completed', 'url-analysis', 'analyze-url', user?.uid);
        setTimeout(() => setProgress({ stage: '', percent: 0, isVisible: false }), 500);
      } else throw new Error('Invalid response format');
      await refreshUserData();
    } catch (error: any) {
      setProgress({ stage: '', percent: 0, isVisible: false });
      trackOptimization('failed', 'url-analysis', 'analyze-url', user?.uid, error.message);
      const isEtsyError = error.message?.includes('anti-bot') || error.message?.includes('ALTERNATIVE OPTIONS');
      setErrorModal({ isOpen: true, title: isEtsyError ? 'Etsy Anti-Bot Protection' : 'Analysis Failed', message: error.message || 'Failed to analyze URL', isEtsyError });
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Spinner size="lg" /></div>;
  }
  if (!user || !userData) return null;

  return (
    <DashboardLayout
      title={`${userData.displayName}'s Dashboard`}
      subtitle="AI-powered listing optimization across 6 marketplaces"
      mode={mode}
      onModeChange={(m) => { setMode(m); setOptimizationResult(null); setOriginalData(null); trackModeSelection(m, user?.uid); }}
    >
      <OnboardingModal />

      {/* Workspace welcome banner */}
      {showWorkspaceBanner && (
        <div className="mb-5 bg-blue-600 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Welcome to your Enterprise workspace!</p>
              <p className="text-blue-100 text-xs mt-0.5">
                You now have Enterprise access â€” unlimited optimizations, all platforms, and full feature access.
                {(userData as any).workspaceRole && <span className="ml-1 capitalize">Your role: <strong>{(userData as any).workspaceRole}</strong></span>}
              </p>
            </div>
          </div>
          <button onClick={() => setShowWorkspaceBanner(false)} className="text-white/60 hover:text-white text-xl leading-none flex-shrink-0">Ã—</button>
        </div>
      )}

      {showSetupNotice && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={16} />
            <span className="text-xs text-yellow-800">
              <span className="font-semibold">Setup Required: </span>
              Firestore not configured.{' '}
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Enable Firestore now</a>
            </span>
          </div>
          <button onClick={() => setShowSetupNotice(false)} className="text-yellow-600 hover:text-yellow-800 text-lg leading-none flex-shrink-0">ï¿½</button>
        </div>
      )}

      <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {mode === 'optimize-existing' && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-1">Optimize Existing Listing</h2>
              <p className="text-sm text-gray-600">Paste your current title &amp; description ï¿½ our AI rewrites it with better keywords, structure, and SEO to boost visibility and conversions.</p>
            </div>
          )}
          {mode === 'create-new' && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-1">Create New Product Listing</h2>
              <p className="text-sm text-gray-600">Describe your product and choose a platform. We'll generate a complete, conversion-optimized listing from scratch ï¿½ ready to publish.</p>
            </div>
          )}
          {mode === 'analyze-url' && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-1">Analyze Product URL</h2>
              <p className="text-sm text-gray-600">Paste any product URL from Amazon, Walmart, or eBay. We'll extract the listing, analyze it, and generate an improved version instantly.</p>
            </div>
          )}
          {mode === 'optimize-existing' && <Mode1OptimizeExisting onSubmit={handleMode1Submit} loading={submitting} />}
          {mode === 'create-new' && <Mode2CreateNew onSubmit={handleMode2Submit} loading={submitting} />}
          {mode === 'analyze-url' && <Mode3AnalyzeUrl onSubmit={handleMode3Submit} loading={submitting} />}
        </div>
        {optimizationResult && (
          mode === 'create-new' ? <SimpleResultCard optimized={optimizationResult} /> :
          mode === 'analyze-url' ? (originalData ? <ResultCard original={originalData} optimized={optimizationResult} /> : <SimpleResultCard optimized={optimizationResult} />) :
          (originalData && <ResultCard original={originalData} optimized={optimizationResult} />)
        )}
      </div>

      {/* Right panel */}
      <div className="hidden xl:flex flex-col gap-5 w-64 flex-shrink-0">

        {/* Usage overview */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Usage</p>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold text-gray-900">{userData?.usageCount ?? 0}</span>
              <span className="text-xs text-gray-400">{userData?.usageLimit ?? 0} total</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((userData?.usageCount ?? 0) / (userData?.usageLimit ?? 1)) * 100)}%`,
                  background: ((userData?.usageCount ?? 0) / (userData?.usageLimit ?? 1)) > 0.8 ? '#ef4444' : '#3b82f6'
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {Math.max(0, (userData?.usageLimit ?? 0) - (userData?.usageCount ?? 0))} optimizations left
            </p>
          </div>
          <div className="pt-1 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Current plan</span>
              <span className="text-xs font-semibold text-blue-600 capitalize">{userData?.tier ?? 'Free'}</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="space-y-2">
            <button onClick={() => { setMode('optimize-existing'); setOptimizationResult(null); }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileEdit size={13} className="text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">Optimize Listing</span>
            </button>
            <button onClick={() => { setMode('create-new'); setOptimizationResult(null); }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <PlusCircle size={13} className="text-green-600" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-green-700 font-medium">Create New</span>
            </button>
            <button onClick={() => { setMode('analyze-url'); setOptimizationResult(null); }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors group flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-purple-600" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium">Analyze URL</span>
            </button>
          </div>
        </div>

        {/* Upgrade plans */}
        {(userData?.tier === 'free' || !userData?.tier) && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 pt-5 pb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Upgrade Plan</p>
            </div>

            <div className="px-3 pb-3 space-y-1.5">
              {/* Standard */}
              <div
                onClick={() => router.push('/dashboard/checkout?plan=starter')}
                className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">Standard</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">25 opts ï¿½ All platforms</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">$25</p>
                  <p className="text-[10px] text-gray-400">/month</p>
                </div>
              </div>

              {/* Pro */}
              <div
                onClick={() => router.push('/dashboard/checkout?plan=professional')}
                className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer bg-blue-600 group relative"
              >
                <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-200 uppercase tracking-wide">Popular</span>
                <div>
                  <p className="text-xs font-semibold text-white">Pro</p>
                  <p className="text-[11px] text-blue-200 mt-0.5">50 opts ï¿½ Bulk ï¿½ API ï¿½ Team</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">$49</p>
                  <p className="text-[10px] text-blue-300">/month</p>
                </div>
              </div>

              {/* Enterprise */}
              <div
                onClick={() => router.push('/dashboard/checkout?plan=enterprise')}
                className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">Enterprise</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Unlimited ï¿½ White-label</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">$150</p>
                  <p className="text-[10px] text-gray-400">/month</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-50 px-5 py-3">
              <button
                onClick={() => router.push('/dashboard/checkout')}
                className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium text-center transition-colors"
              >
                See all plans ?
              </button>
            </div>
          </div>
        )}

      </div>

      </div>{/* end flex row */}

      <ProgressIndicator stage={progress.stage} percent={progress.percent} isVisible={progress.isVisible} />

      <Modal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} title={errorModal.title}>
        <div className="space-y-4">
          {errorModal.isEtsyError ? (
            <>
              <div className="flex justify-center"><div className="bg-yellow-100 p-4 rounded-full"><AlertTriangle className="text-yellow-600" size={40} /></div></div>
              <p className="text-gray-700 text-sm text-center">Etsy actively blocks automated scraping. We respect their policies.</p>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><Sparkles size={14} className="text-blue-600" />Alternative Options:</p>
                {[
                  { icon: PlusCircle, t: '1. Create New Product Mode', d: 'Manually copy/paste your product details' },
                  { icon: FileEdit, t: '2. Optimize Existing Mode', d: 'Copy your current listing text and get improvements' },
                  { icon: Sparkles, t: '3. Direct Copy-Paste', d: 'Copy title and description from Etsy, paste directly' },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-lg border border-blue-100"><Icon className="text-blue-600" size={16} /></div>
                    <div><p className="font-medium text-gray-900 text-xs">{t}</p><p className="text-[11px] text-gray-500">{d}</p></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => { setErrorModal({ ...errorModal, isOpen: false }); setMode('create-new'); }}>Switch to Create New Product</Button>
                <Button variant="outline" className="w-full" onClick={() => { setErrorModal({ ...errorModal, isOpen: false }); setMode('optimize-existing'); }}>Switch to Optimize Existing</Button>
                <Button variant="outline" className="w-full" onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>Close</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center"><div className="bg-red-100 p-4 rounded-full"><AlertCircle className="text-red-600" size={40} /></div></div>
              <p className="text-gray-700 text-sm text-center whitespace-pre-wrap">{errorModal.message}</p>
              {errorModal.title === 'No Credits Remaining' ? (
                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setErrorModal({ ...errorModal, isOpen: false }); router.push('/dashboard/checkout?plan=starter'); }}>Upgrade to Starter ï¿½ $25/mo</Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setErrorModal({ ...errorModal, isOpen: false }); router.push('/dashboard/checkout?plan=professional'); }}>Upgrade to Professional ï¿½ $49/mo</Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => { setErrorModal({ ...errorModal, isOpen: false }); router.push('/dashboard/checkout?plan=enterprise'); }}>Upgrade to Enterprise ï¿½ $150/mo</Button>
                  <Button variant="outline" className="w-full" onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>Close</Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>Close</Button>
              )}
            </>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

