'use strict';

const URL = require('url').URL;

function parseHost(value) {
  if (!value) return null;
  try {
    if (value.indexOf('http') !== 0) value = 'https://' + value;
    return new URL(value).host;
  } catch {
    return null;
  }
}

function getParentDomains(hostname) {
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  const parents = [];
  for (let i = 1; i < parts.length - 1; i++) {
    parents.push(parts.slice(i).join('.'));
  }
  return parents;
}

function addWithParents(list, host) {
  if (!host) return;
  list.push(host);
  for (const parent of getParentDomains(host)) {
    list.push(parent);
  }
}

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
