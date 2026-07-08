import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createApp } = require('./create-app');

const BASE_CONFIG = {
  apiBaseUrl: 'http://localhost:31410',
  projectId: '2',
  reportingToken: 'osr_test',
  host: '127.0.0.1',
  port: 0,
};

describe('createApp — /mcp auth gate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('allows requests through with no auth check when authToken is unset (localhost-only deployment)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], nextLink: null }),
      })
    );
    const app = createApp(BASE_CONFIG);

    const res = await request(app)
      .post('/mcp')
      .set('Accept', 'application/json, text/event-stream')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'reporting_resources', arguments: {} },
      });

    expect(res.status).not.toBe(401);
  });

  it('401s a request with no Authorization header when authToken is configured', async () => {
    const app = createApp({ ...BASE_CONFIG, authToken: 'secret' });

    const res = await request(app)
      .post('/mcp')
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });

    expect(res.status).toBe(401);
  });

  it('401s a request with the wrong Authorization header when authToken is configured', async () => {
    const app = createApp({ ...BASE_CONFIG, authToken: 'secret' });

    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer wrong')
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });

    expect(res.status).toBe(401);
  });

  it('allows a request with the correct Authorization header when authToken is configured', async () => {
    const app = createApp({ ...BASE_CONFIG, authToken: 'secret' });

    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer secret')
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
