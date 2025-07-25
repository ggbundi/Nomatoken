"use client"

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp, Shield, Globe, Zap } from 'lucide-react';
import { FloatingCoins } from '@/components/atoms/coin-animations';
import { usePageAnimations } from '@/hooks/use-coin-animations';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Building2,
    title: 'Real Estate Tokenization',
    description: 'Convert physical properties into digital tokens, enabling fractional ownership and liquidity.',
    color: 'text-noma-primary'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Built by and for the community with transparent governance and shared prosperity.',
    color: 'text-noma-secondary'
  },
  {
    icon: TrendingUp,
    title: 'Proven Growth',
    description: '+2000% growth since launch with consistent performance and expanding market presence.',
    color: 'text-noma-success'
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Multi-layered security protocols, smart contract audits, and regulatory compliance.',
    color: 'text-noma-warning'
  },
  {
    icon: Globe,
    title: 'African Markets',
    description: 'Focused on high-growth African real estate markets with local expertise and partnerships.',
    color: 'text-noma-accent'
  },
  {
    icon: Zap,
    title: 'DeFi Integration',
    description: 'Seamlessly integrated with DeFi protocols for staking, lending, and yield generation.',
    color: 'text-noma-error'
  }
];

const milestones = [
  { date: 'Aug 2024', event: 'Platform Launch', status: 'completed' },
  { date: 'Sep 2024', event: 'First Property Tokenized', status: 'completed' },
  { date: 'Oct 2024', event: '10K Users Milestone', status: 'completed' },
  { date: 'Nov 2024', event: '$1M Volume Achieved', status: 'completed' },
  { date: 'Dec 2024', event: 'Multi-Chain Expansion', status: 'current' },
  { date: 'Q1 2025', event: 'Mobile App Launch', status: 'upcoming' },
];

export function AboutSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const { settings, isAnimationEnabled } = usePageAnimations('about');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <section id="about" className="relative py-20 bg-muted/20 overflow-hidden">
      {/* Floating Coins */}
      {isAnimationEnabled && settings.floatingEnabled && (
        <FloatingCoins
          intensity={settings.intensity}
          className="z-0"
          disabled={!isAnimationEnabled}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-16"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              About Noma Token
            </Badge>
            <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
              Revolutionizing{' '}
              <span className="bg-gradient-to-r from-noma-primary to-noma-secondary bg-clip-text text-transparent">
                Real Estate Investment
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Noma Token is pioneering the future of real estate investment in Africa through blockchain technology. 
              Our platform enables fractional ownership of premium properties, making real estate investment 
              accessible to everyone.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", 
                      feature.color.includes('primary') ? 'bg-noma-primary/10' :
                      feature.color.includes('secondary') ? 'bg-noma-secondary/10' :
                      feature.color.includes('success') ? 'bg-noma-success/10' :
                      feature.color.includes('warning') ? 'bg-noma-warning/10' :
                      feature.color.includes('accent') ? 'bg-noma-accent/10' :
                      'bg-noma-error/10'
                    )}>
                      <feature.icon className={cn("w-6 h-6", feature.color)} />
                    </div>
                    <h3 className="text-xl font-poppins font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Timeline */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-poppins font-bold mb-4">Our Journey</h3>
              <p className="text-muted-foreground">Key milestones in our mission to democratize real estate investment</p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-noma-primary via-noma-secondary to-noma-accent"></div>

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.date}
                    variants={itemVariants}
                    className={cn(
                      "relative flex items-center",
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10",
                      milestone.status === 'completed' ? 'bg-noma-success' :
                      milestone.status === 'current' ? 'bg-noma-primary animate-pulse' :
                      'bg-muted-foreground'
                    )} />

                    {/* Content */}
                    <div className={cn(
                      "ml-12 md:ml-0 w-full md:w-5/12",
                      index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"
                    )}>
                      <Card className="p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            milestone.status === 'completed' ? 'default' :
                            milestone.status === 'current' ? 'secondary' :
                            'outline'
                          }>
                            {milestone.date}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {milestone.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{milestone.event}</h4>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}