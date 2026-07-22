import { describe, expect, it, vi } from 'vitest';

const dataScopeAdminGate = require('./data-scope-admin-gate');
const { deepEqual, requiresAdmin } = dataScopeAdminGate;

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

describe('dataScopeAdminGate (middleware wrapper)', () => {
  it('passes through without touching the DB when config.dataScope is absent', async () => {
    const req = {
      body: { name: 'renamed' },
      user: { role: 'editor' },
      results: { id: 1 },
    };
    const res = makeRes();
    const next = vi.fn();

    await dataScopeAdminGate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res._status).toBeNull();
  });

  it('passes through without touching the DB for an admin', async () => {
    const req = {
      body: { config: { dataScope: { votes: { enabled: true } } } },
      user: { role: 'admin' },
      results: { id: 1 },
    };
    const res = makeRes();
    const next = vi.fn();

    await dataScopeAdminGate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res._status).toBeNull();
  });
});

// requiresAdmin/deepEqual are the actual decision logic (pure, no DB) — the
// three scenarios required by the review: editor changes dataScope → block,
// editor resubmits it unchanged → allow, admin changes it → allow.
describe('requiresAdmin', () => {
  it('blocks a non-admin actually changing dataScope', () => {
    expect(
      requiresAdmin({
        incomingDataScope: { votes: { enabled: true } },
        savedDataScope: { votes: { enabled: false } },
        user: { role: 'editor' },
      })
    ).toBe(true);
  });

  it('allows a non-admin resubmitting the unchanged saved dataScope', () => {
    const dataScope = {
      votes: { enabled: true, personalFields: ['user.displayName'] },
    };
    expect(
      requiresAdmin({
        incomingDataScope: {
          votes: { enabled: true, personalFields: ['user.displayName'] },
        },
        savedDataScope: dataScope,
        user: { role: 'editor' },
      })
    ).toBe(false);
  });

  it('allows an admin changing dataScope', () => {
    expect(
      requiresAdmin({
        incomingDataScope: { votes: { enabled: true } },
        savedDataScope: { votes: { enabled: false } },
        user: { role: 'admin' },
      })
    ).toBe(false);
  });

  it('allows any role when config.dataScope is not part of the request', () => {
    expect(
      requiresAdmin({
        incomingDataScope: undefined,
        savedDataScope: { votes: { enabled: false } },
        user: { role: 'editor' },
      })
    ).toBe(false);
  });

  it('blocks a non-admin submitting a non-empty dataScope when nothing is saved yet', () => {
    expect(
      requiresAdmin({
        incomingDataScope: { votes: { enabled: true } },
        savedDataScope: undefined,
        user: { role: 'editor' },
      })
    ).toBe(true);
  });
});

describe('deepEqual', () => {
  it('treats structurally identical objects as equal regardless of key order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('treats differing nested values as unequal', () => {
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('treats arrays with different order as unequal', () => {
    expect(deepEqual(['a', 'b'], ['b', 'a'])).toBe(false);
  });

  it('handles undefined vs missing key', () => {
    expect(deepEqual({ a: undefined }, {})).toBe(false);
  });
});
