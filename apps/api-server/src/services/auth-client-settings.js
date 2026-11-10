const authSettings = require('../util/auth-settings');

const CACHE_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 3000;

function httpUrl(value) {
  try {
    const parsed = new URL(value || '');
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.href
      : '';
  } catch {
    return '';
  }
}

function fromClient(client) {
  const clientConfig = (client && client.config) || {};
  return {
    url: httpUrl(
      client.clientDisclaimerUrl || clientConfig.clientDisclaimerUrl
    ),
    linkText:
      client.clientDisclaimerText || clientConfig.clientDisclaimerText || '',
    label:
      clientConfig.requiredFields?.requiredUserFieldsLabels?.privacyConsent ||
      '',
    logo: httpUrl(clientConfig.styling?.logo),
  };
}

function createAuthClientSettings({
  settings = authSettings,
  ttlMs = CACHE_TTL_MS,
  timeoutMs = TIMEOUT_MS,
  now = Date.now,
} = {}) {
  const cache = new Map();

  async function load(project) {
    const authConfig = await settings.config({ project, useAuth: 'default' });
    if (!authConfig.clientId) return null;
    const adapter = await settings.adapter({ authConfig });
    if (!adapter.service || !adapter.service.fetchClient) return null;
    const client = await adapter.service.fetchClient({ authConfig, project });
    return client ? fromClient(client) : null;
  }

  function withTimeout(promise) {
    let timer;
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`no answer within ${timeoutMs}ms`)),
        timeoutMs
      );
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  return async function authClientSettingsFor(project) {
    const cached = cache.get(project.id);
    if (cached && cached.expiresAt > now()) return cached.value;

    let value = null;
    try {
      value = await withTimeout(load(project));
    } catch (err) {
      console.error(
        `[auth-client-settings] loading the authentication settings failed: projectId=${project.id} error=${err.message}`
      );
    }
    cache.set(project.id, { value, expiresAt: now() + ttlMs });
    return value;
  };
}

module.exports = {
  createAuthClientSettings,
  authClientSettingsFor: createAuthClientSettings(),
};
