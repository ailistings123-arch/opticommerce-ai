import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';

const caseStudies = [
  {
    name: "Sarah Martinez",
    role: "Small Business Owner",
    product: "Premium Yoga Mat",
    platform: "Amazon",
    time: "1 minute 47 seconds",
    icon: BusinessCenterIcon,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    before: {
      seoScore: 34,
      ranking: "#47 for 'yoga mat'",
      revenue: "$847",
      conversion: "2.1%"
    },
    after: {
      seoScore: 94,
      ranking: "#8 for 'yoga mat'",
      revenue: "$2,923",
      conversion: "5.8%"
    },
    result: "+245% revenue increase in 14 days",
    testimonial: "I was skeptical, but holy crap—my sales tripled in two weeks! The optimized listing just WORKS. Best $49 I've ever spent on my business."
  },
  {
    name: "Mike Chen",
    role: "E-commerce Entrepreneur",
    product: "47 tech accessories",
    platform: "Shopify + Amazon",
    time: "23 products in 45 minutes (bulk)",
    icon: CodeIcon,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    before: {
      seoScore: 38,
      revenue: "$12,400",
      abandonment: "71%"
    },
    after: {
      seoScore: 91,
      revenue: "$28,900",
      abandonment: "54%"
    },
    result: "+133% revenue, saved 40 hours/month",
    testimonial: "ListingOptimizer AI paid for itself 15x over in the first month. I optimized my entire catalog in under an hour. My old listings were embarrassingly bad compared to what the AI created."
  },
  {
    name: "Emma Rodriguez",
    role: "Jewelry Artisan",
    product: "Custom jewelry",
    platform: "Etsy",
    challenge: "Standing out in saturated market",
    icon: BrushIcon,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100",
    before: {
      views: "23 daily views",
      sales: "12 items ($430)",
      ranking: "Page 7+"
    },
    after: {
      views: "187 daily views",
      sales: "78 items ($2,850)",
      ranking: "Page 1 for 5 keywords"
    },
    result: "550% sales increase, went full-time",
    testimonial: "As a creative person, I HATED writing product descriptions. ListingOptimizer AI gets my brand voice perfectly and wrote descriptions that actually sell. I went from side hustle to full-time income in 3 months!"
  }
];

export default function CaseStudies() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Real Results from Real Sellers
          </h2>
          <p className="text-xl text-gray-600">See how ListingOptimizer AI transformed their businesses</p>
        </div>

        <div className="space-y-12">
          {caseStudies.map((study, index) => {
            const Icon = study.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-8 md:p-10">
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`w-16 h-16 ${study.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={study.iconColor} sx={{ fontSize: 32 }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{study.name}</h3>
                      <p className="text-gray-600 mb-2">{study.role}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {study.product}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                          {study.platform}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          ⚡ {study.time}
                        </span>
                      </div>
                    </div>
                  </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Before OptiCommerce:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {Object.entries(study.before).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-4">After OptiCommerce:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {Object.entries(study.after).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUpIcon className="text-green-600" sx={{ fontSize: 24 }} />
                    <span className="text-xl font-bold text-gray-900">{study.result}</span>
                  </div>
                </div>

                <blockquote className="border-l-4 border-blue-600 pl-6 italic text-gray-700 text-lg">
                  "{study.testimonial}"
                </blockquote>
                <p className="mt-2 text-sm text-gray-600">— {study.name}, {study.role}</p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
