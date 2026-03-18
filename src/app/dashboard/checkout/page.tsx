'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Spinner from '@/components/ui/Spinner';
import { Check, Lock, Shield, RefreshCw, Globe, MapPin } from 'lucide-react';

const plans = [
  {
    key: 'free' as const,
    name: 'STARTER',
    label: 'Current Plan',
    price: 0,
    billing: 'Free forever',
    credits: 9,
    features: [],
    isCurrent: true,
  },
  {
    key: 'starter' as const,
    name: 'STANDARD',
    label: '',
    price: 25,
    billing: 'Billed monthly',
    credits: 25,
    features: ['25 optimizations per month', 'All platform support', 'Advanced keyword research', 'Before/after comparisons', 'Email support'],
    isCurrent: false,
  },
  {
    key: 'professional' as const,
    name: 'PRO',
    label: 'Save $161',
    price: 49,
    billing: '$199.00 billed yearly',
    credits: 50,
    popular: true,
    features: ['50 optimizations per month', 'Bulk optimization (10 at once)', 'A+ content templates', 'Keyword rank tracking', 'Team collaboration (5 users)', 'Priority support', 'API access (5K calls/month)', 'Custom brand voice'],
    isCurrent: false,
  },
  {
    key: 'enterprise' as const,
    name: 'ENTERPRISE',
    label: '',
    price: 150,
    billing: 'Billed monthly',
    credits: 999999,
    features: ['Unlimited optimizations', 'Unlimited bulk optimization', 'White-label option', 'Dedicated account manager', 'Custom integrations', 'Unlimited team members', 'API access (50K calls/month)', '99.9% uptime SLA'],
    isCurrent: false,
  },
];

type PlanKey = 'free' | 'starter' | 'professional' | 'enterprise';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData } = useAuth();
  const [selected, setSelected] = useState<PlanKey>('professional');
  const [country, setCountry] = useState('United States');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = searchParams.get('plan') as PlanKey;
    if (p && plans.find(pl => pl.key === p)) setSelected(p);
  }, [searchParams]);

  const selectedPlan = plans.find(p => p.key === selected)!;

  const handleCheckout = async () => {
    if (!user) { router.push('/login'); return; }
    if (selectedPlan.isCurrent) return;
    setLoading(true); setError('');
    try {
      alert('Payment integration coming soon! This will redirect to Stripe checkout.');
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
    } finally { setLoading(false); }
  };

  const today = new Date();
  const startDate = new Date(today); startDate.setDate(today.getDate() + 7);
  const startStr = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout title="Checkout" subtitle="Complete your subscription">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="space-y-8">

            {/* Plan selector */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4">Personal Plan</h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 bg-white">
                {plans.map((plan) => {
                  const isSelected = selected === plan.key;
                  return (
                    <button
                      key={plan.key}
                      onClick={() => setSelected(plan.key)}
                      className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      {/* Radio */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>

                      {/* Name + badge */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{plan.name}</span>
                        {plan.label && (
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${plan.isCurrent ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-blue-600 text-white'}`}>
                            {plan.label}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          {plan.price === 0 ? '$0.00' : `$${plan.price}.00`}
                          <span className="text-xs font-normal text-gray-500"> /month</span>
                        </p>
                        <p className="text-xs text-gray-400">{plan.billing}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expanded features for selected plan */}
              {selectedPlan.features.length > 0 && (
                <div className="mt-3 px-5 py-4 bg-white border border-gray-200 rounded-xl">
                  <ul className="space-y-2">
                    {selectedPlan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Billing Address */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4">Billing Address</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Country</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                        <option>Germany</option>
                        <option>France</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Zip Code</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                      placeholder="000000"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">We are required by law to collect applicable transaction taxes for purchases made in certain tax jurisdictions.</p>
              </div>
            </section>

            {/* Payment Method placeholder */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>Secured connection — Payment powered by Stripe</span>
                </div>
                <div className="mt-4 h-12 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Card details will appear here (Stripe integration)</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — sticky summary */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Summary</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due today</span>
                  <span className="text-sm font-semibold text-gray-900">$0.00</span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Starting on {startStr} (in 7 days)</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">{selectedPlan.name} access</span>
                      <span className="text-xs text-gray-700">${selectedPlan.price}.00/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Estimated tax</span>
                      <span className="text-xs text-gray-700">$0.00/month</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-gray-900">${selectedPlan.price}.00/month</span>
                </div>
              </div>

              {error && (
                <div className="mx-5 mb-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <div className="px-5 pb-5">
                <button
                  onClick={handleCheckout}
                  disabled={loading || selectedPlan.isCurrent}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-all"
                >
                  {loading ? 'Processing...' : selectedPlan.isCurrent ? 'Current Plan' : 'Start subscription'}
                </button>

                <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                  Your subscription will begin today with a free 7-day trial. Cancel anytime by visiting the Subscriptions page in your account.
                </p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  After your trial ends, it will automatically convert to a paid subscription. By clicking "Start subscription" you agree to our Terms and authorize this recurring charge.
                </p>
              </div>

              {/* Trust row */}
              <div className="px-5 pb-4 pt-2 border-t border-gray-100 flex items-center justify-center gap-4">
                {[{ icon: Lock, label: 'Secure' }, { icon: RefreshCw, label: 'Cancel anytime' }, { icon: Shield, label: 'Money-back' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Icon size={11} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
