import { describe, expect, it, vi } from 'vitest';

import { check2FA } from './client.js';

function createReq(overrides = {}) {
  return {
    client: { id: 1, clientId: 'client-1', twoFactorRoles: ['admin'] },
    user: { id: 5, role: 'admin' },
    currentClientRole: 'admin',
    query: { redirect_uri: 'https://example.com/return' },
    session: {},
    ...overrides,
  };
}

describe('check2FA', () => {
  it('redirects to the two-factor screen when 2FA is not validated', () => {
    const req = createReq();
    const res = { redirect: vi.fn() };
    const next = vi.fn();

    check2FA(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/auth/two-factor?clientId=client-1')
    );
  });

  it('ignores a manually set global session.twoFactorValid', () => {
    const req = createReq({ session: { twoFactorValid: true } });
    const res = { redirect: vi.fn() };
    const next = vi.fn();

    check2FA(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/auth/two-factor')
    );
  });

  it('passes when the client auth context has a valid 2FA', () => {
    const req = createReq({ currentClientAuth: { twoFactorValid: true } });
    const res = { redirect: vi.fn() };
    const next = vi.fn();

    check2FA(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('passes when the client has no twoFactorRoles', () => {
    const req = createReq({
      client: { id: 1, clientId: 'client-1', twoFactorRoles: null },
    });
    const res = { redirect: vi.fn() };
    const next = vi.fn();

    check2FA(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('passes when the user role is not a two-factor role', () => {
    const req = createReq({ currentClientRole: 'member', user: { id: 5 } });
    const res = { redirect: vi.fn() };
    const next = vi.fn();

    check2FA(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
