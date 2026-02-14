'use client';

import Link from 'next/link';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <AutoAwesomeIcon className="text-blue-600" sx={{ fontSize: { xs: 20, sm: 24 } }} />
            <span className="text-base sm:text-xl font-semibold text-gray-900 whitespace-nowrap">ListingOptimizer AI</span>
          </div>
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <button className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-2 sm:px-3 py-1.5 sm:py-2">
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200 whitespace-nowrap">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
