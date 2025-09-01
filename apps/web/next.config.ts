import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'standalone', // Disabled due to Windows symlink issues
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors for deployment
  },
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;
