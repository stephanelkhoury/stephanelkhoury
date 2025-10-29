import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Exclude upcoming-projects from compilation
  webpack: (config, { isServer }) => {
    // Ignore upcoming-projects directory during build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/upcoming-projects/**',
        '**/.git/**',
        '**/.next/**',
      ],
    };
    
    return config;
  },
  // Exclude upcoming-projects from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    dirs: ['src'], // Only run ESLint on src directory
  },
};

export default nextConfig;
