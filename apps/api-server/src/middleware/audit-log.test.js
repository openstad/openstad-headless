import { beforeEach, describe, expect, it, vi } from 'vitest';

import auditLogMiddleware from './audit-log.js';

const mockService = {
  log: vi.fn(),
  getChangedFields: vi.fn((prev, next) => {
    if (!prev || !next) return next;
    const changed = {};
    for (const key of Object.keys(next)) {
      if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
        changed[key] = next[key];
      }
    }
    return Object.keys(changed).length > 0 ? changed : null;
  }),
};

function createMockReq(overrides = {}) {
  return {
    method: 'GET',
    path: '/project/1/resource/42',
    params: { projectId: '1' },
    user: { id: 1, role: 'admin', displayName: 'Admin User' },
    headers: { 'user-agent': 'test' },
    originalUrl: '/api/project/1/resource/42',
    ip: '127.0.0.1',
    results: null,
    ...overrides,
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    json: vi.fn(function () {
      return this;
    }),
  };
}

describe('audit-log middleware', () => {
  let middleware;

  beforeEach(() => {
    vi.clearAllMocks();
    middleware = auditLogMiddleware(mockService);
  });

  it('passes through for non-matching methods (PATCH, OPTIONS)', () => {
    const req = createMockReq({ method: 'PATCH' });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('logs admin GET requests as read', () => {
    const req = createMockReq({ method: 'GET' });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();

    res.json({ id: 42, title: 'Test' });

    expect(mockService.log).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'read',
        modelName: 'Resource',
      })
    );
  });

  it('does not log non-admin GET requests', () => {
    const req = createMockReq({
      method: 'GET',
      user: { id: 2, role: 'member' },
    });
    const res = createMockRes();
    const next = vi.fn();
    const originalJson = res.json;

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.json).toBe(originalJson);
  });

  it('logs POST requests as create', () => {
    const req = createMockReq({
      method: 'POST',
      path: '/project/1/resource',
    });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    res.json({ id: 99, title: 'New Resource' });

    expect(mockService.log).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'create',
        modelName: 'Resource',
      })
    );
  });

  it('logs PUT requests as update', () => {
    const req = createMockReq({
      method: 'PUT',
      results: { dataValues: { id: 42, title: 'Old Title' } },
    });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    res.json({ id: 42, title: 'New Title' });

    expect(mockService.log).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'update',
        modelName: 'Resource',
      })
    );
  });

  it('logs DELETE requests as delete', () => {
    const req = createMockReq({
      method: 'DELETE',
      results: { dataValues: { id: 42, title: 'To Delete' } },
    });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    res.json({ success: true });

    expect(mockService.log).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'delete',
        modelName: 'Resource',
      })
    );
  });

  it('does not log when status code >= 400', () => {
    const req = createMockReq({
      method: 'POST',
      path: '/project/1/resource',
    });
    const res = createMockRes();
    res.statusCode = 400;
    const next = vi.fn();

    middleware(req, res, next);
    res.json({ error: 'Bad request' });

    expect(mockService.log).not.toHaveBeenCalled();
  });

  it('skips unknown routes', () => {
    const req = createMockReq({
      method: 'POST',
      path: '/unknown-route',
    });
    const res = createMockRes();
    const next = vi.fn();
    const originalJson = res.json;

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.json).toBe(originalJson);
  });

  it('resolves model from project sub-routes', () => {
    const req = createMockReq({
      method: 'POST',
      path: '/project/1/comment',
    });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    res.json({ id: 1 });

    expect(mockService.log).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        modelName: 'Comment',
      })
    );
  });
});
