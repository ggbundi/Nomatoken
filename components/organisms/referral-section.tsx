"use client"

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  TelegramShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon
} from 'react-share';
import { Users, Gift, Copy, Share2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const referralStats = [
  { label: 'Total Referrals', value: '24', icon: Users, change: '+5 this week' },
  { label: 'Total Earnings', value: '$1,250', icon: DollarSign, change: '+$180 this month' },
  { label: 'Conversion Rate', value: '12.5%', icon: TrendingUp, change: '+2.3% vs last month' },
  { label: 'Active Referrals', value: '18', icon: Gift, change: '6 new investments' },
];

const referralData = [
  { id: 1, email: 'john.doe@example.com', date: '2024-12-01', status: 'Active', invested: '$500', earnings: '$25' },
  { id: 2, email: 'jane.smith@example.com', date: '2024-11-28', status: 'Active', invested: '$1,200', earnings: '$60' },
  { id: 3, email: 'mike.johnson@example.com', date: '2024-11-25', status: 'Pending', invested: '$0', earnings: '$0' },
  { id: 4, email: 'sarah.wilson@example.com', date: '2024-11-20', status: 'Active', invested: '$800', earnings: '$40' },
  { id: 5, email: 'alex.brown@example.com', date: '2024-11-15', status: 'Active', invested: '$2,500', earnings: '$125' },
];

const referralTiers = [
  { tier: 'Bronze', referrals: '1-9', commission: '5%', bonus: '$0', color: 'text-amber-600' },
  { tier: 'Silver', referrals: '10-24', commission: '7%', bonus: '$100', color: 'text-gray-500' },
  { tier: 'Gold', referrals: '25-49', commission: '10%', bonus: '$500', color: 'text-yellow-500' },
  { tier: 'Platinum', referrals: '50+', commission: '15%', bonus: '$2,000', color: 'text-purple-500' },
];

export function ReferralSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [referralCode, setReferralCode] = useState('NOMA-REF-ABC123');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(`${window.location.origin}?ref=${referralCode}`);
  }, [referralCode]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Referral link copied to clipboard!');
  };

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
    <section id="referral" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Referral Program
            </Badge>
            <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
              Earn with{' '}
              <span className="bg-gradient-to-r from-noma-primary to-noma-accent bg-clip-text text-transparent">
                Every Referral
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Share NOMA Token with friends and earn up to 15% commission on their investments. 
              The more you refer, the higher your earnings!
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {referralStats.map((stat, index) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-noma-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-noma-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-poppins">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Referral Link & Sharing */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-noma-primary" />
                    Share Your Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Referral Code</label>
                      <div className="flex gap-2">
                        <Input value={referralCode} readOnly className="font-mono" />
                        <Button variant="outline" size="sm" onClick={copyReferralLink}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Referral Link</label>
                      <div className="flex gap-2">
                        <Input value={shareUrl} readOnly className="text-xs" />
                        <Button variant="outline" size="sm" onClick={copyReferralLink}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Share on Social Media</h4>
                    <div className="flex gap-2">
                      <FacebookShareButton url={shareUrl}>
                        <FacebookIcon size={40} round />
                      </FacebookShareButton>
                      <TwitterShareButton url={shareUrl} title="Join me on NOMA Token - Real Estate Investment Made Easy!">
                        <TwitterIcon size={40} round />
                      </TwitterShareButton>
                      <TelegramShareButton url={shareUrl} title="Join me on NOMA Token - Real Estate Investment Made Easy!">
                        <TelegramIcon size={40} round />
                      </TelegramShareButton>
                      <WhatsappShareButton url={shareUrl} title="Join me on NOMA Token - Real Estate Investment Made Easy!">
                        <WhatsappIcon size={40} round />
                      </WhatsappShareButton>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">How it Works</h4>
                    <ol className="text-sm space-y-1 text-muted-foreground">
                      <li>1. Share your referral link</li>
                      <li>2. Friends sign up and invest</li>
                      <li>3. Earn 5-15% commission</li>
                      <li>4. Get instant payouts</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Referral Table & Tiers */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Tabs defaultValue="referrals" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="referrals">My Referrals</TabsTrigger>
                  <TabsTrigger value="tiers">Commission Tiers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="referrals">
                  <Card>
                    <CardHeader>
                      <CardTitle>Referral Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Invested</TableHead>
                            <TableHead>Earnings</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralData.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-mono text-sm">
                                {referral.email}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(referral.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={referral.status === 'Active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {referral.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">
                                {referral.invested}
                              </TableCell>
                              <TableCell className="font-semibold text-noma-success">
                                {referral.earnings}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tiers">
                  <Card>
                    <CardHeader>
                      <CardTitle>Commission Tiers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {referralTiers.map((tier, index) => (
                          <div
                            key={tier.tier}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all duration-300",
                              index === 1 ? "border-noma-primary bg-noma-primary/5" : "border-muted"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={cn("text-2xl font-bold", tier.color)}>
                                  {tier.tier}
                                </div>
                                <div>
                                  <div className="font-medium">{tier.referrals} referrals</div>
                                  <div className="text-sm text-muted-foreground">
                                    {tier.commission} commission rate
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{tier.bonus}</div>
                                <div className="text-xs text-muted-foreground">Sign-up bonus</div>
                              </div>
                            </div>
                            {index === 1 && (
                              <Badge className="mt-2">Current Tier</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}