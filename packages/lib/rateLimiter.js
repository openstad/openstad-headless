const rateLimit = require('express-rate-limit');
const ip = require('ip');

function rateLimiter() {
    return rateLimit({
        windowMs: process.env.RATE_WINDOW_MS ? parseInt(process.env.RATE_WINDOW_MS, 10) : 60 * 1000,
        max: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT, 10) : 100,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req, res) => {
            console.log ('rate limit skip > IP:', req.ip, req.url);
            // Skip rate limiting for private IPs and localhost
            return ip.isPrivate(req.ip) || req.ip === '::1';
        }
    });
}

module.exports = rateLimiter;
