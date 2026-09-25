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
// The client-side pre-check in src/lib/upload-limits.ts cannot read this env
// var (it is baked into the browser bundle at build time and never NEXT_PUBLIC_,
// see that file's comment), so it always assumes MAX_UPLOAD_SIZE_MB = 25. Keep
// this in sync with that constant. The proxy limit must never drop below this
// floor + headroom, or a file the client allows would exceed the proxy limit
// and be silently truncated by Next before reaching the image-server's real
// (lower) cap -- reintroducing the exact bug this fix addresses, just at a
// lower threshold.
const CLIENT_ASSUMED_MAX_UPLOAD_MB = 25;
// Headroom on top of the effective cap so an oversized request still reaches
// the image-server's multer check instead of being cut off by Next itself.
// Next.js has no proper "payload too large" response for proxyClientMaxBodySize:
// on overflow it silently ends the request stream (see body-streams.js), so a
// proxy limit equal to the cap would still fail with no error message. Setting
// it above the cap lets multer return a real 413 the UI can show.
const PROXY_BODY_SIZE_HEADROOM_MB = 10;
// Sane upper bound on the configured cap. Without this, a malformed or
// absurd env value (e.g. scientific notation like "1e21") can produce a
// proxy limit string Next.js's byte parser cannot read, silently collapsing
// the effective limit to near zero.
const MAX_SANE_FILE_UPLOAD_SIZE_MB = 1000;

// Derives the Next.js proxy body size limit from MAX_FILE_UPLOAD_SIZE_MB.
// Read at server start (admin-server runs `next start`, not `output: 'standalone'`,
// so this env var is not baked in at build time). Applies to every request this
// proxy handles, not just uploads.
function resolveProxyBodyLimit(envValue) {
  const parsed = Number(envValue);
  const capMb =
    Number.isInteger(parsed) &&
    parsed > 0 &&
    parsed <= MAX_SANE_FILE_UPLOAD_SIZE_MB
      ? parsed
      : DEFAULT_MAX_FILE_UPLOAD_SIZE_MB;
  const effectiveCapMb = Math.max(capMb, CLIENT_ASSUMED_MAX_UPLOAD_MB);
  return `${effectiveCapMb + PROXY_BODY_SIZE_HEADROOM_MB}mb`;
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
