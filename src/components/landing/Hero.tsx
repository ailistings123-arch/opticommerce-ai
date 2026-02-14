'use client';

import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Hero() {
  return (
    <section className="pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Transform Your Product Listings into{' '}
            <span className="text-blue-600">Sales Machines</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2">
            AI-powered optimization that turns mediocre listings into top-ranking, high-converting product pages. 
            Boost your visibility by 300%, increase conversions by 68%, and dominate your marketplace—all in under 2 minutes.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 px-2">
            Join 12,000+ e-commerce sellers who've increased their revenue by an average of{' '}
            <span className="font-semibold text-blue-600">$4,200/month</span> using ListingOptimizer AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-2">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                <ArrowForwardIcon sx={{ fontSize: { xs: 20, sm: 24 } }} /> Start Optimizing Free
              </button>
            </Link>
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 text-base sm:text-lg font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
              <PlayArrowIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Watch 2-Min Demo
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 px-2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="text-yellow-400" sx={{ fontSize: { xs: 16, sm: 20 } }} />
                ))}
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-medium">4.9/5 from 2,847 reviews</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="text-green-600" sx={{ fontSize: { xs: 14, sm: 16 } }} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="text-green-600" sx={{ fontSize: { xs: 14, sm: 16 } }} />
                <span>10 free optimizations</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="text-green-600" sx={{ fontSize: { xs: 14, sm: 16 } }} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
