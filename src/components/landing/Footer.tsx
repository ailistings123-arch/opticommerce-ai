import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Integrations", href: "#" },
      { name: "API Documentation", href: "#" },
      { name: "Roadmap", href: "#" },
      { name: "Changelog", href: "#" }
    ]
  },
  {
    title: "Solutions",
    links: [
      { name: "For Amazon Sellers", href: "#" },
      { name: "For Shopify Stores", href: "#" },
      { name: "For Etsy Shops", href: "#" },
      { name: "For eBay Sellers", href: "#" },
      { name: "For Agencies", href: "#" },
      { name: "For Enterprises", href: "#" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "#" },
      { name: "Help Center", href: "#" },
      { name: "Video Tutorials", href: "#" },
      { name: "Success Stories", href: "#" },
      { name: "Webinars", href: "#" },
      { name: "E-books", href: "#" },
      { name: "Templates", href: "#" }
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press Kit", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Affiliates", href: "#" },
      { name: "Partners", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Security", href: "#" },
      { name: "GDPR Compliance", href: "#" },
      { name: "Cookie Policy", href: "#" }
    ]
  }
];

const socialLinks = [
  { name: "Twitter", href: "#", icon: "𝕏" },
  { name: "LinkedIn", href: "#", icon: "in" },
  { name: "Facebook", href: "#", icon: "f" },
  { name: "YouTube", href: "#", icon: "▶" },
  { name: "Instagram", href: "#", icon: "📷" }
];

const trustBadges = [
  "🔒 SSL Secure",
  "✓ GDPR Compliant",
  "✓ SOC 2",
  "✓ 99.9% Uptime"
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <AutoAwesomeIcon className="text-blue-500" sx={{ fontSize: 24 }} />
              <span className="text-xl font-semibold text-white">ListingOptimizer AI</span>
            </div>
            <p className="text-sm mb-4">
              AI-powered product listing optimization for e-commerce success
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-white font-bold">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 py-8 border-t border-b border-gray-800 mb-8">
          {trustBadges.map((badge, index) => (
            <div key={index} className="text-sm font-medium text-gray-500">
              {badge}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm">
          <p>&copy; 2024 ListingOptimizer AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
