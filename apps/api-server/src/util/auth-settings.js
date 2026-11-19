const path = require('node:path');
const config = require('config');
const merge = require('merge');

// Project (database) config is untrusted: userMapping from it is never
// evaluated. Only plain property names are honoured, as real functions, so
// map-user-data never sees them as strings. Defaults/env mappings stay as-is.
const PROP_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const UNSAFE_PROPS = ['__proto__', 'constructor', 'prototype'];

function safeProjectUserMapping(raw) {
  if (typeof raw == 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (err) {
      raw = null;
    }
  }
  const safe = {};
  if (!raw || typeof raw != 'object') return safe;
  for (const [key, value] of Object.entries(raw)) {
    if (
      typeof value == 'string' &&
      PROP_NAME.test(value) &&
      !UNSAFE_PROPS.includes(value)
    ) {
      safe[key] = (user) => user[value];
    } else {
      console.warn(
        `[auth-settings] ignoring invalid project userMapping entry "${String(key).slice(0, 50)}"`
      );
    }
  }
  return safe;
}

// Removes userMapping from a project auth config and returns the safe part.
function takeProjectUserMappings(projectAuth) {
  const taken = { provider: {}, adapter: {} };
  for (const group of ['provider', 'adapter']) {
    for (const [name, entry] of Object.entries(projectAuth[group] || {})) {
      if (!entry || typeof entry != 'object' || !('userMapping' in entry))
        continue;
      taken[group][name] = safeProjectUserMapping(entry.userMapping);
      delete entry.userMapping;
    }
  }
  return taken;
}

let createProjectConfig = function ({
  project,
  useOnlyDefinedOnProject = false,
}) {
  let defaultConfig = (config && config.auth) || {};
  let temp = { provider: {}, adapter: {} };
  Object.keys(defaultConfig.provider).map((key) => (temp.provider[key] = {})); // todo: defaultConfig is non-extensible, that's why this very not robust fix
  let apiAuthConfig = merge.recursive(temp, defaultConfig);

  let projectSpecificConfig = merge.recursive(
    true,
    (project && project.config && project.config.auth) || {}
  );
  let projectUserMappings = takeProjectUserMappings(projectSpecificConfig);
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

  Object.defineProperty(mergedConfig, 'projectUserMappings', {
    value: projectUserMappings,
    enumerable: false,
  });

  return mergedConfig;
};

let getConfig = async function ({ project, useAuth = 'default' }) {
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

  const projectMapping = {
    ...projectConfig.projectUserMappings.adapter[providerConfig.adapter],
    ...projectConfig.projectUserMappings.provider[useAuth],
  };
  if (Object.keys(projectMapping).length) {
    let base = authConfig.userMapping;
    if (typeof base == 'string') {
      try {
        base = JSON.parse(base);
      } catch (err) {
        base = {};
      }
    }
    authConfig.userMapping = { ...base, ...projectMapping };
  }

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
};
