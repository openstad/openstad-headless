const rateLimit = require('express-rate-limit');

function rateLimiter() {
    return rateLimit({
        windowMs: process.env.RATE_WINDOW_MS ? parseInt(process.env.RATE_WINDOW_MS, 10) : 60 * 1000,
        max: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT, 10) : 100,
    });
}

module.exports = rateLimiter;