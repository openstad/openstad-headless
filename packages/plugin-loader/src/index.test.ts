import fs from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PluginLoader from './index';

/**
 * Builds a minimal valid plugin manifest.
 */
function validManifest(overrides: Record<string, unknown> = {}) {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    ...overrides,
  };
}

// Use Node's Module system to register fake modules in the require cache.
const require_ = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require_('module') as typeof import('module') & {
  _resolveFilename: (...args: unknown[]) => string;
};
const originalResolve = Module._resolveFilename;

/** Set of package names registered as fake modules. */
let fakeModules = new Set<string>();

/** Temp file path for plugins.json */
let tmpFile: string;

beforeEach(() => {
  PluginLoader.reset();
  fakeModules = new Set();
  tmpFile = path.join(
    os.tmpdir(),
    `plugins-${Date.now()}-${Math.random()}.json`
  );

  // Patch Module._resolveFilename to intercept our fake plugin packages
  Module._resolveFilename = function (
    request: unknown,
    parent: unknown,
    isMain: unknown,
    options: unknown
  ) {
    if (fakeModules.has(request as string)) {
      return request as string;
    }
    return originalResolve.call(this, request, parent, isMain, options);
  };
});

afterEach(() => {
  Module._resolveFilename = originalResolve;

  // Clean up fake modules from require cache
  for (const name of fakeModules) {
    delete require_.cache[name];
  }

  // Clean up temp file
  try {
    fs.unlinkSync(tmpFile);
  } catch {
    // ignore if file doesn't exist
  }
});

/**
 * Write plugins config to temp file and return the path.
 */
function writePluginsJson(config: Record<string, unknown>): string {
  fs.writeFileSync(tmpFile, JSON.stringify(config));
  return tmpFile;
}

/**
 * Register a fake plugin package that require() will resolve to.
 */
function registerFakeModule(
  packageName: string,
  moduleExports: Record<string, unknown>
): void {
  fakeModules.add(packageName);
  require_.cache[packageName] = {
    id: packageName,
    filename: packageName,
    loaded: true,
    exports: moduleExports,
  } as unknown as NodeModule;
}

