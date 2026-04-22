function getParentDomains(hostname) {
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  const parents = [];
  for (let i = 1; i < parts.length - 1; i++) {
    parents.push(parts.slice(i).join('.'));
  }
  return parents;
}

function parseHost(value) {
  if (!value) return null;
  if (value.indexOf('http') !== 0) value = 'https://' + value;
  return new URL(value).host;
}

const prefillAllowedDomains = function (allowedDomains, projectUrl) {
  try {
    if (projectUrl) {
      allowedDomains.push(parseHost(projectUrl));
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
      const host = parseHost(envVar);
      if (host) {
        allowedDomains.push(host);
        for (const parent of getParentDomains(host)) {
          allowedDomains.push(parent);
        }
      }
    }
  } catch (err) {
    console.error('Error processing allowed domains:', err);
    return [...new Set(allowedDomains)];
  }

  return [...new Set(allowedDomains)];
};

module.exports = prefillAllowedDomains;
