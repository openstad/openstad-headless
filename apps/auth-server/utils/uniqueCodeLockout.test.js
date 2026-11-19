import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const lockout = require('./uniqueCodeLockout');

afterEach(() => vi.restoreAllMocks());

describe('uniqueCodeLockout.lockScope', () => {
  it('is not locked below both thresholds', async () => {
    vi.spyOn(db.LoginAttempt, 'count')
      .mockResolvedValueOnce(199)
      .mockResolvedValueOnce(19);

    expect(await lockout.lockScope({ clientId: 1, ip: '1.2.3.4' })).toBe(null);
  });

  it('locks a single ip after 20 failures', async () => {
    vi.spyOn(db.LoginAttempt, 'count')
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(20);

    expect(await lockout.lockScope({ clientId: 1, ip: '1.2.3.4' })).toBe('ip');
  });

  it('locks the whole client at the ceiling without counting per ip', async () => {
    const count = vi.spyOn(db.LoginAttempt, 'count').mockResolvedValueOnce(200);

    expect(await lockout.lockScope({ clientId: 1, ip: '1.2.3.4' })).toBe(
      'client'
    );
    expect(count).toHaveBeenCalledTimes(1);
  });

  it('only applies the client ceiling when no ip is given', async () => {
    const count = vi.spyOn(db.LoginAttempt, 'count').mockResolvedValueOnce(50);

    expect(await lockout.lockScope({ clientId: 1 })).toBe(null);
    expect(count).toHaveBeenCalledTimes(1);
  });
});

describe('uniqueCodeLockout.registerFailure', () => {
  it('stores the client and ip', async () => {
    const create = vi.spyOn(db.LoginAttempt, 'create').mockResolvedValue({});

    await lockout.registerFailure({ clientId: 1, ip: '1.2.3.4' });

    expect(create).toHaveBeenCalledWith({ clientId: 1, ip: '1.2.3.4' });
  });
});
