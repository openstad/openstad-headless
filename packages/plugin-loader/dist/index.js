'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const validate_1 = require("./validate");
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
        this._plugins = [];
        this._loaded = false;
    }
    /**
     * Returns the singleton PluginLoader instance.
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
     * @param pluginsJsonPath - Path to plugins.json.
     *   Defaults to `OPENSTAD_PLUGINS_PATH` env var, or searches up from __dirname.
     */
    load(pluginsJsonPath) {
        if (this._loaded)
            return;
        this._loaded = true;
        // Priority 1: inline JSON from env var (used in Kubernetes via ConfigMap)
        const override = process.env.PLUGIN_JSON_OVERRIDE;
        if (override && override.trim()) {
            let pluginsConfig;
            try {
                pluginsConfig = JSON.parse(override);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error('[plugin-loader] Failed to parse PLUGIN_JSON_OVERRIDE:', message);
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
            while (dir !== path_1.default.dirname(dir)) {
                const candidate = path_1.default.join(dir, 'plugins.json');
                if (fs_1.default.existsSync(candidate)) {
                    filePath = candidate;
                    break;
                }
                dir = path_1.default.dirname(dir);
            }
            if (!filePath) {
                filePath = path_1.default.resolve(__dirname, '../../plugins.json');
            }
        }
        let pluginsConfig;
        try {
            const raw = fs_1.default.readFileSync(filePath, 'utf-8');
            pluginsConfig = JSON.parse(raw);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[plugin-loader] Failed to read plugins.json at ${filePath}:`, message);
            return;
        }
        this._loadEntries(pluginsConfig.plugins || []);
    }
    /**
     * Loads enabled plugin entries by requiring their packages and validating manifests.
     */
    _loadEntries(entries) {
        const enabledEntries = entries.filter((entry) => entry.enabled === true);
        for (const entry of enabledEntries) {
            const packageName = entry.packageName || entry.package;
            try {
                const pluginModule = require(packageName);
                const manifest = pluginModule.manifest || pluginModule;
                const validation = (0, validate_1.validateManifest)(manifest);
                if (!validation.valid) {
                    console.error(`[plugin-loader] Invalid manifest for "${packageName}":`, validation.errors.join('; '));
                    continue;
                }
                if (manifest.api &&
                    Array.isArray(manifest.api.envVars) &&
                    manifest.api.envVars.length > 0) {
                    for (const envVar of manifest.api.envVars) {
                        if (!process.env[envVar]) {
                            console.warn(`[plugin-loader] Plugin "${manifest.name}" expects env var "${envVar}" but it is not set`);
                        }
                    }
                }
                this._plugins.push({
                    ...manifest,
                    packageName: packageName,
                    config: entry.config || {},
                });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`[plugin-loader] Failed to load plugin "${packageName}":`, message);
            }
        }
    }
    /**
     * Reloads plugins from plugins.json, clearing the current state.
     * Only reloads the registry metadata (pages, menu items, widget admin).
     * API hooks (models, routes, middleware) registered at startup are NOT affected.
     */
    reload(pluginsJsonPath) {
        this._plugins = [];
        this._loaded = false;
        this.load(pluginsJsonPath);
    }
    /**
     * Returns plugins that expose an `api` section.
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
     */
    getWidgetDefinitions() {
        const merged = {};
        for (const plugin of this._plugins) {
            if (!plugin.widgets)
                continue;
            for (const [key, definition] of Object.entries(plugin.widgets)) {
                if (merged[key]) {
                    console.warn(`[plugin-loader] Widget key "${key}" from plugin "${plugin.name}" conflicts with an existing widget — skipping`);
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
     */
    getLoadedPlugins() {
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
function getPluginMigrationGlobs(baseGlobs) {
    const globs = baseGlobs ? [...baseGlobs] : ['./migrations/*.js'];
    try {
        const loader = PluginLoader.getInstance();
        loader.load();
        for (const plugin of loader.getApiHooks()) {
            if (plugin.api.migrations && plugin.api.migrations.directory) {
                const pluginPkg = require.resolve(plugin.packageName);
                const pluginDir = path_1.default.dirname(pluginPkg);
                const migrationsDir = path_1.default.join(pluginDir, plugin.api.migrations.directory, '*.js');
                globs.push(migrationsDir);
            }
        }
    }
    catch (err) {
        const nodeErr = err;
        if (nodeErr.code !== 'MODULE_NOT_FOUND') {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[plugin-loader] Error loading plugin migrations:', message);
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
//# sourceMappingURL=index.js.map