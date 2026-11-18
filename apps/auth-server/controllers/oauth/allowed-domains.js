'use strict';

const {
  parseHost,
  getParentDomains,
  addWithParents,
} = require('@openstad-headless/lib/allowed-domains');

const prefillAllowedDomains = function (inputDomains) {
  const allowedDomains = [...(inputDomains || [])];
  try {
    const configuredHosts = allowedDomains
      .map((d) => parseHost(d))
      .filter(Boolean);
    for (const host of configuredHosts) {
      addWithParents(allowedDomains, host);
    }

    const envVars = [
      process.env.BASE_DOMAIN,
      process.env.APP_URL,
      process.env.CMS_URL,
      process.env.API_URL,
      process.env.ADMIN_URL,
    ];

    for (const envVar of envVars) {
      if (!envVar) continue;
      addWithParents(allowedDomains, parseHost(envVar));
    }
  } catch (err) {
    console.error('Error processing allowed domains:', err);
    return [...new Set(allowedDomains)];
  }

  return [...new Set(allowedDomains)];
};

module.exports = {
  parseHost,
  getParentDomains,
  addWithParents,
  prefillAllowedDomains,
};
