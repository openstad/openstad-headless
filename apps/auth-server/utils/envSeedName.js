// Only seed environment-specific data when NODE_ENV is explicitly set.
module.exports = (env) => env || null;
