/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to prevent duplicate API calls in development
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react']
  },
  // Turbopack configuration for Next.js 16
  turbopack: {},
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Bundle analysis and optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }
    return config
  },
  // Enable compression
  compress: true,
  // Performance monitoring
  poweredByHeader: false
}

module.exports = nextConfig
