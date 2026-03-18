'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import { trackEvent } from '@/lib/firebase/analytics';
import { useAuth } from '@/lib/hooks/useAuth';
import { Eye, EyeOff, Sparkles, ArrowRight, Zap, Store, TrendingUp } from 'lucide-react';

const features = [
  { icon: Zap, title: 'AI-Powered Optimization', desc: 'Smarter listings in seconds' },
  { icon: Store, title: '6 Platforms Supported', desc: 'Amazon, Etsy, Shopify & more' },
  { icon: TrendingUp, title: 'Boost Conversions', desc: 'Up to 300% more visibility' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (!authLoading && user) {
      if (inviteToken) router.push('/api/accept-invite?token=' + inviteToken);
      else router.push('/dashboard');
    }
  }, [user, authLoading, router, inviteToken]);

  if (authLoading || user) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const u = await signInWithEmail(email, password);
      trackEvent('login', { method: 'email', user_id: u.uid });
      if (inviteToken) router.push('/api/accept-invite?token=' + inviteToken);
      else router.push('/dashboard');
    } catch (err: any) { setError(err.message || 'Failed to sign in.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const u = await signInWithGoogle();
      trackEvent('login', { method: 'google', user_id: u.uid });
      if (inviteToken) router.push('/api/accept-invite?token=' + inviteToken);
      else router.push('/dashboard');
    } catch (err: any) { setError(err.message || 'Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">ListingOptimizer</span>
        </Link>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              {inviteToken ? 'Accept your invitation' : 'Start selling smarter today'}
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              {inviteToken ? 'Sign in to your account to join the Enterprise workspace.' : 'Join thousands of sellers who use AI to write listings that rank higher and convert better.'}
            </p>
          </div>
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-xs relative z-10">Â© 2026 ListingOptimizer AI. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">ListingOptimizer</span>
          </div>

          {inviteToken && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">You have a workspace invitation. Sign in to your account to get Enterprise access automatically.</p>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
          <p className="text-gray-500 mb-8">{inviteToken ? 'Sign in to accept your Enterprise invite' : 'Rank higher and convert better with AI'}</p>

          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required disabled={loading}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
                  placeholder="min 8 characters"
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href={inviteToken ? '/signup?invite=' + inviteToken : '/signup'} className="text-blue-600 hover:text-blue-700 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

