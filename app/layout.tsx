import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Web3Provider } from '@/components/providers/web3-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Noma Token - Real Estate Tokenization Platform',
  description: 'Own fractional real estate through blockchain technology. +2000% growth, $1M+ volume across African markets.',
  keywords: ['real estate', 'tokenization', 'blockchain', 'DeFi', 'Africa', 'property investment'],
  authors: [{ name: 'Noma Token' }],
  icons: {
    icon: '/assets/nomacoin.png',
    shortcut: '/assets/nomacoin.png',
    apple: '/assets/nomacoin.png',
  },
  openGraph: {
    title: 'Noma Token - Real Estate Tokenization Platform',
    description: 'Own fractional real estate through blockchain technology',
    type: 'website',
    locale: 'en_US',
    images: ['/assets/NOMA CHAIN LOGO Compressed.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-inter antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Web3Provider>
            {children}
            <Toaster position="top-right" />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}