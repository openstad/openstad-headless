/**
 * Auth-client sync service.
 *
 * Business logic for syncing project auth-provider config with external auth
 * clients during project create/duplicate. Extracted from
 * routes/api/project.js (#1640). These functions operate on plain config
 * objects / ids (no Express `req`), so they are unit-testable.
 */
const merge = require('merge');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const db = require('../db');
const authSettings = require('../util/auth-settings');
const hasRole = require('../lib/sequelize-authorization/lib/hasRole');

// Build the per-provider auth config to sync, fetching current client data from
// the source project's providers where available.
async function buildAuthProviderSyncConfig({
  sourceProject,
  fallbackProviderConfig = {},
}) {
  const providerConfigForSync = merge.recursive(
    {},
    fallbackProviderConfig || {}
  );
  if (!sourceProject) return providerConfigForSync;

  const providers = await authSettings.providers({
    project: sourceProject,
    useOnlyDefinedOnProject: true,
  });

  for (const provider of providers) {
    const authConfig = await authSettings.config({
      project: sourceProject,
      useAuth: provider,
    });
    const adapter = await authSettings.adapter({ authConfig });
    const base = providerConfigForSync[provider] || {};

    if (adapter.service.fetchClient) {
      const client = await adapter.service.fetchClient({
        authConfig,
        project: sourceProject,
      });
      providerConfigForSync[provider] = {
        ...base,
        config: client?.config || base.config || {},
        authTypes: client?.authTypes || base.authTypes,
        requiredUserFields:
          client?.requiredUserFields || base.requiredUserFields,
        twoFactorRoles: client?.twoFactorRoles || base.twoFactorRoles,
        allowedDomains: client?.allowedDomains || base.allowedDomains,
      };
    } else {
      providerConfigForSync[provider] = base;
    }
  }

  return providerConfigForSync;
}

// Whether `user` may duplicate from the given source project.
async function canUserUseSourceProjectForDuplication({
  user,
  sourceProjectId,
}) {
  if (!sourceProjectId) return true;
  if (hasRole(user, 'superuser')) return true;

  const identifier = user?.idpUser?.identifier;
  const provider = user?.idpUser?.provider;
  if (!identifier || !provider) return false;

  const sourceProjectUser = await db.User.findOne({
    where: {
      projectId: sourceProjectId,
      idpUser: { identifier, provider },
      [Op.or]: [{ role: 'admin' }, { role: 'editor' }],
    },
  });

  return !!sourceProjectUser;
}

// Strip project-specific credentials/provider ids so a duplicate regenerates them.
function sanitizeAuthConfigForDuplication(config = {}) {
  const sanitizedConfig = merge.recursive({}, config || {});
  const auth =
    sanitizedConfig && sanitizedConfig.auth ? sanitizedConfig.auth : {};
  const providers = auth && auth.provider ? auth.provider : {};

  Object.keys(providers).forEach((providerKey) => {
    const providerConfig = providers[providerKey];
    if (!providerConfig || typeof providerConfig !== 'object') return;

    // Project-specific credentials and provider IDs must be regenerated.
    delete providerConfig.clientId;
    delete providerConfig.clientSecret;
    delete providerConfig.client;
    delete providerConfig.authProviderId;

    if (providerConfig.config && typeof providerConfig.config === 'object') {
      delete providerConfig.config.clientId;
      delete providerConfig.config.clientSecret;
      delete providerConfig.config.authProviderId;
    }
  });

  return sanitizedConfig;
}

// Remove auth-client-managed fields from project config before persisting.
function stripAuthClientManagedFieldsFromProjectConfig(config = {}) {
  if (!config || !config.auth || !config.auth.provider) return config;

  const providersForConfigStrip = config._providersForConfigStrip || {};

  Object.keys(config.auth.provider).forEach((providerKey) => {
    const providerConfig = config.auth.provider[providerKey];
    if (!providerConfig || typeof providerConfig !== 'object') return;

    // These fields are managed by auth clients and should not be persisted
    // in project config; includeAuthConfig can fetch them from auth server.
    delete providerConfig.client;
    delete providerConfig.name;
    delete providerConfig.description;
    delete providerConfig.siteUrl;
    delete providerConfig.allowedDomains;
    // Strip provider config only for providers that support client sync.
    // For providers without fetch/update client support (e.g. some OIDC setups),
    // provider.config remains source of truth and must be preserved.
    if (providersForConfigStrip[providerKey]) {
      delete providerConfig.config;
    }
  });

  delete config._providersForConfigStrip;

  return config;
}

module.exports = {
  buildAuthProviderSyncConfig,
  canUserUseSourceProjectForDuplication,
  sanitizeAuthConfigForDuplication,
  stripAuthClientManagedFieldsFromProjectConfig,
};
