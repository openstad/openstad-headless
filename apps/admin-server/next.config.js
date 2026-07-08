const path = require('path');

/** @type {import('next').NextConfig} */

const adminRemotePattern = (() => {
  const url = new URL(process.env.ADMIN_URL || 'http://localhost');
  const pattern = {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
  };
  if (url.port) pattern.port = url.port;
  return pattern;
})();

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@openstad-headless/*'],
  images: {
    remotePatterns: [adminRemotePattern],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Date', value: '' }],
      },
    ];
  },
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
