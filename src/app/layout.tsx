import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://listingoptimizer.site'),
  title: "Listing Optimizer AI | Transform Product Listings into Sales Machines",
  description: "Boost your marketplace visibility by 300% and increase conversions by 88%. Listing Optimizer AI uses advanced algorithms to turn underperforming product pages into high-ranking sales machines in under 2 minutes.",
  keywords: "product listing optimization, AI SEO, Amazon listing optimizer, Shopify SEO, Etsy optimization, eBay listing tool, Walmart marketplace, WooCommerce optimization, e-commerce AI, product description generator, SEO score, listing analyzer, sales conversion, marketplace visibility",
  authors: [{ name: "Listing Optimizer AI" }],
  creator: "Listing Optimizer AI",
  publisher: "Listing Optimizer AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://listingoptimizer.site',
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/logo.svg', type: 'image/svg+xml' }
    ],
  },
  openGraph: {
    title: "Listing Optimizer AI | Transform Product Listings into Sales Machines",
    description: "Boost your marketplace visibility by 300% and increase conversions by 88%. Turn underperforming product pages into high-ranking sales machines in under 2 minutes.",
    type: "website",
    url: 'https://listingoptimizer.site',
    siteName: 'Listing Optimizer AI',
    locale: 'en_US',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Listing Optimizer AI - Transform Product Listings',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Listing Optimizer AI | Transform Product Listings into Sales Machines",
    description: "Boost marketplace visibility by 300% and increase conversions by 88% in under 2 minutes.",
    images: ['/logo.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="canonical" href="https://listingoptimizer.site" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Listing Optimizer AI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "0",
                "highPrice": "19",
                "offerCount": "3"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "12000",
                "bestRating": "5",
                "worstRating": "1"
              },
              "description": "Boost your marketplace visibility by 300% and increase conversions by 88%. Listing Optimizer AI uses advanced algorithms to turn underperforming product pages into high-ranking sales machines in under 2 minutes.",
              "url": "https://listingoptimizer.site",
              "screenshot": "https://listingoptimizer.site/logo.svg",
              "featureList": [
                "AI-Powered SEO Optimization",
                "Multi-Platform Support (Amazon, Shopify, Etsy, eBay, Walmart, WooCommerce)",
                "Automatic Keyword Research",
                "Before/After Comparison",
                "Real-time SEO Scoring",
                "Multi-AI Provider System"
              ],
              "author": {
                "@type": "Organization",
                "name": "Listing Optimizer AI"
              }
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
