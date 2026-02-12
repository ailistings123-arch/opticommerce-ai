'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={24} />
            <span className="text-xl font-semibold text-gray-900">OptiCommerce AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-200">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
