'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const plans = {
  starter: {
    name: 'Starter',
    price: 25,
    credits: 25,
    features: [
      '25 optimizations per month',
      'All platform support',
      'Advanced keyword research',
      'Competitor analysis',
      'Before/after comparisons',
      'Export to PDF',
      'Email support',
      'Priority processing'
    ]
  },
  professional: {
    name: 'Professional',
    price: 49,
    credits: 50,
    features: [
      '50 optimizations per month',
      'Bulk optimization (10 at once)',
      'A+ content templates',
      'Keyword rank tracking',
      'Team collaboration (5 users)',
      'Priority support',
      'API access (5K calls/month)',
      'Custom brand voice'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 150,
    credits: 999999,
    features: [
      'Unlimited optimizations',
      'Unlimited bulk optimization',
      'White-label option',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited team members',
      'API access (50K calls/month)',
      'Custom training & onboarding',
      '99.9% uptime SLA'
    ]
  }
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const plan = searchParams.get('plan') as 'starter' | 'professional' | 'enterprise';
    if (plan && plans[plan]) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Here you would integrate with Stripe or your payment processor
      // For now, we'll show a placeholder
      alert('Payment integration coming soon! This will redirect to Stripe checkout.');
      
      // Example Stripe integration:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plan: selectedPlan })
      // });
      // const { url } = await response.json();
      // window.location.href = url;
      
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  const plan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowBackIcon />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-blue-100">Upgrade to unlock more features</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Plan Selection */}
              <div>
                <h2 className="text-xl font-bold mb-4">Select Your Plan</h2>
                <div className="space-y-3">
                  {Object.entries(plans).map(([key, planData]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlan(key as any)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedPlan === key
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg">{planData.name}</h3>
                          <p className="text-sm text-gray-600">
                            {planData.credits === 999999 ? 'Unlimited' : planData.credits} credits/month
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${planData.price}</div>
                          <div className="text-sm text-gray-600">/month</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">{plan.name} Plan</span>
                    <span className="font-bold">${plan.price}/mo</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${plan.price}/month</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Billed monthly. Cancel anytime.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold mb-3">What's included:</h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-0.5" fontSize="small" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Subscribe to ${plan.name} - $${plan.price}/mo`}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                  Your subscription will automatically renew each month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircleIcon fontSize="small" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon fontSize="small" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon fontSize="small" />
              <span className="text-sm">Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
