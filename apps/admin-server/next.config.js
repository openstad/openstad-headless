/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@openstad-headless/*'
  ],
};

module.exports = nextConfig;
