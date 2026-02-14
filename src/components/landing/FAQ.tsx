'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does ListingOptimizer optimize my product listings?",
    answer: "ListingOptimizer uses advanced Google Gemini 1.5 AI technology to analyze your product listings and generate SEO-optimized content. It considers platform-specific rules, keyword density, readability, and conversion best practices to create titles and descriptions that rank higher and convert better."
  },
  {
    question: "Which e-commerce platforms do you support?",
    answer: "We currently support Amazon, Shopify, Etsy, and eBay. Each platform has unique SEO requirements and character limits, which our AI automatically adapts to for optimal results."
  },
  {
    question: "How accurate is the SEO score?",
    answer: "Our SEO scoring algorithm analyzes 15+ factors including keyword usage, title length, description quality, readability, and platform-specific best practices. The score is based on proven e-commerce SEO principles and correlates strongly with listing performance."
  },
  {
    question: "Can I try ListingOptimizer before purchasing?",
    answer: "Yes! We offer a free plan with 3 optimizations per month. No credit card required. You can upgrade anytime to access more optimizations and premium features."
  },
  {
    question: "How long does it take to optimize a listing?",
    answer: "Most optimizations complete in 5-10 seconds. Our AI analyzes your content and generates optimized titles, descriptions, tags, and improvement suggestions almost instantly."
  },
  {
    question: "Can I optimize existing product URLs?",
    answer: "Absolutely! Just paste any product URL from Amazon, Shopify, Etsy, or eBay. Our system will automatically extract the existing listing data and optimize it for you."
  },
  {
    question: "Do you store my product data?",
    answer: "We securely store your optimization history in Firebase so you can access past optimizations anytime. Your data is encrypted and never shared with third parties. You can delete your data at any time from your account settings."
  },
  {
    question: "What makes ListingOptimizer better than manual optimization?",
    answer: "Our AI processes thousands of successful listings to understand what works. It saves hours of research and testing, ensures consistency across your catalog, and applies the latest SEO best practices automatically. Plus, it never gets tired or makes typos!"
  },
  {
    question: "Can I use the optimized content immediately?",
    answer: "Yes! Simply copy the optimized title, description, and tags with one click and paste them directly into your product listing. The content is ready to publish without any additional editing required."
  },
  {
    question: "What if I'm not satisfied with the optimization?",
    answer: "You can re-optimize with different keywords or input variations. Our AI learns from your preferences. If you're still not satisfied, contact our support team and we'll help you get the results you need."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about ListingOptimizer
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 text-blue-600 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  size={20}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-gray-700 mb-2">
            Still have questions?
          </p>
          <p className="text-sm text-gray-600">
            Contact our support team at{' '}
            <a href="mailto:support@opticommerce.ai" className="text-blue-600 hover:underline font-medium">
              support@opticommerce.ai
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
