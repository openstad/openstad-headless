import { describe, expect, it } from 'vitest';

import { validateManifest } from './validate.js';

describe('validateManifest', () => {
  it('accepts a valid complete manifest', () => {
    const manifest = {
      name: 'test-plugin',
      version: '1.0.0',
      api: {
        models: [{ name: 'Vote', path: './models/Vote.js' }],
        routes: [
          { method: 'GET', path: '/votes', handler: './routes/votes.js' },
        ],
        middleware: [{ path: './middleware/auth.js' }],
      },
      widgets: {
        'my-widget': {
          packageName: '@openstad/my-widget',
          directory: 'packages/my-widget',
          js: 'dist/index.js',
          css: 'dist/index.css',
          functionName: 'MyWidget',
          componentName: 'MyWidget',
          defaultConfig: {},
        },
      },
      admin: {
        pages: [
          {
            path: '/settings',
            componentPath: './admin/Settings.tsx',
            entry: 'settings',
          },
        ],
        menuItems: [{ label: 'Settings', href: '/settings' }],
      },
    };

    expect(validateManifest(manifest)).toEqual({ valid: true });
  });

  it('accepts a valid manifest with only some sections', () => {
    const manifest = {
      name: 'minimal-plugin',
      version: '0.1.0',
      api: {
        routes: [
          { method: 'POST', path: '/data', handler: './routes/data.js' },
        ],
      },
    };

    expect(validateManifest(manifest)).toEqual({ valid: true });
  });

  it('rejects a manifest missing name', () => {
    const result = validateManifest({ version: '1.0.0' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('name'));
  });

  it('rejects a manifest missing version', () => {
    const result = validateManifest({ name: 'test' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('version'));
  });

  it('rejects a manifest with both name and version missing', () => {
    const result = validateManifest({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });

  it('rejects a non-object manifest', () => {
    const result = validateManifest(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('non-null object')
    );
  });

  it('rejects api.models missing name', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      api: { models: [{ path: './models/Vote.js' }] },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('api.models[0]: missing required field "name"')
    );
  });

  it('rejects api.models missing path', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      api: { models: [{ name: 'Vote' }] },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('api.models[0]: missing required field "path"')
    );
  });

  it('rejects api.routes missing method', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      api: {
        routes: [{ path: '/votes', handler: './routes/votes.js' }],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('api.routes[0]: missing required field "method"')
    );
  });

  it('rejects api.routes missing path', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      api: {
        routes: [{ method: 'GET', handler: './routes/votes.js' }],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('api.routes[0]: missing required field "path"')
    );
  });

  it('rejects api.routes missing handler', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      api: {
        routes: [{ method: 'GET', path: '/votes' }],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('api.routes[0]: missing required field "handler"')
    );
  });

  it('rejects api.middleware missing path', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      api: { middleware: [{}] },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'api.middleware[0]: missing required field "path"'
      )
    );
  });

  it('rejects widgets missing required keys', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      widgets: {
        'bad-widget': {
          packageName: '@openstad/bad-widget',
          // missing: directory, js, css, functionName, componentName, defaultConfig
        },
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'widgets["bad-widget"]: missing required field "directory"'
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'widgets["bad-widget"]: missing required field "js"'
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'widgets["bad-widget"]: missing required field "css"'
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'widgets["bad-widget"]: missing required field "functionName"'
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'widgets["bad-widget"]: missing required field "componentName"'
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'widgets["bad-widget"]: missing required field "defaultConfig"'
      )
    );
  });

  it('rejects admin.pages missing required fields', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      admin: {
        pages: [{ path: '/settings' }],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'admin.pages[0]: missing required field "componentPath"'
      )
    );
    expect(result.errors).toContainEqual(
      expect.stringContaining('admin.pages[0]: missing required field "entry"')
    );
  });

  it('rejects admin.menuItems missing label', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      admin: {
        menuItems: [{ href: '/settings' }],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'admin.menuItems[0]: missing required field "label"'
      )
    );
  });

  it('rejects admin.menuItems missing href', () => {
    const result = validateManifest({
      name: 'test',
      version: '1.0.0',
      admin: {
        menuItems: [{ label: 'Settings' }],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining(
        'admin.menuItems[0]: missing required field "href"'
      )
    );
  });
});
