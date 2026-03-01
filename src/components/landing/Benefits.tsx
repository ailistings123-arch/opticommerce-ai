import { TrendingUp, Clock, Target, Zap, Shield, BarChart3 } from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Sales by 40%",
    description: "Optimized listings rank higher in search results, leading to more views and conversions. Our users see an average 40% increase in sales within 30 days.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Stop spending hours researching keywords and writing descriptions. Our AI does it in seconds, freeing you to focus on growing your business.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Target,
    title: "Perfect SEO Every Time",
    description: "Never worry about keyword stuffing, character limits, or platform rules. Our AI knows exactly what works for each marketplace.",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: Zap,
    title: "Instant Optimization",
    description: "Get professional-quality listings in under 10 seconds. No waiting, no revisions needed. Just copy, paste, and publish.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  {
    icon: Shield,
    title: "Platform-Specific Rules",
    description: "Each marketplace has unique requirements. Our AI automatically adapts to Amazon, Shopify, Etsy, eBay, Walmart, and WooCommerce guidelines.",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    icon: BarChart3,
    title: "Data-Driven Results",
    description: "Get detailed SEO scores and actionable insights. Track improvements and understand exactly what makes your listings perform better.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  }
];

export default function Benefits() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Dominate Your Marketplace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you create perfect product listings
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={benefit.color} size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
