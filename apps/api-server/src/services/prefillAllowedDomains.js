const {
  parseHost,
  addWithParents,
} = require('@openstad-headless/lib/allowed-domains');

const prefillAllowedDomains = function (inputDomains, projectUrl) {
  const allowedDomains = [...(inputDomains || [])];
  try {
    const configuredHosts = allowedDomains
      .map((d) => parseHost(d))
      .filter(Boolean);
    for (const host of configuredHosts) {
      addWithParents(allowedDomains, host);
    }

    if (projectUrl) {
      addWithParents(allowedDomains, parseHost(projectUrl));
    }

    const envVars = [
      process.env.BASE_DOMAIN,
      process.env.URL,
      process.env.CMS_URL,
      process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL,
      process.env.ADMIN_DOMAIN,
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

module.exports = prefillAllowedDomains;
