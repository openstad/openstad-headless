'use strict';

const fs = require('fs');
const path = require('path');
const { validateManifest } = require('./validate');

/** @type {PluginLoader | null} */
let instance = null;

/**
 * Manifest-driven plugin loader for OpenStad Headless.
 *
 * Reads a `plugins.json` file, resolves each enabled plugin via `require()`,
 * validates its manifest, and exposes hooks for the API, admin, CMS, and
 * widget systems.
 */
class PluginLoader {
  constructor() {
    /** @type {Array<object>} */
    this._plugins = [];
    /** @type {boolean} */
    this._loaded = false;
  }

  /**
   * Returns the singleton PluginLoader instance.
   * @returns {PluginLoader}
   */
  static getInstance() {
    if (!instance) {
      instance = new PluginLoader();
    }
    return instance;
  }

  /**
   * Resets the singleton instance. Intended for testing only.
   */
  static reset() {
    instance = null;
  }

  /**
   * Loads plugins from a `plugins.json` file.
   *
   * - Filters to `enabled: true` entries.
   * - Requires each plugin's npm package.
   * - Validates the plugin manifest.
   * - Checks that required env vars are present.
   * - A broken plugin is logged but never crashes the server.
   *
   * @param {string} [pluginsJsonPath] - Path to plugins.json.
   *   Defaults to `<repo-root>/plugins.json`.
   * @returns {void}
   */
  load(pluginsJsonPath) {
    if (this._loaded) return;
    this._loaded = true;

    let filePath = pluginsJsonPath;
    if (!filePath) {
      // Search up from __dirname to find plugins.json at the repo root
      let dir = __dirname;
      while (dir !== path.dirname(dir)) {
        const candidate = path.join(dir, 'plugins.json');
        if (fs.existsSync(candidate)) {
          filePath = candidate;
          break;
        }
        dir = path.dirname(dir);
      }
      if (!filePath) {
        filePath = path.resolve(__dirname, '../../plugins.json');
      }
    }

    let pluginsConfig;
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      pluginsConfig = JSON.parse(raw);
    } catch (err) {
      console.error(
        `[plugin-loader] Failed to read plugins.json at ${filePath}:`,
        err.message
      );
      return;
    }

    const entries = pluginsConfig.plugins || [];
    const enabledEntries = entries.filter((entry) => entry.enabled === true);

    for (const entry of enabledEntries) {
      const packageName = entry.packageName || entry.package;

      try {
        const pluginModule = require(packageName);
        const manifest = pluginModule.manifest || pluginModule;

        // Validate the manifest
        const validation = validateManifest(manifest);
        if (!validation.valid) {
          console.error(
            `[plugin-loader] Invalid manifest for "${packageName}":`,
            validation.errors.join('; ')
          );
          continue;
        }

        // Check required env vars
        if (
          manifest.api &&
          Array.isArray(manifest.api.envVars) &&
          manifest.api.envVars.length > 0
        ) {
          for (const envVar of manifest.api.envVars) {
            if (!process.env[envVar]) {
              console.warn(
                `[plugin-loader] Plugin "${manifest.name}" expects env var "${envVar}" but it is not set`
              );
            }
          }
        }

        this._plugins.push({
          ...manifest,
          packageName: packageName,
          config: entry.config || {},
        });
      } catch (err) {
        console.error(
          `[plugin-loader] Failed to load plugin "${packageName}":`,
          err.message
        );
      }
    }
  }

  /**
   * Returns plugins that expose an `api` section.
   * @returns {Array<{ name: string, version: string, config: object, api: object }>}
   */
  getApiHooks() {
    return this._plugins
      .filter((p) => p.api)
      .map((p) => ({
        name: p.name,
        version: p.version,
        packageName: p.packageName,
        config: p.config,
        api: p.api,
      }));
  }

  /**
   * Returns plugins that expose an `admin` section.
   * @returns {Array<{ name: string, version: string, config: object, admin: object }>}
   */
  getAdminHooks() {
    return this._plugins
      .filter((p) => p.admin)
      .map((p) => ({
        name: p.name,
        version: p.version,
        packageName: p.packageName,
        config: p.config,
        admin: p.admin,
      }));
  }

  /**
   * Merges all plugins' `widgets` entries into a single object.
   * Warns on key conflicts and skips duplicates (first plugin wins).
   *
   * @returns {object} Merged widget definitions keyed by widget name.
   */
  getWidgetDefinitions() {
    const merged = {};

    for (const plugin of this._plugins) {
      if (!plugin.widgets) continue;

      for (const [key, definition] of Object.entries(plugin.widgets)) {
        if (merged[key]) {
          console.warn(
            `[plugin-loader] Widget key "${key}" from plugin "${plugin.name}" conflicts with an existing widget — skipping`
          );
          continue;
        }
        merged[key] = definition;
      }
    }

    return merged;
  }

  /**
   * Returns plugins that expose a `cms` section.
   * @returns {Array<{ name: string, version: string, config: object, cms: object }>}
   */
  getCmsHooks() {
    return this._plugins
      .filter((p) => p.cms)
      .map((p) => ({
        name: p.name,
        version: p.version,
        packageName: p.packageName,
        config: p.config,
        cms: p.cms,
      }));
  }

  /**
   * Returns all loaded plugins.
   * @returns {Array<object>}
   */
  getLoadedPlugins() {
    return this._plugins;
  }
}

/**
 * Returns migration glob patterns from all loaded plugins that have
 * an `api.migrations.directory` configured.
 *
 * @param {string[]} [baseGlobs=['./migrations/*.js']] - Core migration globs.
 * @returns {string[]} Array of glob patterns including plugin migration dirs.
 */
function getPluginMigrationGlobs(baseGlobs) {
  const globs = baseGlobs ? [...baseGlobs] : ['./migrations/*.js'];

  try {
    const loader = PluginLoader.getInstance();
    loader.load();

    for (const plugin of loader.getApiHooks()) {
      if (plugin.api.migrations && plugin.api.migrations.directory) {
        const pluginPkg = require.resolve(plugin.packageName);
        const pluginDir = path.dirname(pluginPkg);
        const migrationsDir = path.join(
          pluginDir,
          plugin.api.migrations.directory,
          '*.js'
        );
        globs.push(migrationsDir);
      }
    }
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(
        '[plugin-loader] Error loading plugin migrations:',
        err.message
      );
    }
  }

  return globs;
}

module.exports = PluginLoader;
module.exports.getInstance = PluginLoader.getInstance;
module.exports.getPluginMigrationGlobs = getPluginMigrationGlobs;
