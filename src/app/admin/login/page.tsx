'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { trackEvent, trackAdminAction } from '@/lib/firebase/analytics';
import { Shield, Mail, Lock, AlertCircle, Sparkles, BarChart3, Users, Activity } from 'lucide-react';

// ADMIN EMAILS - Only these can access admin panel
const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update document title
  useEffect(() => {
    document.title = 'ListingOPT Admin Login';
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email is in admin list
      if (!ADMIN_EMAILS.includes(email)) {
        setError('Access denied. This email is not authorized for admin access.');
        setLoading(false);
        return;
      }

      console.log('Attempting login for:', email);

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.uid);
      
      // Track admin login
      trackEvent('admin_login', { admin_email: email, user_id: userCredential.user.uid });
      trackAdminAction('login', 'admin_panel', email);
      
      // Redirect to admin panel
      router.push('/admin');
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please contact support.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError(`Login failed: ${error.message || 'Please check your credentials and try again.'}`);
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <span className="text-white font-bold text-xl tracking-tight">LO</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Listing</span>
                  <span className="text-3xl font-bold text-blue-600">OPT</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Admin Dashboard</p>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Admin Control Center
            </h1>
            <p className="text-lg text-gray-600">
              Manage users, monitor analytics, and control your entire platform from one beautiful dashboard.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/30">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600">Track user activity, revenue, and platform performance in real-time.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">User Management</h3>
                  <p className="text-sm text-gray-600">Manage user accounts, limits, and permissions with ease.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Activity Monitoring</h3>
                  <p className="text-sm text-gray-600">Monitor all platform activities and user optimizations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-2xl mb-4 shadow-2xl shadow-purple-500/50">
              <span className="text-white font-bold text-xl tracking-tight">LO</span>
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Listing</span>
              <span className="text-2xl font-bold text-blue-600">OPT</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Admin Dashboard</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl shadow-purple-500/10">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-purple-600" size={24} />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Admin Sign In
                </h2>
              </div>
              <p className="text-gray-600 text-sm">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Access Admin Panel
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                <p className="text-purple-900 text-sm font-semibold mb-1">
                  🔒 Authorized Access Only
                </p>
                <p className="text-purple-700 text-xs">
                  This portal is restricted to authorized administrators. All access attempts are monitored and logged.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              ListingOPT Admin Panel © 2024
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
