import express from 'express';
import { createRequire } from 'node:module';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const pluginExtensions = require('../../services/plugin-extensions');
const pluginRouter = require('./index');

function createApp() {
  const app = express();
  app.use('/api/plugin', pluginRouter);
  return app;
}

describe('GET /api/plugin/registry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes the plugin capabilities', async () => {
    const capabilities = {
      linkRequests: true,
      contactHandlers: [{ key: 'link-request', label: 'Koppelverzoek' }],
      sources: [{ key: 'metkoos', label: 'Met Koos' }],
      notificationTypes: [
        { type: 'link invitation - user', label: 'Uitnodiging ontvangen' },
      ],
    };
    vi.spyOn(pluginExtensions, 'get').mockReturnValue({
      getCapabilities: () => capabilities,
    });

    const res = await request(createApp()).get('/api/plugin/registry');

    expect(res.status).toBe(200);
    expect(res.body.capabilities).toEqual(capabilities);
  });

  it('reports no capabilities without plugins', async () => {
    const res = await request(createApp()).get('/api/plugin/registry');

    expect(res.body.capabilities).toEqual({
      linkRequests: false,
      contactHandlers: [],
      sources: [],
      notificationTypes: [],
    });
  });
});
