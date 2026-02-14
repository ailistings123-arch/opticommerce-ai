'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Check, ArrowRight, Zap, Shield, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="text-blue-600" size={20} />
              <span className="text-base sm:text-xl font-semibold text-gray-900 truncate">ListingOptimizer</span>
            </div>
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <button className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-1.5 sm:py-2 transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
              AI-Powered Optimization
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Optimize Your Product Listings with AI
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
              Transform your e-commerce listings for Amazon, Shopify, Etsy, and eBay. 
              Boost visibility, increase conversions, and save hours of work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 text-sm sm:text-base font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                  See How It Works
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">10K+</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">500K+</div>
              <div className="text-xs sm:text-sm text-gray-600">Optimizations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">94%</div>
              <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">4.9/5</div>
              <div className="text-xs sm:text-sm text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Everything you need to succeed
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Powerful features to help you create perfect product listings
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Leverages Google Gemini 1.5 Flash for intelligent content generation and optimization
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">SEO Optimized</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get detailed SEO scores and actionable improvements for each listing
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="text-purple-600" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Multi-Platform</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Supports Amazon, Shopify, Etsy, and eBay with platform-specific rules
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Secure & Fast</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Firebase-powered authentication and real-time optimization
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Users className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Work together with your team on product optimization
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <ArrowRight className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Simple workflow that fits into your existing process
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              How it works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center px-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Enter Product Details</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Add your product title, description, or paste a URL from any platform
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI Analyzes & Optimizes</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our AI analyzes your listing and generates optimized content with SEO scoring
              </p>
            </div>

            <div className="text-center px-4 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Copy & Publish</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Copy the optimized content and publish to your platform for better results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Simple, transparent pricing
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-sm sm:text-base text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">3 optimizations/month</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">All platforms</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">SEO scoring</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">Basic support</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full px-4 py-2.5 sm:py-3 bg-white text-gray-700 text-sm sm:text-base font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="p-6 sm:p-8 bg-blue-600 text-white rounded-2xl shadow-xl sm:scale-105">
              <div className="mb-4 sm:mb-6">
                <div className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-blue-500 rounded-full text-xs font-medium mb-2 sm:mb-3">
                  MOST POPULAR
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold">$19</span>
                  <span className="text-sm sm:text-base text-blue-100">/month</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base">20 optimizations/month</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base">Priority support</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base">History export</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base">Advanced analytics</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full px-4 py-2.5 sm:py-3 bg-white text-blue-600 text-sm sm:text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl sm:col-span-2 lg:col-span-1">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">$49</span>
                  <span className="text-sm sm:text-base text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">75 optimizations/month</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">Bulk upload</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">API access</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm sm:text-base text-gray-600">Dedicated support</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full px-4 py-2.5 sm:py-3 bg-white text-gray-700 text-sm sm:text-base font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Ready to optimize your listings?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join thousands of sellers who are already boosting their sales with AI
          </p>
          <Link href="/signup">
            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              Start Free Trial
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="text-blue-500" size={20} />
                <span className="text-base sm:text-lg font-semibold text-white">ListingOptimizer</span>
              </div>
              <p className="text-xs sm:text-sm">
                AI-powered product listing optimization for e-commerce success
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2026 ListingOptimizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
