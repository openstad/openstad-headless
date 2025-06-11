const rateLimiters = {};

function rateLimiter({
    limit = process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT, 10) : 100,
    windowMs = process.env.RATE_WINDOW_MS ? parseInt(process.env.RATE_WINDOW_MS, 10) : 60000
} = {}) {
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();

        if (!rateLimiters[ip]) {
            rateLimiters[ip] = { count: 1, startTime: now };
        } else {
            const current = rateLimiters[ip];
            if (now - current.startTime < windowMs) {
                current.count++;
            } else {
                rateLimiters[ip] = { count: 1, startTime: now };
            }
        }

        if (rateLimiters[ip].count > limit) {
            return res.status(429).send('Too many requests. Please try again later.');
        }

        next();
    };
}

module.exports = rateLimiter;