'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import { trackEvent } from '@/lib/firebase/analytics';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signInWithEmail(email, password);
      trackEvent('login', { method: 'email', user_id: user.uid });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      trackEvent('error_occurred', { error_type: 'login_failed', error_message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await signInWithGoogle();
      trackEvent('login', { method: 'google', user_id: user.uid });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      trackEvent('error_occurred', { error_type: 'login_failed', error_message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {error && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : <span className="text-sm sm:text-base">Sign In</span>}
        </Button>
      </form>

      <div className="mt-3 sm:mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-3 sm:mt-4"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="text-sm sm:text-base">Sign in with Google</span>
        </Button>
      </div>
    </div>
  );
}
