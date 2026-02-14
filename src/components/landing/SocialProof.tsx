import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import BuildIcon from '@mui/icons-material/Build';

const stats = [
  { icon: GroupIcon, value: "12,000+", label: "Active sellers" },
  { icon: InventoryIcon, value: "147,000+", label: "Products optimized" },
  { icon: AttachMoneyIcon, value: "$48M+", label: "Additional revenue generated" },
  { icon: EmojiEventsIcon, value: "4.9/5", label: "Average rating (2,847 reviews)" }
];

const reviews = [
  {
    text: "This is the ChatGPT of product listings. I optimized my entire store in 2 hours and sales jumped 180%. Insane ROI.",
    author: "David Park",
    role: "Shopify Store Owner",
    icon: BusinessCenterIcon,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100"
  },
  {
    text: "Finally, a tool that actually understands Amazon's algorithm. My BSR went from #2,347 to #127 in my category.",
    author: "Jennifer Wu",
    role: "Amazon FBA Seller",
    icon: PersonIcon,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100"
  },
  {
    text: "I was paying a VA $800/month to write listings. ListingOptimizer AI does it better for $49. No brainer.",
    author: "Carlos Martinez",
    role: "E-commerce Agency Owner",
    icon: CodeIcon,
    iconColor: "text-green-600",
    iconBg: "bg-green-100"
  },
  {
    text: "The keyword research alone is worth 5x the price. I discovered keywords my competitors are ranking for that I never knew existed.",
    author: "Amanda Foster",
    role: "Etsy Seller",
    icon: BrushIcon,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100"
  },
  {
    text: "My conversion rate went from 2.8% to 6.1%. That's literally doubled my revenue without spending more on ads.",
    author: "Tom Richardson",
    role: "Online Retailer",
    icon: BuildIcon,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100"
  }
];

export default function SocialProof() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by 12,000+ Sellers Worldwide
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <Icon className="text-blue-600 mx-auto mb-3" sx={{ fontSize: 32 }} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => {
            const Icon = review.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="text-yellow-400" sx={{ fontSize: 16 }} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${review.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={review.iconColor} sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.author}</div>
                    <div className="text-sm text-gray-600">{review.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
