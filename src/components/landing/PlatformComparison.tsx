import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreIcon from '@mui/icons-material/Store';
import PaletteIcon from '@mui/icons-material/Palette';
import BusinessIcon from '@mui/icons-material/Business';
import LaptopIcon from '@mui/icons-material/Laptop';

const platforms = [
  {
    name: "Amazon",
    icon: ShoppingCartIcon,
    color: "bg-orange-100 border-orange-200",
    iconColor: "text-orange-600",
    features: [
      "Title optimization (200 chars)",
      "5 bullet points (500 chars each)",
      "Backend keywords (250 bytes)",
      "A+ content suggestions",
      "Category optimization",
      "Compliance checking"
    ]
  },
  {
    name: "Shopify",
    icon: StorefrontIcon,
    color: "bg-green-100 border-green-200",
    iconColor: "text-green-600",
    features: [
      "SEO meta titles & descriptions",
      "Product descriptions",
      "Collection assignments",
      "URL slug optimization",
      "Alt text for images",
      "Rich snippet support"
    ]
  },
  {
    name: "eBay",
    icon: StoreIcon,
    color: "bg-blue-100 border-blue-200",
    iconColor: "text-blue-600",
    features: [
      "Title optimization (80 chars)",
      "Item specifics",
      "HTML descriptions",
      "SEO-friendly formatting",
      "Category selection",
      "Shipping optimization"
    ]
  },
  {
    name: "Etsy",
    icon: PaletteIcon,
    color: "bg-purple-100 border-purple-200",
    iconColor: "text-purple-600",
    features: [
      "Title optimization (140 chars)",
      "13 optimized tags",
      "Personal, brand-aligned tone",
      "Seasonal keyword suggestions",
      "Gift occasion targeting",
      "Shop section optimization"
    ]
  },
  {
    name: "Walmart",
    icon: BusinessIcon,
    color: "bg-yellow-100 border-yellow-200",
    iconColor: "text-yellow-700",
    features: [
      "Title & shelf description",
      "Rich product content",
      "Category attributes",
      "Search optimization",
      "Competitive positioning"
    ]
  },
  {
    name: "WooCommerce",
    icon: LaptopIcon,
    color: "bg-indigo-100 border-indigo-200",
    iconColor: "text-indigo-600",
    features: [
      "SEO titles & meta",
      "Product descriptions",
      "Category optimization",
      "Schema markup",
      "Internal linking",
      "Mobile optimization"
    ]
  }
];

export default function PlatformComparison() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Optimized for Every Major Marketplace
          </h2>
          <p className="text-xl text-gray-600">
            Platform-specific optimization that follows each marketplace's unique rules
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <div key={index} className={`p-6 rounded-xl border-2 ${platform.color} hover:shadow-lg transition-shadow`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center`}>
                    <Icon className={platform.iconColor} sx={{ fontSize: 28 }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{platform.name}</h3>
                </div>
                <ul className="space-y-3">
                  {platform.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="text-green-600 flex-shrink-0" sx={{ fontSize: 18, marginTop: '2px' }} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
