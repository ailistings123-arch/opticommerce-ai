import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BoltIcon from '@mui/icons-material/Bolt';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaletteIcon from '@mui/icons-material/Palette';
import GroupIcon from '@mui/icons-material/Group';

const features = [
  {
    icon: AutoAwesomeIcon,
    title: "AI-Powered Optimization",
    description: "Advanced AI trained on 50,000+ successful listings creates professional, conversion-optimized content tailored to your product and platform.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: BarChartIcon,
    title: "Real SEO Scores",
    description: "Get actual SEO scores (not fake ones) with detailed breakdowns showing exactly what's strong and what needs improvement.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: SearchIcon,
    title: "Keyword Research",
    description: "Discover high-volume, low-competition keywords your competitors are missing. Includes search volumes, trends, and competition analysis.",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: GpsFixedIcon,
    title: "Before/After Comparison",
    description: "See exactly how your listing improves with side-by-side comparison of SEO scores, character usage, and keyword integration.",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: BoltIcon,
    title: "2-Minute Optimization",
    description: "No more spending hours researching and writing. Get professional results in under 2 minutes—faster than making coffee.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  {
    icon: ShoppingBagIcon,
    title: "Multi-Platform Support",
    description: "Amazon, Shopify, eBay, Etsy, Walmart, WooCommerce—one tool for all your marketplaces.",
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  },
  {
    icon: EditIcon,
    title: "Edit & Customize",
    description: "AI gives you a perfect starting point. Tweak and refine until it's exactly right for your brand.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  {
    icon: DownloadIcon,
    title: "Export Everything",
    description: "Download professional PDF reports, copy individual sections, or export to CSV for bulk management.",
    color: "text-teal-600",
    bgColor: "bg-teal-100"
  },
  {
    icon: LinkIcon,
    title: "URL Analysis",
    description: "Analyze competitor listings or your own products from any URL. Understand what's working and what's not.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100"
  },
  {
    icon: TrendingUpIcon,
    title: "Trend Alerts",
    description: "Get notified when keywords trend, competitors optimize, or your rankings change.",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    icon: PaletteIcon,
    title: "A+ Content Ideas",
    description: "Amazon sellers get A+ content module suggestions with templates to enhance their listings.",
    color: "text-violet-600",
    bgColor: "bg-violet-100"
  },
  {
    icon: GroupIcon,
    title: "Team Collaboration",
    description: "Share optimizations with your team, get feedback, and maintain brand consistency.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Everything You Need to Dominate Your Marketplace
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
            Powerful features designed to help you create perfect product listings
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-4 sm:p-6 bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={feature.color} sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
