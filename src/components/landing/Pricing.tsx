import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const plans = [
  {
    name: "FREE",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out",
    features: [
      "10 optimizations/month",
      "Basic SEO scores",
      "Standard templates",
      "All 6 platforms",
      "Copy/paste exports",
      "Community support"
    ],
    cta: "Start Free",
    highlighted: false,
    link: "/signup"
  },
  {
    name: "STARTER",
    price: "$19",
    period: "/month",
    description: "For growing sellers",
    badge: "Most Popular",
    features: [
      "Everything in Free, plus:",
      "50 optimizations/month",
      "Advanced keyword research",
      "Competitor analysis",
      "Before/after comparisons",
      "Export to PDF",
      "Email support",
      "Priority processing"
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: true,
    link: "/signup"
  },
  {
    name: "PROFESSIONAL",
    price: "$49",
    period: "/month",
    description: "For serious sellers",
    features: [
      "Everything in Starter, plus:",
      "200 optimizations/month",
      "Bulk optimization (10 at once)",
      "A+ content templates",
      "Keyword rank tracking",
      "Team collaboration (5 users)",
      "Priority support",
      "API access (5K calls/month)",
      "Custom brand voice"
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: false,
    link: "/signup"
  },
  {
    name: "ENTERPRISE",
    price: "$149",
    period: "/month",
    description: "For agencies & brands",
    features: [
      "Everything in Professional, plus:",
      "Unlimited optimizations",
      "Unlimited bulk optimization",
      "White-label option",
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited team members",
      "API access (50K calls/month)",
      "Custom training & onboarding",
      "99.9% uptime SLA"
    ],
    cta: "Contact Sales",
    highlighted: false,
    link: "/signup"
  }
];

const addOns = [
  { name: "Advanced Keyword Research", price: "$9/month", description: "Real-time search volumes, CPC data, trend analysis" },
  { name: "Rank Tracking", price: "$19/month", description: "Monitor your keyword rankings daily across all platforms" },
  { name: "Done-For-You Service", price: "$99/product", description: "We optimize it for you, professionally" }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Simple, Transparent Pricing That Grows With You
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">Choose the plan that fits your business</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl sm:scale-105 border-4 border-blue-400'
                  : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg'
              } transition-all duration-300`}
            >
              <div className="flex-grow">
                {plan.badge && (
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <EmojiEventsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">{plan.badge}</span>
                  </div>
                )}
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="mb-4 sm:mb-6">
                  <span className={`text-4xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-base sm:text-lg ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon
                        className={`flex-shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-green-600'}`}
                        sx={{ fontSize: { xs: 16, sm: 18 }, marginTop: '2px' }}
                      />
                      <span className={`text-xs sm:text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={plan.link} className="mt-auto">
                <button
                  className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Add-Ons</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{addon.name}</h4>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-3">{addon.price}</p>
                <p className="text-xs sm:text-sm text-gray-600">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
