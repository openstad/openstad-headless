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
};

module.exports = nextConfig;
