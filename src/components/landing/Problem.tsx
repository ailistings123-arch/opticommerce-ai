import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const problems = [
  {
    icon: TrendingDownIcon,
    title: "Poor Rankings = No Traffic",
    description: "Your product is buried on page 5 while inferior competitors rank #1. Why? Their listings are optimized for Amazon's algorithm, yours aren't.",
    emoji: "😞"
  },
  {
    icon: AttachMoneyIcon,
    title: "Low Conversions = Wasted Ad Spend",
    description: "You're paying $2-5 per click, but only 2% convert because your title is weak, your bullets are boring, and your description doesn't sell.",
    emoji: "💸"
  },
  {
    icon: AccessTimeIcon,
    title: "Manual Optimization = Hours of Frustration",
    description: "You've spent 6 hours researching keywords, writing copy, and tweaking your listing—only to see zero improvement in sales.",
    emoji: "⏰"
  },
  {
    icon: ErrorOutlineIcon,
    title: "Outdated Listings = Declining Sales",
    description: "You optimized 6 months ago, but competitor tactics changed, keywords shifted, and your rankings dropped 15 spots. Now your sales are down 40%.",
    emoji: "📉"
  }
];

const stats = [
  { value: "70%", label: "of listings use less than 50% of available character limits" },
  { value: "42/100", label: "Average e-commerce listing SEO score" },
  { value: "$3,200", label: "Lost monthly revenue from poor listings" },
  { value: "4-8 hrs", label: "Manual optimization time per product" }
];

export default function Problem() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Your Great Products Are Invisible Because Your Listings Suck
          </h2>
          <p className="text-sm sm:text-base text-gray-600">The Painful Reality:</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-10">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div key={index} className="bg-white p-4 sm:p-5 rounded-lg border border-red-100 hover:border-red-200 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-red-600" sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5">{problem.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{problem.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-600 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
