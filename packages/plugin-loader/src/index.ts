'use strict';

import fs from 'fs';
import path from 'path';

import { ValidationResult, validateManifest } from './validate';

export { ValidationResult };

export interface PluginManifest {
  name: string;
  version: string;
  packageName?: string;
  config?: Record<string, unknown>;
  api?: PluginApiSection;
  admin?: PluginAdminSection;
  widgets?: Record<string, PluginWidgetDefinition>;
  cms?: Record<string, unknown>;
}

export interface PluginApiSection {
  models?: Array<{ name: string; path: string }>;
  routes?: Array<{ method: string; path: string; handler: string }>;
  middleware?: Array<{ path: string; position?: string; priority?: number }>;
  migrations?: { directory: string };
  envVars?: string[];
}

export interface PluginAdminSection {
  bundle?: { js: string; css?: string };
  pages?: Array<{ path: string; componentName: string; label?: string }>;
  menuItems?: Array<{ label: string; href: string; role?: string }>;
}

export interface PluginWidgetDefinition {
  packageName: string;
  directory: string;
  js: string | string[];
  css: string | string[];
  functionName: string;
  componentName: string;
  defaultConfig: Record<string, unknown>;
  name?: string;
  description?: string;
  image?: string;
  adminBundle?: { js: string; componentName: string };
}

export interface PluginEntry {
  name?: string;
  packageName?: string;
  package?: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

interface LoadedPlugin extends PluginManifest {
  packageName: string;
  config: Record<string, unknown>;
}

let instance: PluginLoader | null = null;

/**
 * Manifest-driven plugin loader for OpenStad Headless.
 *
 * Reads a `plugins.json` file, resolves each enabled plugin via `require()`,
 * validates its manifest, and exposes hooks for the API, admin, CMS, and
 * widget systems.
 */
class PluginLoader {
  _plugins: LoadedPlugin[];
  _loaded: boolean;

  constructor() {
    this._plugins = [];
    this._loaded = false;
  }

  /**
   * Returns the singleton PluginLoader instance.
   */
  static getInstance(): PluginLoader {
    if (!instance) {
      instance = new PluginLoader();
    }
    return instance;
  }

  /**
   * Resets the singleton instance. Intended for testing only.
   */
  static reset(): void {
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
   * @param pluginsJsonPath - Path to plugins.json.
   *   Defaults to `OPENSTAD_PLUGINS_PATH` env var, or searches up from __dirname.
   */
  load(pluginsJsonPath?: string): void {
    if (this._loaded) return;
    this._loaded = true;

    // Priority 1: inline JSON from env var (used in Kubernetes via ConfigMap)
    const override = process.env.PLUGIN_JSON_OVERRIDE;
    if (override && override.trim()) {
      let pluginsConfig: { plugins?: PluginEntry[] };
      try {
        pluginsConfig = JSON.parse(override);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          '[plugin-loader] Failed to parse PLUGIN_JSON_OVERRIDE:',
          message
        );
        return;
      }
      this._loadEntries(pluginsConfig.plugins || []);
      return;
    }

    // Priority 2: explicit path argument
    // Priority 3: OPENSTAD_PLUGINS_PATH env var
    // Priority 4: search up from __dirname
    let filePath = pluginsJsonPath;
    if (!filePath && process.env.OPENSTAD_PLUGINS_PATH) {
      filePath = process.env.OPENSTAD_PLUGINS_PATH;
    }
    if (!filePath) {
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

    let pluginsConfig: { plugins?: PluginEntry[] };
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      pluginsConfig = JSON.parse(raw);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[plugin-loader] Failed to read plugins.json at ${filePath}:`,
        message
      );
      return;
    }

    this._loadEntries(pluginsConfig.plugins || []);
  }

  /**
   * Loads enabled plugin entries by requiring their packages and validating manifests.
   */
  private _loadEntries(entries: PluginEntry[]): void {
    const enabledEntries = entries.filter((entry) => entry.enabled === true);

    for (const entry of enabledEntries) {
      const packageName = entry.packageName || entry.package;

      try {
        const pluginModule = require(packageName as string);
        const manifest: PluginManifest = pluginModule.manifest || pluginModule;

        const validation = validateManifest(
          manifest as unknown as Record<string, unknown>
        );
        if (!validation.valid) {
          console.error(
            `[plugin-loader] Invalid manifest for "${packageName}":`,
            validation.errors!.join('; ')
          );
          continue;
        }

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
          packageName: packageName as string,
          config: entry.config || {},
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `[plugin-loader] Failed to load plugin "${packageName}":`,
          message
        );
      }
    }
  }

  /**
   * Reloads plugins from plugins.json, clearing the current state.
   * Only reloads the registry metadata (pages, menu items, widget admin).
   * API hooks (models, routes, middleware) registered at startup are NOT affected.
   */
  reload(pluginsJsonPath?: string): void {
    this._plugins = [];
    this._loaded = false;
    this.load(pluginsJsonPath);
  }

  /**
   * Returns plugins that expose an `api` section.
   */
  getApiHooks(): Array<{
    name: string;
    version: string;
    packageName: string;
    config: Record<string, unknown>;
    api: PluginApiSection;
  }> {
    return this._plugins
      .filter((p) => p.api)
      .map((p) => ({
        name: p.name,
        version: p.version,
        packageName: p.packageName,
        config: p.config,
        api: p.api!,
      }));
  }

  /**
   * Returns plugins that expose an `admin` section.
   */
  getAdminHooks(): Array<{
    name: string;
    version: string;
    packageName: string;
    config: Record<string, unknown>;
    admin: PluginAdminSection;
  }> {
    return this._plugins
      .filter((p) => p.admin)
      .map((p) => ({
        name: p.name,
        version: p.version,
        packageName: p.packageName,
        config: p.config,
        admin: p.admin!,
      }));
  }

  /**
   * Merges all plugins' `widgets` entries into a single object.
   * Warns on key conflicts and skips duplicates (first plugin wins).
   */
  getWidgetDefinitions(): Record<string, PluginWidgetDefinition> {
    const merged: Record<string, PluginWidgetDefinition> = {};

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
   */
  getCmsHooks(): Array<{
    name: string;
    version: string;
    packageName: string;
    config: Record<string, unknown>;
    cms: Record<string, unknown>;
  }> {
    return this._plugins
      .filter((p) => p.cms)
      .map((p) => ({
        name: p.name,
        version: p.version,
        packageName: p.packageName,
        config: p.config,
        cms: p.cms!,
      }));
  }

  /**
   * Returns all loaded plugins.
   */
  getLoadedPlugins(): LoadedPlugin[] {
    return this._plugins;
  }
}

/**
 * Returns migration glob patterns from all loaded plugins that have
 * an `api.migrations.directory` configured.
 *
 * @param baseGlobs - Core migration globs. Defaults to `['./migrations/*.js']`.
 * @returns Array of glob patterns including plugin migration dirs.
 */
function getPluginMigrationGlobs(baseGlobs?: string[]): string[] {
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
  } catch (err: unknown) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code !== 'MODULE_NOT_FOUND') {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        '[plugin-loader] Error loading plugin migrations:',
        message
      );
    }
  }

  return globs;
}

// CJS compatibility: require() returns PluginLoader class with static methods
// and getPluginMigrationGlobs attached as a property
module.exports = PluginLoader;
module.exports.getInstance = PluginLoader.getInstance;
module.exports.reset = PluginLoader.reset;
module.exports.getPluginMigrationGlobs = getPluginMigrationGlobs;
module.exports.PluginLoader = PluginLoader;
