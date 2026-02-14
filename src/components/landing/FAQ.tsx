'use client';

import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: "How accurate are the AI-generated listings?",
    answer: "Our AI is trained on 50,000+ successful, high-converting listings. We analyze what actually works in the real marketplace—not theory. Every optimization follows proven patterns that increase rankings and conversions. That said, you can always edit and customize the output to match your exact brand voice."
  },
  {
    question: "Which platforms do you support?",
    answer: "We currently support Amazon (Seller Central), Shopify, eBay, Etsy, Walmart Marketplace, and WooCommerce. More platforms coming soon based on user requests."
  },
  {
    question: "How long does it take to see results?",
    answer: "Most sellers see ranking improvements within 7-14 days and conversion improvements immediately. Amazon's algorithm typically takes 1-2 weeks to fully index changes and adjust rankings."
  },
  {
    question: "Can I edit the AI-generated content?",
    answer: "Absolutely! The AI gives you a professional starting point, but you have full editing control. Tweak anything to match your brand voice and preferences."
  },
  {
    question: "Do you provide actual keyword research data?",
    answer: "Yes! We provide real search volumes, competition levels, and trend data for keywords. This isn't guesswork—it's actual marketplace data."
  },
  {
    question: "What if I don't like the optimization?",
    answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund you in full, no questions asked."
  },
  {
    question: "Can I optimize my competitor's listings?",
    answer: "You can analyze any public listing URL to understand what's working and get inspiration. However, the optimization is always tailored to YOUR product with YOUR unique features."
  },
  {
    question: "Is there a limit to how many products I can optimize?",
    answer: "Free plan: 10/month. Starter: 50/month. Professional: 200/month. Enterprise: Unlimited. All plans reset monthly."
  },
  {
    question: "Do you offer bulk optimization?",
    answer: "Yes! Professional and Enterprise plans include bulk optimization. Upload a CSV or paste multiple URLs and optimize 10-100+ products at once."
  },
  {
    question: "Can my team collaborate on optimizations?",
    answer: "Professional plans include up to 5 team members. Enterprise includes unlimited team members with role-based permissions."
  },
  {
    question: "Do you integrate with my e-commerce platform?",
    answer: "We're working on direct integrations! Currently, you copy-paste the optimized content into your platform. Direct publishing to Amazon and Shopify coming Q2 2024."
  },
  {
    question: "What makes you different from other listing optimization tools?",
    answer: "Most tools use basic templates or just rearrange your existing content. We use advanced AI that actually understands your product, researches your market, and creates original, high-performing content. Plus, we support 6 platforms (most competitors only do Amazon)."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-level encryption (AES-256), never share your data with third parties, and are fully GDPR compliant. You can export or delete your data anytime."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, cancel with one click anytime. No contracts, no cancellation fees. If you cancel, you keep access until the end of your billing period."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Common Questions, Clear Answers
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about ListingOptimizer AI
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
                <ExpandMoreIcon
                  className={`flex-shrink-0 text-blue-600 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  sx={{ fontSize: 20 }}
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
