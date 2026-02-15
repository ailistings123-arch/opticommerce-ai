import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://listingoptimizer.ai'),
  title: "ListingOptimizer - AI-Powered Product Listing Optimization | Boost Sales on Amazon, Shopify, Etsy & eBay",
  description: "Transform your e-commerce listings with AI. ListingOptimizer optimizes product titles, descriptions, and SEO for Amazon, Shopify, Etsy, and eBay. Increase visibility, boost conversions, and save hours of work with our intelligent optimization platform.",
  keywords: "product listing optimization, AI SEO, Amazon listing optimizer, Shopify SEO, Etsy optimization, eBay listing tool, e-commerce AI, product description generator, SEO score, listing analyzer",
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
    title: "ListingOptimizer - AI-Powered Product Listing Optimizer",
    description: "Boost your e-commerce sales with AI-optimized product listings for Amazon, Shopify, Etsy, and eBay",
    type: "website",
    images: [
      {
        url: '/logo.svg',
        width: 180,
        height: 180,
        alt: 'ListingOptimizer Logo',
      }
    ],
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
      </body>
    </html>
  );
}
