/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@openstad-headless/*'],
  images: { domains: ['localhost', 'localhost:31470'] },
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
};

module.exports = nextConfig;
