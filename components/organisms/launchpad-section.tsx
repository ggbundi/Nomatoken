"use client"

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PurchaseWizardStep } from '@/components/molecules/purchase-wizard-step';
import { MapPin, Calendar, TrendingUp, Users, Star, ExternalLink } from 'lucide-react';
import { CoinRain, FloatingCoins } from '@/components/atoms/coin-animations';
import { AnimatedButton } from '@/components/atoms/animated-button';
import { usePageAnimations } from '@/hooks/use-coin-animations';
import { cn } from '@/lib/utils';

const properties = [
  {
    id: 1,
    name: 'Nairobi Heights',
    location: 'Nairobi, Kenya',
    type: 'Residential',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$250,000',
    tokens: '10,204,081',
    raised: 65,
    investors: 247,
    apy: 12.5,
    status: 'active',
    description: 'Premium residential complex in Nairobi\'s fastest-growing district with guaranteed rental yields.',
    features: ['Prime Location', '24/7 Security', 'Swimming Pool', 'Gym Facilities'],
    launchDate: '2024-12-01',
    endDate: '2024-12-31',
    minInvestment: 100,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Lagos Marina',
    location: 'Lagos, Nigeria',
    type: 'Commercial',
    image: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$500,000',
    tokens: '20,408,163',
    raised: 42,
    investors: 156,
    apy: 15.2,
    status: 'active',
    description: 'Commercial office space in Lagos financial district with high-profile tenants.',
    features: ['Financial District', 'High-end Tenants', 'Modern Facilities', 'Parking'],
    launchDate: '2024-11-15',
    endDate: '2025-01-15',
    minInvestment: 250,
    rating: 4.9
  },
  {
    id: 3,
    name: 'Cape Town Views',
    location: 'Cape Town, South Africa',
    type: 'Mixed-use',
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$750,000',
    tokens: '30,612,244',
    raised: 80,
    investors: 342,
    apy: 14.8,
    status: 'funding',
    description: 'Mixed-use development with retail and residential units overlooking Table Mountain.',
    features: ['Mountain Views', 'Mixed-use', 'Tourist Area', 'Modern Design'],
    launchDate: '2024-10-01',
    endDate: '2024-12-15',
    minInvestment: 500,
    rating: 4.7
  }
];

const categories = ['All', 'Residential', 'Commercial', 'Mixed-use'];
const statuses = ['All', 'Active', 'Funding', 'Completed'];

export function LaunchpadSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [purchaseStep, setPurchaseStep] = useState<1 | 2 | 3>(1);
  const { settings, isAnimationEnabled } = usePageAnimations('launchpad');

  const filteredProperties = properties.filter(property => {
    const categoryMatch = selectedCategory === 'All' || property.type === selectedCategory;
    const statusMatch = selectedStatus === 'All' || property.status === selectedStatus.toLowerCase();
    return categoryMatch && statusMatch;
  });

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

  const handleStepComplete = (step: number) => {
    if (step < 3) {
      setPurchaseStep((step + 1) as 1 | 2 | 3);
    } else {
      // Purchase complete
      setSelectedProperty(null);
      setPurchaseStep(1);
    }
  };

  return (
    <section id="launchpad" className="relative py-20 bg-muted/20 overflow-hidden">
      {/* Coin Rain for Launchpad */}
      {isAnimationEnabled && settings.rainEnabled && (
        <CoinRain
          intensity={settings.intensity}
          className="z-0"
          disabled={!isAnimationEnabled}
        />
      )}
      {isAnimationEnabled && settings.floatingEnabled && (
        <FloatingCoins
          intensity="medium"
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
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Token Launchpad
            </Badge>
            <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
              Invest in{' '}
              <span className="bg-gradient-to-r from-noma-primary to-noma-secondary bg-clip-text text-transparent">
                Premium Properties
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover and invest in tokenized real estate properties across Africa. 
              Start with as little as $100 and earn passive income through rental yields.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="flex justify-center mt-4">
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList className="grid grid-cols-4 max-w-sm">
                  {statuses.map((status) => (
                    <TabsTrigger key={status} value={status} className="text-xs">
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </motion.div>

          {/* Properties Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProperties.map((property, index) => (
              <motion.div key={property.id} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                      <Badge variant="outline" className="bg-white/90">
                        {property.type}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{property.rating}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-poppins font-semibold mb-2">{property.name}</h3>
                      <div className="flex items-center text-muted-foreground text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Funding Progress</span>
                        <span className="text-sm font-medium">{property.raised}%</span>
                      </div>
                      <Progress value={property.raised} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Value</div>
                        <div className="font-semibold">{property.price}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected APY</div>
                        <div className="font-semibold text-noma-success">{property.apy}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Investors</div>
                        <div className="font-semibold">{property.investors}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Min. Investment</div>
                        <div className="font-semibold">${property.minInvestment}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            Learn More
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{property.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <img
                              src={property.image}
                              alt={property.name}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <p className="text-muted-foreground">{property.description}</p>
                                <div>
                                  <h4 className="font-semibold mb-2">Key Features</h4>
                                  <ul className="space-y-1">
                                    {property.features.map((feature, idx) => (
                                      <li key={idx} className="text-sm flex items-center">
                                        <div className="w-2 h-2 bg-noma-primary rounded-full mr-2" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-muted-foreground">Launch Date</div>
                                    <div className="font-medium">{property.launchDate}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">End Date</div>
                                    <div className="font-medium">{property.endDate}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Total Tokens</div>
                                    <div className="font-medium">{property.tokens}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Token Price</div>
                                    <div className="font-medium">$0.0245</div>
                                  </div>
                                </div>
                                <AnimatedButton
                                  className="w-full gradient-primary text-white"
                                  onClick={() => setSelectedProperty(property)}
                                  particleEffect="click"
                                  particleIntensity="high"
                                >
                                  Invest Now
                                </AnimatedButton>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AnimatedButton
                        size="sm"
                        className="flex-1 gradient-primary text-white"
                        onClick={() => setSelectedProperty(property)}
                        particleEffect="click"
                        particleIntensity="high"
                      >
                        Invest Now
                      </AnimatedButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Purchase Modal */}
          <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Purchase NOMA Tokens</DialogTitle>
              </DialogHeader>
              {selectedProperty && (
                <PurchaseWizardStep
                  step={purchaseStep}
                  onStepComplete={handleStepComplete}
                />
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  );
}