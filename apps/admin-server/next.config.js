/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '31450',
        pathname: '/images/**'
      }
    ]
  },
  transpilePackages: [],
};

module.exports = nextConfig;
