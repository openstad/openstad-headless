/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["@openstad/comments"]);

const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
