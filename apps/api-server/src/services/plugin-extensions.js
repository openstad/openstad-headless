'use strict';

const fs = require('fs');
const path = require('path');

const CORE_TEMPLATE_DIRECTORY = path.join(
  __dirname,
  '../notifications/default-templates'
);
const RESERVED_SOURCE_KEY = 'openstad';

function logSkip(pluginName, what, reason) {
  console.error(
    '[plugin-extensions] Skipping ' +
      what +
      ' of plugin "' +
      pluginName +
      '": ' +
      reason
  );
}

function hasFunctions(implementation, names) {
  return (
    !!implementation &&
    names.every((name) => typeof implementation[name] === 'function')
  );
}

function loadImplementation(plugin, relPath, context, resolvePluginFile) {
  const file = resolvePluginFile(plugin.dir, relPath);
  if (!file) return null;
  const handlerModule = require(file);
  return typeof handlerModule.createHandler === 'function'
    ? handlerModule.createHandler(context)
    : handlerModule;
}

function coreTemplateExists(type) {
  return fs.existsSync(
    path.join(CORE_TEMPLATE_DIRECTORY, path.basename(type || ''))
  );
}

function buildExtensions(plugins, services, resolvePluginFile) {
  let linkRequestHandler = null;
  const contactHandlers = new Map();
  const sources = new Map();
  const notificationTypes = new Map();

  for (const plugin of plugins) {
    const api = plugin.api || {};
    const context = {
      config: plugin.config,
      pluginName: plugin.name,
      services,
    };
    const load = (relPath) =>
      loadImplementation(plugin, relPath, context, resolvePluginFile);

    if (api.linkRequestHandler && linkRequestHandler) {
      logSkip(
        plugin.name,
        'link request handler',
        'another plugin already provides one'
      );
    } else if (api.linkRequestHandler) {
      const implementation = load(api.linkRequestHandler.handler);
      if (!implementation) {
        logSkip(
          plugin.name,
          'link request handler',
          'handler escapes the plugin directory'
        );
      } else if (
        !hasFunctions(implementation, ['submit', 'getPendingSelection'])
      ) {
        logSkip(
          plugin.name,
          'link request handler',
          'submit and getPendingSelection are required'
        );
      } else {
        linkRequestHandler = {
          pluginName: plugin.name,
          ...pick(implementation, ['submit', 'getPendingSelection']),
        };
      }
    }

    for (const entry of api.contactHandlers || []) {
      const what = 'contact handler "' + entry.key + '"';
      if (contactHandlers.has(entry.key)) {
        logSkip(plugin.name, what, 'key already registered');
        continue;
      }
      const implementation = load(entry.handler);
      if (!implementation) {
        logSkip(plugin.name, what, 'handler escapes the plugin directory');
      } else if (!hasFunctions(implementation, ['handle'])) {
        logSkip(plugin.name, what, 'handle is required');
      } else {
        contactHandlers.set(entry.key, {
          key: entry.key,
          label: entry.label,
          pluginName: plugin.name,
          ...pick(implementation, ['handle']),
        });
      }
    }

    for (const entry of api.sources || []) {
      const what = 'source "' + entry.key + '"';
      if (entry.key === RESERVED_SOURCE_KEY) {
        logSkip(plugin.name, what, 'key is reserved');
        continue;
      }
      if (sources.has(entry.key)) {
        logSkip(plugin.name, what, 'key already registered');
        continue;
      }
      const implementation = load(entry.handler);
      if (!implementation) {
        logSkip(plugin.name, what, 'handler escapes the plugin directory');
      } else if (!hasFunctions(implementation, ['search', 'get'])) {
        logSkip(plugin.name, what, 'search and get are required');
      } else {
        sources.set(entry.key, {
          key: entry.key,
          label: entry.label,
          pluginName: plugin.name,
          ...pick(implementation, ['search', 'get']),
        });
      }
    }

    for (const entry of api.notifications || []) {
      const what = 'notification type "' + entry.type + '"';
      if (coreTemplateExists(entry.type)) {
        logSkip(plugin.name, what, 'core already defines this type');
        continue;
      }
      if (notificationTypes.has(entry.type)) {
        logSkip(plugin.name, what, 'type already registered');
        continue;
      }
      const templatePath = resolvePluginFile(plugin.dir, entry.template);
      if (!templatePath) {
        logSkip(plugin.name, what, 'template escapes the plugin directory');
        continue;
      }
      notificationTypes.set(entry.type, {
        type: entry.type,
        label: entry.label,
        templatePath,
        immediate: entry.immediate === true,
        pluginName: plugin.name,
      });
    }
  }

  return {
    getLinkRequestHandler: () => linkRequestHandler,
    getContactHandler: (key) => contactHandlers.get(key) || null,
    getSource: (key) => sources.get(key) || null,
    getNotificationType: (type) => notificationTypes.get(type) || null,
    getCapabilities: () => ({
      linkRequests: !!linkRequestHandler,
      contactHandlers: [...contactHandlers.values()].map(({ key, label }) => ({
        key,
        label,
      })),
      sources: [...sources.values()].map(({ key, label }) => ({ key, label })),
      notificationTypes: [...notificationTypes.values()].map(
        ({ type, label }) => ({ type, label })
      ),
    }),
  };
}

function pick(implementation, names) {
  return Object.fromEntries(
    names.map((name) => [name, implementation[name].bind(implementation)])
  );
}

let extensions = buildExtensions([], {}, () => null);

function init() {
  try {
    const PluginLoader = require('@openstad-headless/plugin-loader');
    const pluginLoader = PluginLoader.getInstance();
    pluginLoader.load();

    const plugins = pluginLoader.getApiHooks().map((plugin) => ({
      name: plugin.name,
      config: plugin.config,
      dir: path.dirname(require.resolve(plugin.packageName)),
      api: plugin.api,
    }));

    extensions = buildExtensions(
      plugins,
      { resourceLinks: require('./resource-links') },
      PluginLoader.resolvePluginFile
    );
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(
        '[plugin-extensions] Error loading plugin extensions:',
        err.message
      );
    }
  }
  return extensions;
}

function get() {
  return extensions;
}

module.exports = { buildExtensions, init, get };
