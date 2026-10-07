import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import doFetch from './fetch';

function createLocalStorage() {
  const items = {};
  return {
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => {
      items[key] = String(value);
    },
  };
}

function storedUser(projectId) {
  const data = JSON.parse(global.window.localStorage.getItem('openstad'));
  return data[projectId]?.openStadUser;
}

function seedStoredUser(projectId) {
  global.window.localStorage.setItem(
    'openstad',
    JSON.stringify({ [projectId]: { openStadUser: { jwt: 'dead' } } })
  );
}

function jsonResponse(status, headers = {}) {
  return {
    ok: status < 400,
    status,
    statusText: '',
    headers: { get: (name) => headers[name] ?? null },
    json: async () => ({ records: [] }),
    text: async () => '{}',
  };
}

describe('data-store fetch error enrichment', () => {
  let originalFetch;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalWindow = global.window;
    originalDocument = global.document;

    global.window = {
      CustomEvent: function CustomEvent(type, init) {
        return { type, detail: init?.detail };
      },
      crypto: {
        randomUUID: () => 'client-id-123',
      },
      localStorage: createLocalStorage(),
    };
    global.document = {
      dispatchEvent: vi.fn(),
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  test('attaches client reference/status for HTTP errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      text: async () => JSON.stringify({ message: 'Validation failed' }),
    });

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/comment', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Validation failed',
      failureType: 'http_error',
      status: 422,
      clientErrorId: 'client-id-123',
      referenceId: 'client-id-123',
    });
  });

  test('creates client-only reference for network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/comment', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Failed to fetch',
      failureType: 'network_error',
      clientErrorId: 'client-id-123',
      referenceId: 'client-id-123',
    });
  });

  test('does not crash on network errors when window/document are unavailable', async () => {
    delete global.window;
    delete global.document;
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/comment', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Failed to fetch',
      failureType: 'network_error',
      clientErrorId: expect.any(String),
    });
  });

  test('throws invalid_json when success response body is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    });

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/resource', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Invalid JSON response',
      failureType: 'invalid_json',
      clientErrorId: 'client-id-123',
      referenceId: 'client-id-123',
    });
  });
});

describe('data-store fetch invalid token handling', () => {
  let originalFetch;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalWindow = global.window;
    originalDocument = global.document;

    global.window = { localStorage: createLocalStorage() };
    global.document = { dispatchEvent: vi.fn() };
    seedStoredUser(7);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  function createApi() {
    return {
      apiUrl: 'https://api.example.com',
      projectId: 7,
      currentUserJWT: 'dead',
    };
  }

  test('clears token on 200 with invalid_token header and returns data', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        'WWW-Authenticate': 'Bearer error="invalid_token"',
      })
    );
    const api = createApi();

    await expect(doFetch.call(api, '/api/project/7/resource')).resolves.toEqual(
      { records: [] }
    );
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer dead'
    );
    expect(api.currentUserJWT).toBeUndefined();
    expect(storedUser(7)).toBeUndefined();
  });

  test('clears token on 401 and still throws', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(401));
    const api = createApi();

    await expect(
      doFetch.call(api, '/api/project/7/comment', { method: 'POST' })
    ).rejects.toMatchObject({ status: 401 });
    expect(api.currentUserJWT).toBeUndefined();
    expect(storedUser(7)).toBeUndefined();
  });

  test('keeps token on a normal 200', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(200));
    const api = createApi();

    await doFetch.call(api, '/api/project/7/resource');
    expect(api.currentUserJWT).toBe('dead');
    expect(storedUser(7)).toEqual({ jwt: 'dead' });
  });

  test('keeps token on 500', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(500));
    const api = createApi();

    await expect(
      doFetch.call(api, '/api/project/7/resource')
    ).rejects.toMatchObject({ status: 500 });
    expect(api.currentUserJWT).toBe('dead');
  });
});
