import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "OptiCommerce AI - AI-Powered Product Listing Optimizer | Boost Sales on Amazon, Shopify, Etsy & eBay",
  description: "Transform your e-commerce listings with AI. OptiCommerce AI optimizes product titles, descriptions, and SEO for Amazon, Shopify, Etsy, and eBay. Increase visibility, boost conversions, and save hours of work with our intelligent optimization platform.",
  keywords: "product listing optimization, AI SEO, Amazon listing optimizer, Shopify SEO, Etsy optimization, eBay listing tool, e-commerce AI, product description generator, SEO score, listing analyzer",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ],
  },
  openGraph: {
    title: "OptiCommerce AI - AI-Powered Product Listing Optimizer",
    description: "Boost your e-commerce sales with AI-optimized product listings for Amazon, Shopify, Etsy, and eBay",
    type: "website",
    images: [
      {
        url: '/apple-icon.svg',
        width: 180,
        height: 180,
        alt: 'OptiCommerce AI Logo',
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
      <body
        className={`${poppins.variable} antialiased bg-gradient-to-br from-gray-50 to-blue-50`}
      >
        {children}
      </body>
    </html>
  );
}
