import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference as the source modules do
const require = createRequire(import.meta.url);
const db = require('../../../db');
const { can, hasRole, toAuthorizedJSON, useReqUser } = require('./index.js');

// Store originals for clean restoration
const origVoteCan = db.Vote.can;
const origResourceCan = db.Resource.can;

afterEach(() => {
  db.Vote.can = origVoteCan;
  db.Resource.can = origResourceCan;
});

function createMockReq(overrides = {}) {
  return {
    user: { id: 1, role: 'member' },
    results: null,
    ...overrides,
  };
}

function createMockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn() };
}

// ----------------------------------------------------------------------------------------------------
// can middleware
// ----------------------------------------------------------------------------------------------------

describe('can middleware', () => {
  it('calls next without error when user has permission', () => {
    db.Vote.can = vi.fn().mockReturnValue(true);

    const middleware = can('Vote', 'create');
    const req = createMockReq({ user: { id: 1, role: 'member' } });
    const next = vi.fn();

    middleware(req, createMockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with error when user lacks permission', () => {
    db.Vote.can = vi.fn().mockReturnValue(false);

    const middleware = can('Vote', 'create');
    const req = createMockReq({ user: { id: 2, role: 'anonymous' } });
    const next = vi.fn();

    middleware(req, createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('throws when model is not found', () => {
    const middleware = can('NonExistentModel', 'create');
    const req = createMockReq();
    const next = vi.fn();

    expect(() => middleware(req, createMockRes(), next)).toThrow(
      /NonExistentModel/
    );
  });
});

// ----------------------------------------------------------------------------------------------------
// useReqUser middleware
// ----------------------------------------------------------------------------------------------------

describe('useReqUser middleware', () => {
  it('sets auth.user on a single result object', () => {
    const user = { id: 1, role: 'admin' };
    const result = { id: 99, title: 'Test' };
    const req = createMockReq({ user, results: result });
    const next = vi.fn();

    useReqUser(req, createMockRes(), next);

    expect(req.results.auth.user).toBe(user);
    expect(next).toHaveBeenCalled();
  });

  it('sets auth.user on each item in a results array', () => {
    const user = { id: 1, role: 'admin' };
    const results = [{ id: 1 }, { id: 2 }];
    const req = createMockReq({ user, results });
    const next = vi.fn();

    useReqUser(req, createMockRes(), next);

    results.forEach((r) => expect(r.auth.user).toBe(user));
    expect(next).toHaveBeenCalled();
  });

  it('skips gracefully when results is null', () => {
    const req = createMockReq({ results: null });
    const next = vi.fn();

    useReqUser(req, createMockRes(), next);

    expect(next).toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------------------------------------
// toAuthorizedJSON middleware
// ----------------------------------------------------------------------------------------------------

describe('toAuthorizedJSON middleware', () => {
  it('calls toAuthorizedJSON on a single result and replaces req.results', () => {
    const user = { id: 1, role: 'member' };
    const authorizedData = { id: 99, title: 'Visible' };
    const result = {
      toAuthorizedJSON: vi.fn().mockReturnValue(authorizedData),
    };
    const req = createMockReq({ user, results: result });
    const next = vi.fn();

    toAuthorizedJSON(req, createMockRes(), next);

    expect(result.toAuthorizedJSON).toHaveBeenCalledWith(user);
    expect(req.results).toBe(authorizedData);
    expect(next).toHaveBeenCalled();
  });

  it('maps toAuthorizedJSON over an array of results', () => {
    const user = { id: 1, role: 'member' };
    const makeResult = (id) => ({
      id,
      toAuthorizedJSON: vi.fn().mockReturnValue({ id, visible: true }),
    });
    const results = [makeResult(1), makeResult(2)];
    const req = createMockReq({ user, results });
    const next = vi.fn();

    toAuthorizedJSON(req, createMockRes(), next);

    expect(req.results).toEqual([
      { id: 1, visible: true },
      { id: 2, visible: true },
    ]);
    expect(next).toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------------------------------------
// hasRole utility
// ----------------------------------------------------------------------------------------------------

describe('hasRole', () => {
  it('returns truthy when user role satisfies minRole', () => {
    expect(hasRole({ role: 'admin' }, 'member')).toBeTruthy();
    expect(hasRole({ role: 'admin' }, 'admin')).toBeTruthy();
    expect(hasRole({ role: 'superuser' }, 'admin')).toBeTruthy();
    expect(hasRole({ role: 'moderator' }, 'member')).toBeTruthy();
  });

  it('returns falsy when user role does not satisfy minRole', () => {
    expect(hasRole({ role: 'member' }, 'admin')).toBeFalsy();
    expect(hasRole({ role: 'anonymous' }, 'member')).toBeFalsy();
  });

  it('defaults to requiring admin when no minRole given', () => {
    expect(hasRole({ role: 'admin' })).toBeTruthy();
    expect(hasRole({ role: 'member' })).toBeFalsy();
  });

  it('allows owner when ownerId matches user.id', () => {
    const user = { id: 5, role: 'member' };
    expect(hasRole(user, 'owner', 5)).toBeTruthy();
    expect(hasRole(user, 'owner', 6)).toBeFalsy();
  });

  it('returns falsy for null/undefined user', () => {
    expect(hasRole(null, 'member')).toBeFalsy();
    expect(hasRole(undefined, 'member')).toBeFalsy();
  });
});
