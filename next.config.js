/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable static export for M-Pesa development
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
