import Link from 'next/link';
import BoltIcon from '@mui/icons-material/Bolt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Stop Losing Sales to Inferior Competitors
        </h2>
        <p className="text-2xl text-blue-100 mb-4">
          Your products deserve to be seen. Your listings deserve to convert. Your business deserves to grow.
        </p>
        <p className="text-xl text-white mb-10">
          Join 12,000+ sellers who stopped wasting hours on manual optimization and started using AI to dominate their marketplace.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-10 text-white">
          <div className="flex items-center gap-2">
            <BoltIcon className="text-yellow-300" sx={{ fontSize: 24 }} />
            <span className="text-lg font-semibold">2-minute setup</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="text-green-300" sx={{ fontSize: 24 }} />
            <span className="text-lg font-semibold">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CardGiftcardIcon className="text-pink-300" sx={{ fontSize: 24 }} />
            <span className="text-lg font-semibold">10 free optimizations</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="text-blue-300" sx={{ fontSize: 24 }} />
            <span className="text-lg font-semibold">Cancel anytime</span>
          </div>
        </div>

        <Link href="/signup">
          <button className="px-12 py-5 bg-white text-blue-600 text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center gap-3">
            Start Optimizing Free - No Credit Card Required
          </button>
        </Link>

        <p className="text-blue-100 mt-8 text-lg">
          Join Sarah, Mike, Emma, and 11,997 other sellers who've transformed their listings with ListingOptimizer AI.
        </p>
      </div>
    </section>
  );
}
