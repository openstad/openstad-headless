const path = require('node:path');
const config = require('config');
const merge = require('merge');

let createProjectConfig = function ({
  project,
  useOnlyDefinedOnProject = false,
}) {
  let defaultConfig = (config && config.auth) || {};
  let temp = { provider: {}, adapter: {} };
  Object.keys(defaultConfig.provider).map((key) => (temp.provider[key] = {})); // todo: defaultConfig is non-extensible, that's why this very not robust fix
  let apiAuthConfig = merge.recursive(temp, defaultConfig);

  let projectSpecificConfig =
    (project && project.config && project.config.auth) || {};
  let mergedConfig = merge.recursive({}, apiAuthConfig, projectSpecificConfig);

  if (useOnlyDefinedOnProject) {
    // use only providers that are configured on the project, but fallback on defaults if nothing is defined on the project
    let projectProviders = Object.keys(projectSpecificConfig.provider || {});
    if (projectProviders.length > 0) {
      let mergedProviders = Object.keys(mergedConfig.provider || {});
      mergedProviders.map((target) => {
        if (!projectProviders.find((p) => p == target)) {
          delete mergedConfig.provider[target];
        }
      });
    }
  }

  return mergedConfig;
};

let collectJwtSecrets = function (authConfig) {
  if (!authConfig || typeof authConfig !== 'object') return [];

  const secrets = [];
  if (typeof authConfig.jwtSecret !== 'undefined') {
    secrets.push(authConfig.jwtSecret);
  }

  ['provider', 'adapter'].forEach((group) => {
    const entries = authConfig[group];
    if (!entries || typeof entries !== 'object') return;
    Object.keys(entries).forEach((name) => {
      const entry = entries[name];
      if (entry && typeof entry.jwtSecret !== 'undefined') {
        secrets.push(entry.jwtSecret);
      }
    });
  });

  return secrets;
};

let hasJwtSecretOverride = function (project) {
  const globalJwtSecret =
    (config && config.auth && config.auth.jwtSecret) || null;
  const projectAuth = project && project.config && project.config.auth;

  return collectJwtSecrets(projectAuth).some(
    (secret) => secret !== globalJwtSecret
  );
};

let getConfig = async function ({ project, useAuth = 'default' }) {
  if (hasJwtSecretOverride(project)) {
    getConfig._jwtOverridesReported =
      getConfig._jwtOverridesReported || new Set();
    if (!getConfig._jwtOverridesReported.has(project.id)) {
      console.error(
        `[${new Date().toISOString()}][auth-settings] project ${project.id} overrides config.auth.jwtSecret; tokens are minted with that secret but verified with the global one, so logins for this project will fail`
      );
      getConfig._jwtOverridesReported.add(project.id);
    }
  }

  let projectConfig = createProjectConfig({ project });

  if (useAuth == 'default' && projectConfig.default)
    useAuth = projectConfig.default;

  let authConfig = {
    provider: useAuth,
    jwtSecret: projectConfig.jwtSecret,
  };

  let providerConfig = projectConfig.provider[useAuth] || {};
  let adapterConfig = projectConfig.adapter[providerConfig.adapter] || {};
  authConfig = merge.recursive(authConfig, adapterConfig);
  authConfig = merge.recursive(authConfig, providerConfig);

  if (!authConfig.jwtSecret || authConfig.jwtSecret == 'REPLACE THIS VALUE!!') {
    if (!getConfig._jwtWarningShown) {
      console.warn(
        `[${new Date().toISOString()}][auth-settings] jwtSecret is not configured - this must be fixed`
      );
      getConfig._jwtWarningShown = true;
    }
  }

  return authConfig;
};

let getAdapter = async function ({ authConfig, project, useAuth = 'default' }) {
  authConfig = authConfig || (await getConfig({ project, useAuth }));

  try {
    let adapter = await require(
      path.normalize(__dirname + '/../..') + '/' + authConfig.modulePath
    );
    return adapter;
  } catch (err) {
    console.log(err);
    throw new Error('Adapter not found');
  }
};

let getProviders = async function ({
  project,
  useOnlyDefinedOnProject = false,
}) {
  let projectConfig = createProjectConfig({ project, useOnlyDefinedOnProject });
  let providers = Object.keys(projectConfig.provider);

  return providers;
};

module.exports = {
  config: getConfig,
  adapter: getAdapter,
  providers: getProviders,
  hasJwtSecretOverride,
};
