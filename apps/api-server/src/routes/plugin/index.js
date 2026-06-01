'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');

var router = express.Router();

/**
 * GET /api/plugin/registry
 *
 * Returns a JSON object with all enabled plugins' admin metadata:
 * - pages: plugin admin pages
 * - menuItems: sidebar menu items
 * - widgetAdminComponents: widget config form metadata
 */
router.get('/registry', function (req, res) {
  var registry = {
    pages: [],
    menuItems: [],
    widgetAdminComponents: {},
  };

  try {
    var PluginLoader = require('@openstad-headless/plugin-loader');
    var pluginLoader = PluginLoader.getInstance();
    pluginLoader.load();

    var plugins = pluginLoader.getLoadedPlugins();

    for (var plugin of plugins) {
      var pluginName = plugin.name;

      // Admin pages
      if (plugin.admin && plugin.admin.pages) {
        for (var page of plugin.admin.pages) {
          if (!page.path) continue;

          // Derive label from menu items or plugin name
          var label = pluginName.charAt(0).toUpperCase() + pluginName.slice(1);
          if (plugin.admin.menuItems) {
            var menuItem = plugin.admin.menuItems.find(function (m) {
              return m.href === '/' + page.path;
            });
            if (menuItem) label = menuItem.label;
          }

          registry.pages.push({
            path: page.path,
            componentName: page.componentName || '',
            pluginName: pluginName,
            label: label,
          });
        }
      }

      // Menu items
      if (plugin.admin && plugin.admin.menuItems) {
        for (var item of plugin.admin.menuItems) {
          registry.menuItems.push({
            label: item.label,
            href: item.href,
            role: item.role || undefined,
          });
        }
      }

      // Widget admin components
      if (plugin.widgets) {
        for (var [widgetKey, widgetDef] of Object.entries(plugin.widgets)) {
          if (widgetDef.adminBundle) {
            registry.widgetAdminComponents[widgetKey] = {
              pluginName: pluginName,
              componentName: widgetDef.adminBundle.componentName,
              name: widgetDef.name || widgetKey,
              description: widgetDef.description || '',
              image: widgetDef.image || '',
            };
          }
        }
      }
    }
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error('[plugin-routes] Error building registry:', err.message);
    }
  }

  res.json(registry);
});

/**
 * POST /api/plugin/reload
 *
 * Reloads plugins from plugins.json without restarting the server.
 * Only affects registry metadata (pages, menu items, widget admin components).
 * Requires a valid API auth key (API_FIXED_AUTH_KEY).
 */
router.post('/reload', function (req, res) {
  // Require API auth key for reload
  var authKey =
    req.headers['x-authorization'] ||
    req.headers['authorization'] ||
    req.query.authKey;

  if (!authKey || authKey !== process.env.API_FIXED_AUTH_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var PluginLoader = require('@openstad-headless/plugin-loader');
    var pluginLoader = PluginLoader.getInstance();
    pluginLoader.reload();

    var plugins = pluginLoader.getLoadedPlugins();
    res.json({
      success: true,
      pluginsLoaded: plugins.length,
      plugins: plugins.map(function (p) {
        return p.name;
      }),
    });
  } catch (err) {
    console.error('[plugin-routes] Error reloading plugins:', err.message);
    res.status(500).json({ error: 'Failed to reload plugins' });
  }
});

/**
 * GET /api/plugin/bundle/:pluginName/:bundleType
 *
 * Serves a plugin's pre-built IIFE bundle.
 * - bundleType: "admin" or "widget-admin"
 * - Resolves the plugin package via require.resolve()
 * - Reads the bundle file path from the manifest
 * - Serves with appropriate Content-Type and cache headers
 */
router.get('/bundle/:pluginName/:bundleType', function (req, res) {
  var pluginName = req.params.pluginName;
  var bundleType = req.params.bundleType;

  if (!['admin', 'widget-admin'].includes(bundleType)) {
    return res.status(400).json({ error: 'Invalid bundle type' });
  }

  try {
    var PluginLoader = require('@openstad-headless/plugin-loader');
    var pluginLoader = PluginLoader.getInstance();
    pluginLoader.load();

    var plugins = pluginLoader.getLoadedPlugins();
    var plugin = plugins.find(function (p) {
      return p.name === pluginName;
    });

    if (!plugin) {
      return res.status(404).json({ error: 'Plugin not found or not enabled' });
    }

    // Resolve the plugin package root directory via package.json
    var pluginPkgJson = require.resolve(plugin.packageName + '/package.json');
    var pluginRoot = path.dirname(pluginPkgJson);

    var bundlePath;

    if (bundleType === 'admin') {
      // Admin page bundle: manifest.admin.bundle.js
      if (!plugin.admin || !plugin.admin.bundle || !plugin.admin.bundle.js) {
        return res
          .status(404)
          .json({ error: 'Plugin has no admin bundle configured' });
      }
      bundlePath = path.resolve(pluginRoot, plugin.admin.bundle.js);
    } else if (bundleType === 'widget-admin') {
      // Widget admin bundle: first widget's adminBundle.js
      // The widget key can be passed as a query param
      var widgetKey = req.query.widget;
      if (!widgetKey && plugin.widgets) {
        // Default to first widget that has an adminBundle
        for (var [key, def] of Object.entries(plugin.widgets)) {
          if (def.adminBundle && def.adminBundle.js) {
            widgetKey = key;
            break;
          }
        }
      }

      if (
        !widgetKey ||
        !plugin.widgets ||
        !plugin.widgets[widgetKey] ||
        !plugin.widgets[widgetKey].adminBundle
      ) {
        return res
          .status(404)
          .json({ error: 'Plugin has no widget admin bundle configured' });
      }

      bundlePath = path.resolve(
        pluginRoot,
        plugin.widgets[widgetKey].adminBundle.js
      );
    }

    // Path traversal protection: normalize and ensure resolved path stays within plugin root
    if (bundlePath) {
      bundlePath = path.normalize(bundlePath);
    }
    if (!bundlePath || !bundlePath.startsWith(pluginRoot + path.sep)) {
      return res.status(400).json({ error: 'Invalid bundle path' });
    }

    if (!fs.existsSync(bundlePath)) {
      return res.status(404).json({ error: 'Bundle file not found' });
    }

    // Serve the bundle using sendFile (non-blocking, streamed)
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
      'X-Plugin-Name': pluginName,
    });

    res.sendFile(bundlePath);
  } catch (err) {
    console.error(
      '[plugin-routes] Error serving bundle for "' + pluginName + '":',
      err.message
    );
    res.status(500).json({ error: 'Failed to load plugin bundle' });
  }
});

module.exports = router;
