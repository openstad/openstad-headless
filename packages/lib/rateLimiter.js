const rateLimit = require('express-rate-limit');

// Normalize an IPv4-mapped IPv6 address (e.g. "::ffff:192.168.1.1") to its
// bare IPv4 form. Returns the input unchanged when there is nothing to strip.
function normalizeIp(address) {
  if (typeof address !== 'string') return '';
  const mapped = address.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  return mapped ? mapped[1] : address;
}

// Determine whether an IP address is private/internal: RFC 1918 ranges,
// loopback, link-local and IPv6 unique-local/link-local. Used to skip rate
// limiting for internal traffic. Replaces the unmaintained `ip` package.
function isPrivateIp(address) {
  const addr = normalizeIp(address);
  if (!addr) return false;

  if (addr.includes('.')) {
    const parts = addr.split('.').map(Number);
    if (
      parts.length !== 4 ||
      parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)
    ) {
      return false;
    }
    const [a, b] = parts;
    return (
      a === 10 || // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      a === 127 || // 127.0.0.0/8 loopback
      (a === 169 && b === 254) // 169.254.0.0/16 link-local
    );
  }

  const lower = addr.toLowerCase();
  if (lower === '::1') return true; // loopback
  const hextet = lower.split('%')[0]; // strip zone id
  return (
    /^f[cd][0-9a-f]{2}:/.test(hextet) || // fc00::/7 unique-local
    /^fe[89ab][0-9a-f]:/.test(hextet) // fe80::/10 link-local
  );
}

function rateLimiter() {
  return rateLimit({
    windowMs: process.env.RATE_WINDOW_MS
      ? parseInt(process.env.RATE_WINDOW_MS, 10)
      : 60 * 1000,
    max: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT, 10) : 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
      // Skip rate limiting for private IPs and localhost
      return isPrivateIp(req.ip) || req.ip === '::1';
    },
  });
}

module.exports = rateLimiter;
module.exports.isPrivateIp = isPrivateIp;
module.exports.normalizeIp = normalizeIp;
