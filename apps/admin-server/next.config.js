/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@openstad-headless/*'
  ],
  images: {domains: ['localhost', "localhost:31470"]},
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health'
      },
    ]
  }
};

module.exports = nextConfig;
