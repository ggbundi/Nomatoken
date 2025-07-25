"use client"

import { HeroSection } from '@/components/organisms/hero-section';
import { AboutSection } from '@/components/organisms/about-section';
import { TokenomicsSection } from '@/components/organisms/tokenomics-section';
import { LaunchpadSection } from '@/components/organisms/launchpad-section';
import { ReferralSection } from '@/components/organisms/referral-section';
import { PriceChart } from '@/components/molecules/price-chart';
import { Header } from '@/components/organisms/header';
import { Footer } from '@/components/organisms/footer';
import { BrandedBackground } from '@/components/atoms/branded-background';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        
        {/* Price Chart Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
                Real-Time Market Data
              </h2>
              <p className="text-lg text-muted-foreground">
                Track NOMA token performance with live market data and analytics
              </p>
            </div>
            <PriceChart />
          </div>
        </section>
        
        <TokenomicsSection />
        <LaunchpadSection />
        <ReferralSection />
      </main>
      <Footer />
    </div>
  );
}