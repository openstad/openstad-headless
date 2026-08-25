'use strict';

/**
 * Centrale redirect-URI policy.
 *
 * Eén plek voor de allowlist-opbouw (voorheen gedupliceerd in
 * controllers/oauth/oauth2.js en controllers/auth/local.js) en voor de
 * validatie van redirect-URI's die via de query of uit opgeslagen
 * configuratie (client.redirectUrl, config.logoutUrl) binnenkomen.
 */

const URL = require('url').URL;

const MAX_URI_LENGTH = 2000;
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

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

/**
 * Bouwt de volledige allowlist op uit de geregistreerde client-domeinen,
 * aangevuld met parent-domeinen en de platform-URL's uit de environment.
 * Let op: het toevoegen van parent-domeinen (foo.example.nl -> example.nl)
 * is bewust compatibiliteitsgedrag; het is ruimer dan exacte registratie.
 */
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

function invalid(reason, fieldName) {
  const err = new Error(`Invalid ${fieldName}: ${reason}`);
  err.status = 400;
  return err;
}

/**
 * Valideert een redirect-URI tegen de policy en de client-allowlist.
 *
 * - afwezig (undefined/null/'') -> null; de aanroeper mag terugvallen op een default
 * - geldig -> de URI (string)
 * - ongeldig -> gooit een Error met status 400
 */
function validateRedirectUri(value, client, fieldName = 'redirect_uri') {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value !== 'string') {
    throw invalid('must be a single string value', fieldName);
  }
  if (value.length > MAX_URI_LENGTH) {
    throw invalid('exceeds maximum length', fieldName);
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw invalid('must be an absolute URL', fieldName);
  }

  const isLocalhost = LOCAL_HOSTNAMES.includes(url.hostname);
  if (url.protocol !== 'https:') {
    const httpAllowed =
      url.protocol === 'http:' &&
      (isLocalhost || process.env.NODE_ENV !== 'production');
    if (!httpAllowed) {
      throw invalid(`protocol ${url.protocol} is not allowed`, fieldName);
    }
  }
  if (url.username || url.password) {
    throw invalid('must not contain credentials', fieldName);
  }
  if (url.hash) {
    throw invalid('must not contain a fragment', fieldName);
  }

  const allowedDomains = prefillAllowedDomains(
    (client && client.allowedDomains) || []
  );
  if (allowedDomains.indexOf(url.host) === -1) {
    throw invalid('host is not in the allowed domains', fieldName);
  }

  return value;
}

/**
 * Lenient variant voor flows waar een ongeldige waarde niet hard mag falen
 * (zoals logout en opgeslagen fallbacks): geldig -> de URI, anders null.
 */
function safeRedirectUri(value, client, fieldName = 'redirect_uri') {
  try {
    return validateRedirectUri(value, client, fieldName);
  } catch {
    return null;
  }
}

module.exports = {
  parseHost,
  getParentDomains,
  addWithParents,
  prefillAllowedDomains,
  validateRedirectUri,
  safeRedirectUri,
};
