'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Navigation from '@/components/landing/Navigation';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Problem from '@/components/landing/Problem';
import Solution from '@/components/landing/Solution';
import CaseStudies from '@/components/landing/CaseStudies';
import Features from '@/components/landing/Features';
import Benefits from '@/components/landing/Benefits';
import PlatformComparison from '@/components/landing/PlatformComparison';
import CompetitorComparison from '@/components/landing/CompetitorComparison';
import Pricing from '@/components/landing/Pricing';
import SocialProof from '@/components/landing/SocialProof';
import FAQ from '@/components/landing/FAQ';
import Guarantee from '@/components/landing/Guarantee';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Stats />
      <Problem />
      <Solution />
      <CaseStudies />
      <Features />
      <Benefits />
      <PlatformComparison />
      <CompetitorComparison />
      <Pricing />
      <SocialProof />
      <FAQ />
      <Guarantee />
      <FinalCTA />
      <Footer />
    </div>
  );
}
