'use strict';

var path = require('path');
var log = require('debug')('app:http');

/**
 * Initializes the plugin loader and collects middleware + routes from all
 * plugins that expose an `api` section.
 *
 * @returns {{ pluginMiddleware: object, pluginRoutes: Array }}
 */
function initPluginLoader() {
  var pluginMiddleware = {
    'before:statics': [],
    'after:basic': [],
    'after:session': [],
    'before:routes': [],
    'after:routes': [],
  };
  var pluginRoutes = [];

  try {
    var PluginLoader = require('@openstad-headless/plugin-loader');
    var pluginLoader = PluginLoader.getInstance();
    pluginLoader.load();

    for (var plugin of pluginLoader.getApiHooks()) {
      var pluginPkg = require.resolve(plugin.packageName);
      var pluginDir = path.dirname(pluginPkg);

      // Collect middleware by position
      if (plugin.api.middleware) {
        for (var mw of plugin.api.middleware) {
          var position = mw.position || 'before:routes';
          if (pluginMiddleware[position]) {
            pluginMiddleware[position].push({
              handler: require(path.join(pluginDir, mw.path)),
              priority: mw.priority || 100,
              pluginName: plugin.name,
            });
          }
        }
      }
      // Collect routes
      if (plugin.api.routes) {
        var pluginContext = { config: plugin.config, pluginName: plugin.name };

        for (var route of plugin.api.routes) {
          var handlerModule = require(path.join(pluginDir, route.handler));

          // Convention: if a handler module sets `module.exports.createHandler`,
          // it is a factory that receives the plugin context (config, name).
          // Otherwise, the export is used directly as an Express handler.
          var handler =
            typeof handlerModule.createHandler === 'function'
              ? handlerModule.createHandler(pluginContext)
              : handlerModule;

          pluginRoutes.push({
            method: route.method || 'use',
            path: route.path,
            handler: handler,
            pluginName: plugin.name,
          });
        }
      }
    }
    // Sort middleware by priority (lower = earlier)
    Object.keys(pluginMiddleware).forEach(function (pos) {
      pluginMiddleware[pos].sort(function (a, b) {
        return a.priority - b.priority;
      });
    });
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(
        '[plugin-loader] Error loading plugin API hooks:',
        err.message
      );
    }
  }

  return { pluginMiddleware, pluginRoutes };
}

/**
 * Returns a helper function that applies plugin middleware for a given position.
 *
 * @param {object} app - Express app
 * @param {object} pluginMiddleware - Middleware grouped by position
 * @returns {function(string): void}
 */
function createMiddlewareApplier(app, pluginMiddleware) {
  return function applyPluginMiddleware(position) {
    var items = pluginMiddleware[position] || [];
    for (var i = 0; i < items.length; i++) {
      try {
        app.use(items[i].handler);
        log('plugin middleware loaded: %s (%s)', items[i].pluginName, position);
      } catch (err) {
        console.error(
          '[plugin-loader] Failed to apply middleware from "' +
            items[i].pluginName +
            '":',
          err.message
        );
      }
    }
  };
}

module.exports = { initPluginLoader, createMiddlewareApplier };
