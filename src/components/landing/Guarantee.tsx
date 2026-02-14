import Link from 'next/link';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Guarantee() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-green-400 p-10">
          <div className="text-center mb-8">
            <SecurityIcon className="text-green-600 mx-auto mb-4" sx={{ fontSize: 64 }} />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Try It Risk-Free for 30 Days
            </h2>
            <p className="text-xl text-gray-600">Our Iron-Clad Promise:</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-8">
            <p className="text-lg text-gray-700 mb-6 text-center">
              We're so confident ListingOptimizer AI will increase your sales that we offer a{' '}
              <span className="font-bold text-green-600">30-day, no-questions-asked money-back guarantee.</span>
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-green-600 flex-shrink-0" sx={{ fontSize: 24, marginTop: '4px' }} />
                <span className="text-gray-700">If you don't see improved SEO scores</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-green-600 flex-shrink-0" sx={{ fontSize: 24, marginTop: '4px' }} />
                <span className="text-gray-700">If you don't rank higher for your keywords</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-green-600 flex-shrink-0" sx={{ fontSize: 24, marginTop: '4px' }} />
                <span className="text-gray-700">If you don't get better conversion rates</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-green-600 flex-shrink-0" sx={{ fontSize: 24, marginTop: '4px' }} />
                <span className="text-gray-700">If you're not completely satisfied for ANY reason</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-2">
              Just email us within 30 days and we'll refund <span className="font-bold">100% of your money</span> immediately.
            </p>
            <p className="text-gray-600">Plus, you keep all the optimizations you created.</p>
          </div>

          <div className="bg-blue-600 text-white rounded-xl p-6 text-center mb-8">
            <p className="text-xl font-bold">We take all the risk so you don't have to.</p>
          </div>

          <div className="text-center">
            <Link href="/signup">
              <button className="px-10 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
                Start Your Free Trial
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
