import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createApp } = require('./create-app');

const BASE_CONFIG = {
  apiBaseUrl: 'http://localhost:31410',
  host: '127.0.0.1',
  port: 0,
};

describe('createApp — per-request credential extraction', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the reporting token from Authorization and the project id from X-Reporting-Project-Id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], nextLink: null }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const app = createApp(BASE_CONFIG);

    await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer osr_test')
      .set('X-Reporting-Project-Id', '2')
      .set('Accept', 'application/json, text/event-stream')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'reporting_resources', arguments: {} },
      });

    expect(fetchMock).toHaveBeenCalled();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.pathname).toContain('/api/project/2/');
    expect(options.headers.Authorization).toBe('Bearer osr_test');
  });

  it('does not leak a reporting token/project id between two concurrent tenants', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], nextLink: null }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const app = createApp(BASE_CONFIG);

    const callTool = (token, projectId) =>
      request(app)
        .post('/mcp')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Reporting-Project-Id', projectId)
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'reporting_resources', arguments: {} },
        });

    // Two "municipalities" hitting the same shared server instance at the
    // same time — this is the scenario the request-scoped config exists to
    // isolate, so the assertion below checks each request's own
    // token/project pairing, not just that two calls happened.
    await Promise.all([callTool('token-a', '2'), callTool('token-b', '9')]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [url, options] of fetchMock.mock.calls) {
      if (url.pathname.includes('/api/project/2/')) {
        expect(options.headers.Authorization).toBe('Bearer token-a');
      } else if (url.pathname.includes('/api/project/9/')) {
        expect(options.headers.Authorization).toBe('Bearer token-b');
      } else {
        throw new Error(`unexpected project id in URL: ${url.pathname}`);
      }
    }
  });

  it('treats a non-numeric X-Reporting-Project-Id as absent instead of forwarding it to the reporting API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], nextLink: null }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const app = createApp(BASE_CONFIG);

    await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer osr_test')
      .set('X-Reporting-Project-Id', '../../auth')
      .set('Accept', 'application/json, text/event-stream')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'reporting_resources', arguments: {} },
      });

    // A malformed project id must not reach buildUrl() at all — the tool
    // layer's missing-projectId guard should short-circuit before fetch.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not reject the connection when Authorization/X-Reporting-Project-Id are missing', async () => {
    const app = createApp(BASE_CONFIG);

    const res = await request(app)
      .post('/mcp')
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });

    expect(res.status).not.toBe(401);
  });

  it('rejects GET /mcp with 405', async () => {
    const app = createApp(BASE_CONFIG);
    const res = await request(app).get('/mcp');
    expect(res.status).toBe(405);
  });
});
