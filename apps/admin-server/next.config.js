const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@openstad-headless/*'],
  images: { domains: ['localhost', 'localhost:31470'] },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
  webpack(config) {
    // Resolve @openstad-headless packages from the monorepo packages dir,
    // which is mounted at ../../packages in both local dev and Docker.
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
      ...(config.resolve.modules || []),
    ];

    return config;
  },
};

module.exports = nextConfig;
