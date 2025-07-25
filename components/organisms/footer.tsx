"use client"

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Logo } from '@/components/atoms/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Twitter, 
  Send, 
  Youtube, 
  Github, 
  Mail, 
  MapPin, 
  Phone,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const footerLinks = {
  product: [
    { name: 'Tokenomics', href: '#tokenomics' },
    { name: 'Launchpad', href: '#launchpad' },
    { name: 'Referral Program', href: '#referral' },
    { name: 'Staking', href: '#staking' },
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Press Kit', href: '#press' },
    { name: 'Blog', href: '#blog' },
  ],
  resources: [
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
    { name: 'Tutorials', href: '#tutorials' },
    { name: 'Community', href: '#community' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'Compliance', href: '#compliance' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/nomatoken', name: 'Twitter' },
  { icon: Send, href: 'https://t.me/nomatoken', name: 'Telegram' },
  { icon: Youtube, href: 'https://youtube.com/nomatoken', name: 'YouTube' },
  { icon: Github, href: 'https://github.com/nomatoken', name: 'GitHub' },
];

export function Footer() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    }
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <footer className="bg-muted/20 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="py-16"
        >
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Brand & Newsletter */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              <Logo size="lg" />
              <p className="text-muted-foreground leading-relaxed">
                Democratizing real estate investment across Africa through blockchain technology. 
                Join the future of property ownership.
              </p>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Stay Updated</h3>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" className="gradient-primary text-white">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get the latest updates on new properties and features.
                  </p>
                </form>
              </div>

              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-noma-primary/10 hover:text-noma-primary transition-colors"
                    onClick={() => window.open(social.href, '_blank')}
                  >
                    <social.icon className="w-4 h-4" />
                    <span className="sr-only">{social.name}</span>
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Links */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Product</h3>
                  <ul className="space-y-2">
                    {footerLinks.product.map((link) => (
                      <li key={link.name}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Resources</h3>
                  <ul className="space-y-2">
                    {footerLinks.resources.map((link) => (
                      <li key={link.name}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Legal</h3>
                  <ul className="space-y-2">
                    {footerLinks.legal.map((link) => (
                      <li key={link.name}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <Separator className="my-8" />

          {/* Bottom Bar */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Nairobi, Kenya
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                hello@nomatoken.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +254 700 000 000
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Noma Token. All rights reserved.</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}