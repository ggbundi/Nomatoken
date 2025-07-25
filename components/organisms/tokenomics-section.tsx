"use client"

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Coins, TrendingUp, Lock, Users, Zap, Building2 } from 'lucide-react';
import { FloatingCoins, BackgroundCoins } from '@/components/atoms/coin-animations';
import { usePageAnimations } from '@/hooks/use-coin-animations';
import { cn } from '@/lib/utils';

const tokenDistribution = [
  { name: 'Public Sale', value: 35, color: '#10B981', amount: '350,000,000' },
  { name: 'Team & Advisors', value: 20, color: '#3B82F6', amount: '200,000,000' },
  { name: 'Ecosystem Fund', value: 15, color: '#F59E0B', amount: '150,000,000' },
  { name: 'Marketing', value: 12, color: '#EF4444', amount: '120,000,000' },
  { name: 'Partnerships', value: 10, color: '#8B5CF6', amount: '100,000,000' },
  { name: 'Reserve', value: 8, color: '#06B6D4', amount: '80,000,000' },
];

const metrics = [
  { label: 'Total Supply', value: '1,000,000,000', icon: Coins, change: 'Fixed' },
  { label: 'Circulating Supply', value: '350,000,000', icon: TrendingUp, change: '+12%' },
  { label: 'Market Cap', value: '$8.58M', icon: Building2, change: '+45%' },
  { label: 'Locked Tokens', value: '200,000,000', icon: Lock, change: '24 months' },
];

const roadmapData = [
  { phase: 'Q4 2024', progress: 85, description: 'Platform Launch & Initial Listings' },
  { phase: 'Q1 2025', progress: 60, description: 'Mobile App & DeFi Integration' },
  { phase: 'Q2 2025', progress: 30, description: 'Multi-Chain Expansion' },
  { phase: 'Q3 2025', progress: 10, description: 'DAO Governance Launch' },
];

export function TokenomicsSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const { settings, isAnimationEnabled } = usePageAnimations('tokenomics');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
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

  return (
    <section id="tokenomics" className="relative py-20 overflow-hidden">
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
              Tokenomics
            </Badge>
            <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
              NOMA Token{' '}
              <span className="bg-gradient-to-r from-noma-primary to-noma-accent bg-clip-text text-transparent">
                Economics
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Designed for sustainable growth with balanced distribution, strong incentives, 
              and long-term value creation for all stakeholders.
            </p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {metrics.map((metric, index) => (
              <motion.div key={metric.label} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-noma-primary/10 flex items-center justify-center">
                      <metric.icon className="w-6 h-6 text-noma-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-poppins">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {metric.change}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Distribution Charts */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Pie Chart */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-noma-primary" />
                    Token Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={tokenDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {tokenDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${value}%`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="space-y-3">
                      {tokenDistribution.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{item.value}%</div>
                            <div className="text-xs text-muted-foreground">
                              {parseInt(item.amount).toLocaleString()} NOMA
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Roadmap Progress */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-noma-accent" />
                    Development Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {roadmapData.map((phase, index) => (
                      <div key={phase.phase} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{phase.phase}</span>
                          <span className="text-sm text-muted-foreground">{phase.progress}%</span>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Utility Features */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-noma-primary/5 via-noma-secondary/5 to-noma-accent/5">
              <CardHeader>
                <CardTitle className="text-center">Token Utility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-noma-primary/10 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-noma-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Property Investment</h3>
                    <p className="text-sm text-muted-foreground">
                      Use NOMA tokens to invest in tokenized real estate properties across Africa
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-noma-secondary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-noma-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold">Governance Rights</h3>
                    <p className="text-sm text-muted-foreground">
                      Participate in platform governance and vote on key protocol decisions
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-noma-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-noma-accent" />
                    </div>
                    <h3 className="text-lg font-semibold">Staking Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Stake tokens to earn rewards and access premium platform features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}