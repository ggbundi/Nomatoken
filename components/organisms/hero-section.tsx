"use client"

import { useState, useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users, Zap } from 'lucide-react';
import { PriceBadge } from '@/components/atoms/price-badge';
import { InvestmentModal } from '@/components/molecules/investment-modal';
import { CoinRain, FloatingCoins } from '@/components/atoms/coin-animations';
import { AnimatedButton } from '@/components/atoms/animated-button';
import { usePageAnimations } from '@/hooks/use-simple-animations';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Total Volume', value: '$1.2M+', icon: TrendingUp },
  { label: 'Active Users', value: '16K+', icon: Users },
  { label: 'Growth', value: '+2000%', icon: Zap },
  { label: 'Security', value: 'Audited', icon: Shield },
];

export function HeroSection() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [currentPrice, setCurrentPrice] = useState('0.0245');
  const [priceChange, setPriceChange] = useState(12.45);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);

  // Coin animations
  const { settings, isAnimationEnabled } = usePageAnimations('home');

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const basePrice = 0.0245;
      const volatility = 0.001;
      const newPrice = basePrice + (Math.random() - 0.5) * volatility;
      const change = ((newPrice - basePrice) / basePrice) * 100;
      
      setCurrentPrice(newPrice.toFixed(4));
      setPriceChange(change);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-hero-pattern">
      {/* Coin Animations */}
      {isAnimationEnabled && settings.rainEnabled && (
        <CoinRain
          intensity={settings.intensity}
          className="z-0"
          disabled={!isAnimationEnabled}
        />
      )}
      {isAnimationEnabled && settings.floatingEnabled && (
        <FloatingCoins
          intensity="low"
          className="z-0"
          disabled={!isAnimationEnabled}
        />
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 z-1" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-noma-primary/10 rounded-full blur-3xl animate-pulse z-1" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-noma-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-400 z-1" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect border">
                <span className="text-sm font-medium text-noma-primary">🏗️ Building the Future</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold leading-tight">
                Own{' '}
                <span className="bg-gradient-to-r from-noma-primary via-noma-secondary to-noma-accent bg-clip-text text-transparent">
                  Real Estate
                </span>
                <br />
                Through{' '}
                <span className="relative">
                  Blockchain
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-noma-primary to-noma-secondary rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Democratizing real estate investment across Africa through fractional tokenization. 
              Join thousands of investors building wealth with NOMA tokens.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <PriceBadge price={currentPrice} change={priceChange} size="lg" />
              <div className="text-sm text-muted-foreground">
                Live Price • Real-time updates
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <AnimatedButton
                size="lg"
                onClick={() => setIsInvestmentModalOpen(true)}
                className="gradient-primary text-white font-semibold px-8 py-4 rounded-full neon-glow group"
                particleEffect="both"
                particleIntensity="high"
              >
                Start Investing
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>

              <AnimatedButton
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('about')}
                className="px-8 py-4 rounded-full border-2"
                particleEffect="hover"
                particleIntensity="medium"
                glowEffect={false}
              >
                Learn More
              </AnimatedButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="text-center space-y-2 p-4 rounded-xl glass-effect hover:neon-glow transition-all duration-300"
                >
                  <stat.icon className="w-6 h-6 mx-auto text-noma-primary" />
                  <div className="text-2xl font-bold font-poppins">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Modern Architecture"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute top-6 right-6 glass-effect p-4 rounded-xl"
              >
                <div className="text-sm font-medium text-white">Market Cap</div>
                <div className="text-2xl font-bold text-white">$24.5M</div>
                <div className="text-xs text-green-400">+15.2% 24h</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute bottom-6 left-6 glass-effect p-4 rounded-xl"
              >
                <div className="text-sm font-medium text-white">Properties</div>
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-blue-400">Across 5 countries</div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-noma-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-noma-primary/20 rounded-full blur-xl animate-pulse animation-delay-600" />
          </motion.div>
        </motion.div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
      />
    </section>
  );
}