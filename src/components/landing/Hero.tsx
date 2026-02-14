'use client';

import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Hero() {
  return (
    <section className="pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Transform Your Product Listings into{' '}
            <span className="text-blue-600">Sales Machines</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 leading-relaxed">
            AI-powered optimization that turns mediocre listings into top-ranking, high-converting product pages. 
            Boost visibility by 300%, increase conversions by 68%—all in under 2 minutes.
          </p>
          <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-5">
            Join 12,000+ sellers who increased revenue by{' '}
            <span className="font-semibold text-blue-600">$4,200/month</span> using ListingOptimizer AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-4 sm:mb-5">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-1.5">
                <ArrowForwardIcon sx={{ fontSize: 16 }} /> Start Optimizing Free
              </button>
            </Link>
            <button className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-gray-700 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-1.5">
              <PlayArrowIcon sx={{ fontSize: 16 }} />
              Watch Demo
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="text-yellow-400" sx={{ fontSize: 12 }} />
                ))}
              </div>
              <span className="text-xs text-gray-700">4.9/5 from 2,847 reviews</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-0.5">
                <CheckCircleIcon className="text-green-600" sx={{ fontSize: 12 }} />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-0.5">
                <CheckCircleIcon className="text-green-600" sx={{ fontSize: 12 }} />
                <span>10 free optimizations</span>
              </div>
              <div className="flex items-center gap-0.5">
                <CheckCircleIcon className="text-green-600" sx={{ fontSize: 12 }} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
