import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { resolvePluginFile } = require('@openstad-headless/plugin-loader');
const { buildExtensions } = require('./plugin-extensions');

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'test-fixtures/links-plugin'
);
const fixtureManifest = require('./test-fixtures/links-plugin').manifest;
const services = { resourceLinks: { createLink: () => {} } };

function plugin(overrides = {}) {
  return {
    name: 'links-fixture',
    config: { apiKey: 'x' },
    dir: fixtureDir,
    api: fixtureManifest.api,
    ...overrides,
  };
}

function build(plugins) {
  return buildExtensions(plugins, services, resolvePluginFile);
}

describe('plugin extensions', () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('registers all extension points of the fixture plugin', async () => {
    const extensions = build([plugin()]);

    expect(extensions.getCapabilities()).toEqual({
      linkRequests: true,
      contactHandlers: [{ key: 'link-request', label: 'Koppelverzoek' }],
      sources: [{ key: 'fixture-source', label: 'Fixture bron' }],
      notificationTypes: [
        { type: 'link invitation - user', label: 'Uitnodiging ontvangen' },
      ],
    });
    expect(
      await extensions
        .getLinkRequestHandler()
        .submit({ selection: [], removed: [], mode: 'create' })
    ).toEqual({ received: 0, removed: 0, mode: 'create' });
    expect(await extensions.getContactHandler('link-request').handle()).toEqual(
      { handled: true }
    );
    expect(
      await extensions.getSource('fixture-source').get({ ids: ['a1'] })
    ).toHaveLength(1);
    expect(
      extensions.getNotificationType('link invitation - user')
    ).toMatchObject({
      immediate: true,
      templatePath: path.join(fixtureDir, 'templates/link invitation - user'),
    });
  });

  it('passes config, plugin name and services to createHandler', () => {
    const received = [];
    const contactHandler = require('./test-fixtures/links-plugin/contact.js');
    const original = contactHandler.createHandler;
    contactHandler.createHandler = (ctx) => {
      received.push(ctx);
      return original(ctx);
    };

    build([plugin()]);
    contactHandler.createHandler = original;

    expect(received[0]).toEqual({
      config: { apiKey: 'x' },
      pluginName: 'links-fixture',
      services,
    });
  });

  it('keeps the first link request handler', () => {
    const extensions = build([plugin(), plugin({ name: 'second' })]);

    expect(extensions.getLinkRequestHandler().pluginName).toBe('links-fixture');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('another plugin already provides one')
    );
  });

  it('skips duplicate and reserved source keys', () => {
    const extensions = build([
      plugin(),
      plugin({
        name: 'second',
        api: {
          sources: [
            { key: 'fixture-source', label: 'Dubbel', handler: './source.js' },
            { key: 'openstad', label: 'Core', handler: './source.js' },
          ],
        },
      }),
    ]);

    expect(extensions.getSource('fixture-source').label).toBe('Fixture bron');
    expect(extensions.getSource('openstad')).toBeNull();
  });

  it('skips handlers without the required methods', () => {
    const extensions = build([
      plugin({
        api: {
          linkRequestHandler: { handler: './incomplete.js' },
          contactHandlers: [
            { key: 'contact', label: 'Contact', handler: './incomplete.js' },
          ],
          sources: [
            { key: 'broken', label: 'Kapot', handler: './incomplete.js' },
          ],
        },
      }),
    ]);

    expect(extensions.getCapabilities()).toEqual({
      linkRequests: false,
      contactHandlers: [],
      sources: [],
      notificationTypes: [],
    });
  });

  it('skips handlers and templates outside the plugin directory', () => {
    const extensions = build([
      plugin({
        api: {
          contactHandlers: [
            { key: 'contact', label: 'Contact', handler: '../outside.js' },
          ],
          notifications: [
            { type: 'escape', label: 'Escape', template: '../../escape' },
          ],
        },
      }),
    ]);

    expect(extensions.getContactHandler('contact')).toBeNull();
    expect(extensions.getNotificationType('escape')).toBeNull();
  });

  it('does not let a plugin override a core notification type', () => {
    const extensions = build([
      plugin({
        api: {
          notifications: [
            {
              type: 'login email',
              label: 'Login',
              template: './templates/link invitation - user',
            },
          ],
        },
      }),
    ]);

    expect(extensions.getNotificationType('login email')).toBeNull();
  });

  it('skips a handler that fails to load and keeps the others', () => {
    const extensions = build([
      plugin({
        api: {
          contactHandlers: [
            { key: 'broken', label: 'Kapot', handler: './throws.js' },
            {
              key: 'link-request',
              label: 'Koppelverzoek',
              handler: './contact.js',
            },
          ],
          sources: [
            {
              key: 'fixture-source',
              label: 'Fixture bron',
              handler: './source.js',
            },
          ],
        },
      }),
    ]);

    expect(extensions.getContactHandler('broken')).toBeNull();
    expect(extensions.getContactHandler('link-request')).not.toBeNull();
    expect(extensions.getSource('fixture-source')).not.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('handler failed to load')
    );
  });

  it('keeps other extensions of a plugin whose link request handler fails', () => {
    const extensions = build([
      plugin({
        api: {
          linkRequestHandler: { handler: './throws.js' },
          contactHandlers: [
            {
              key: 'link-request',
              label: 'Koppelverzoek',
              handler: './contact.js',
            },
          ],
        },
      }),
    ]);

    expect(extensions.getLinkRequestHandler()).toBeNull();
    expect(extensions.getContactHandler('link-request')).not.toBeNull();
  });

  it('returns an empty registry without plugins', () => {
    expect(build([]).getCapabilities()).toEqual({
      linkRequests: false,
      contactHandlers: [],
      sources: [],
      notificationTypes: [],
    });
  });
});
