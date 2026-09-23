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

// Default upload cap in MB, mirrors apps/image-server/server.js's own default.
const DEFAULT_MAX_FILE_UPLOAD_SIZE_MB = 25;
// Headroom on top of the cap so an oversized request still reaches the
// image-server's multer check instead of being cut off by Next itself.
// Next.js has no proper "payload too large" response for proxyClientMaxBodySize:
// on overflow it silently ends the request stream (see body-streams.js), so a
// proxy limit equal to the cap would still fail with no error message. Setting
// it above the cap lets multer return a real 413 the UI can show.
const PROXY_BODY_SIZE_HEADROOM_MB = 10;

// Derives the Next.js proxy body size limit from MAX_FILE_UPLOAD_SIZE_MB.
// Read at server start (admin-server runs `next start`, not `output: 'standalone'`,
// so this env var is not baked in at build time). Applies to every request this
// proxy handles, not just uploads.
function resolveProxyBodyLimit(envValue) {
  const parsed = Number(envValue);
  const capMb =
    Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_MAX_FILE_UPLOAD_SIZE_MB;
  return `${capMb + PROXY_BODY_SIZE_HEADROOM_MB}mb`;
}

const nextConfig = {
  poweredByHeader: false,
  experimental: {
    proxyClientMaxBodySize: resolveProxyBodyLimit(
      process.env.MAX_FILE_UPLOAD_SIZE_MB
    ),
  },
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
// Exposed separately for unit testing; Next.js ignores this extra property.
module.exports.resolveProxyBodyLimit = resolveProxyBodyLimit;