describe('PluginLoader', () => {
  describe('singleton', () => {
    it('getInstance returns the same instance', () => {
      const a = PluginLoader.getInstance();
      const b = PluginLoader.getInstance();
      expect(a).toBe(b);
    });

    it('reset clears the singleton so a new instance is created', () => {
      const a = PluginLoader.getInstance();
      PluginLoader.reset();
      const b = PluginLoader.getInstance();
      expect(a).not.toBe(b);
    });
  });

  describe('load', () => {
    it('loads an empty plugins.json without errors', () => {
      const jsonPath = writePluginsJson({ plugins: [] });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toEqual([]);
    });

    it('skips disabled plugins', () => {
      registerFakeModule('disabled-plugin', {
        manifest: validManifest({ name: 'disabled-plugin' }),
      });

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'disabled-plugin', enabled: false }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toEqual([]);
    });

    it('loads a valid enabled plugin', () => {
      const manifest = validManifest({
        name: 'good-plugin',
        api: { routes: [] },
      });
      registerFakeModule('good-plugin', { manifest });

      const jsonPath = writePluginsJson({
        plugins: [
          {
            packageName: 'good-plugin',
            enabled: true,
            config: { key: 'val' },
          },
        ],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const loaded = loader.getLoadedPlugins();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('good-plugin');
      expect(loaded[0].config).toEqual({ key: 'val' });
      expect(loaded[0].packageName).toBe('good-plugin');
    });

    it('is idempotent — calling load() twice does not duplicate plugins', () => {
      const manifest = validManifest({ name: 'idempotent-plugin' });
      registerFakeModule('idempotent-plugin', { manifest });

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'idempotent-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toHaveLength(1);
    });

    it('handles a missing npm package gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Do NOT register the module — require() will fail
      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'nonexistent-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load plugin'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('skips a plugin with an invalid manifest', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Manifest missing name
      registerFakeModule('bad-manifest-plugin', {
        manifest: { version: '1.0.0' },
      });

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'bad-manifest-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid manifest'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('warns about missing env vars but still loads the plugin', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const manifest = validManifest({
        name: 'env-plugin',
        api: { envVars: ['MISSING_VAR_XYZ'] },
      });
      registerFakeModule('env-plugin', { manifest });

      // Ensure the env var is NOT set
      delete process.env.MISSING_VAR_XYZ;

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'env-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('MISSING_VAR_XYZ')
      );

      consoleSpy.mockRestore();
    });

    it('uses the module itself as manifest when no .manifest property', () => {
      const moduleExports = validManifest({ name: 'bare-export' });
      registerFakeModule('bare-export', moduleExports);

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'bare-export', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()).toHaveLength(1);
      expect(loader.getLoadedPlugins()[0].name).toBe('bare-export');
    });

    it('handles a broken plugins.json file gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const loader = PluginLoader.getInstance();
      loader.load('/nonexistent/path/plugins.json');

      expect(loader.getLoadedPlugins()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read plugins.json'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('defaults config to empty object when entry has no config', () => {
      registerFakeModule('no-config-plugin', {
        manifest: validManifest({ name: 'no-config-plugin' }),
      });

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'no-config-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getLoadedPlugins()[0].config).toEqual({});
    });

    it('supports "package" as an alias for "packageName" in plugins.json', () => {
      registerFakeModule('alias-plugin', {
        manifest: validManifest({ name: 'alias-plugin' }),
      });

      const jsonPath = writePluginsJson({
        plugins: [{ package: 'alias-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const loaded = loader.getLoadedPlugins();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('alias-plugin');
      expect(loaded[0].packageName).toBe('alias-plugin');
    });
  });

  describe('getApiHooks', () => {
    it('returns only plugins with an api section', () => {
      registerFakeModule('api-plugin', {
        manifest: validManifest({
          name: 'api-plugin',
          api: {
            routes: [{ method: 'GET', path: '/', handler: './h.js' }],
          },
        }),
      });
      registerFakeModule('non-api-plugin', {
        manifest: validManifest({
          name: 'non-api-plugin',
          admin: { pages: [] },
        }),
      });

      const jsonPath = writePluginsJson({
        plugins: [
          { packageName: 'api-plugin', enabled: true },
          { packageName: 'non-api-plugin', enabled: true },
        ],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const hooks = loader.getApiHooks();
      expect(hooks).toHaveLength(1);
      expect(hooks[0].name).toBe('api-plugin');
      expect(hooks[0]).toHaveProperty('api');
      expect(hooks[0]).toHaveProperty('config');
      expect(hooks[0]).toHaveProperty('version');
      expect(hooks[0]).toHaveProperty('packageName');
      expect(hooks[0].packageName).toBe('api-plugin');
    });
  });

  describe('getAdminHooks', () => {
    it('returns only plugins with an admin section', () => {
      registerFakeModule('admin-plugin', {
        manifest: validManifest({
          name: 'admin-plugin',
          admin: {
            pages: [
              {
                path: '/settings',
                componentPath: './Settings.tsx',
                entry: 'settings',
              },
            ],
          },
        }),
      });
      registerFakeModule('api-only-plugin', {
        manifest: validManifest({
          name: 'api-only-plugin',
          api: { routes: [] },
        }),
      });

      const jsonPath = writePluginsJson({
        plugins: [
          { packageName: 'admin-plugin', enabled: true },
          { packageName: 'api-only-plugin', enabled: true },
        ],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const hooks = loader.getAdminHooks();
      expect(hooks).toHaveLength(1);
      expect(hooks[0].name).toBe('admin-plugin');
      expect(hooks[0]).toHaveProperty('admin');
      expect(hooks[0]).toHaveProperty('packageName');
      expect(hooks[0].packageName).toBe('admin-plugin');
    });
  });

  describe('getCmsHooks', () => {
    it('returns only plugins with a cms section', () => {
      registerFakeModule('cms-plugin', {
        manifest: validManifest({
          name: 'cms-plugin',
          cms: { templates: ['./templates/main.html'] },
        }),
      });
      registerFakeModule('no-cms-plugin', {
        manifest: validManifest({ name: 'no-cms-plugin' }),
      });

      const jsonPath = writePluginsJson({
        plugins: [
          { packageName: 'cms-plugin', enabled: true },
          { packageName: 'no-cms-plugin', enabled: true },
        ],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const hooks = loader.getCmsHooks();
      expect(hooks).toHaveLength(1);
      expect(hooks[0].name).toBe('cms-plugin');
      expect(hooks[0]).toHaveProperty('cms');
      expect(hooks[0]).toHaveProperty('packageName');
      expect(hooks[0].packageName).toBe('cms-plugin');
    });
  });

  describe('getWidgetDefinitions', () => {
    it('merges widgets from multiple plugins', () => {
      registerFakeModule('widget-plugin-a', {
        manifest: validManifest({
          name: 'widget-plugin-a',
          widgets: {
            'widget-a': {
              packageName: '@openstad/widget-a',
              directory: 'packages/widget-a',
              js: 'dist/index.js',
              css: 'dist/index.css',
              functionName: 'WidgetA',
              componentName: 'WidgetA',
              defaultConfig: {},
            },
          },
        }),
      });
      registerFakeModule('widget-plugin-b', {
        manifest: validManifest({
          name: 'widget-plugin-b',
          widgets: {
            'widget-b': {
              packageName: '@openstad/widget-b',
              directory: 'packages/widget-b',
              js: 'dist/index.js',
              css: 'dist/index.css',
              functionName: 'WidgetB',
              componentName: 'WidgetB',
              defaultConfig: {},
            },
          },
        }),
      });

      const jsonPath = writePluginsJson({
        plugins: [
          { packageName: 'widget-plugin-a', enabled: true },
          { packageName: 'widget-plugin-b', enabled: true },
        ],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const widgets = loader.getWidgetDefinitions();
      expect(Object.keys(widgets)).toEqual(['widget-a', 'widget-b']);
      expect(widgets['widget-a'].packageName).toBe('@openstad/widget-a');
      expect(widgets['widget-b'].packageName).toBe('@openstad/widget-b');
    });

    it('warns on widget key conflicts and skips duplicates', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const widgetDef = {
        packageName: '@openstad/dup',
        directory: 'packages/dup',
        js: 'dist/index.js',
        css: 'dist/index.css',
        functionName: 'Dup',
        componentName: 'Dup',
        defaultConfig: {},
      };

      registerFakeModule('dup-plugin-1', {
        manifest: validManifest({
          name: 'dup-plugin-1',
          widgets: {
            'same-key': { ...widgetDef, packageName: '@openstad/first' },
          },
        }),
      });
      registerFakeModule('dup-plugin-2', {
        manifest: validManifest({
          name: 'dup-plugin-2',
          widgets: {
            'same-key': { ...widgetDef, packageName: '@openstad/second' },
          },
        }),
      });

      const jsonPath = writePluginsJson({
        plugins: [
          { packageName: 'dup-plugin-1', enabled: true },
          { packageName: 'dup-plugin-2', enabled: true },
        ],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      const widgets = loader.getWidgetDefinitions();
      // First plugin wins
      expect(widgets['same-key'].packageName).toBe('@openstad/first');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Widget key "same-key"')
      );

      consoleSpy.mockRestore();
    });

    it('returns empty object when no plugins have widgets', () => {
      registerFakeModule('no-widget-plugin', {
        manifest: validManifest({ name: 'no-widget-plugin' }),
      });

      const jsonPath = writePluginsJson({
        plugins: [{ packageName: 'no-widget-plugin', enabled: true }],
      });

      const loader = PluginLoader.getInstance();
      loader.load(jsonPath);

      expect(loader.getWidgetDefinitions()).toEqual({});
    });
  });
});
