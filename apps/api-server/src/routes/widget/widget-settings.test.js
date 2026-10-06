import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const pluginLoader = require('@openstad-headless/plugin-loader');
const getWidgetSettings = require('./widget-settings');

const originalGetInstance = pluginLoader.getInstance;

function widgetDefinition(name) {
  return {
    packageName: `@example/${name}`,
    directory: name,
    js: [`dist/${name}.iife.js`],
    css: [`dist/${name}.css`],
    functionName: `Example${name}`,
    componentName: name,
    defaultConfig: { source: 'plugin' },
  };
}

function useFakeLoader(keys) {
  pluginLoader.getInstance = () => ({
    load: () => {},
    getWidgetDefinitions: () =>
      Object.fromEntries(keys.map((key) => [key, widgetDefinition(key)])),
  });
}

function conflictWarnings(warn, key) {
  return warn.mock.calls.filter(([message]) =>
    String(message).includes(`Widget key "${key}" conflicts`)
  );
}

describe('getWidgetSettings', () => {
  let warn;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    pluginLoader.getInstance = originalGetInstance;
  });

  it('does not report a plugin widget it merged before as a conflict', () => {
    useFakeLoader(['pluginwidget']);

    getWidgetSettings();
    const settings = getWidgetSettings();

    expect(conflictWarnings(warn, 'pluginwidget')).toHaveLength(0);
    expect(settings.pluginwidget.packageName).toBe('@example/pluginwidget');
  });

  it('keeps a core widget when a plugin uses the same key', () => {
    useFakeLoader(['agenda']);

    const settings = getWidgetSettings();

    expect(conflictWarnings(warn, 'agenda')).toHaveLength(1);
    expect(settings.agenda.packageName).toBe('@openstad-headless/agenda');
  });
});
