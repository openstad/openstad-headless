import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const authConfig = require('../../../config/auth');
const db = require('../../../db');
const auditLog = require('../../../middleware/auditLog');
const lockout = require('../../../utils/uniqueCodeLockout');
const controller = require('./uniqueCodeLogin');

const client = { id: 7, clientId: 'project-7', config: { defaultRoleId: 5 } };

const fakeUser = (id) => ({
  id,
  dataValues: { id, password: 'secret', hashedPhoneNumber: 'hash', name: 'x' },
  getRoleForClient: vi.fn().mockResolvedValue('member'),
});

const call = async (body, requestClient = client) => {
  const req = {
    user: requestClient,
    body,
    ip: '10.0.0.1',
    headers: {},
    originalUrl: '/api/admin/unique-code-login',
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  await controller.post(req, res, next);
  return { res, next };
};

beforeEach(() => {
  vi.spyOn(lockout, 'lockScope').mockResolvedValue(null);
  vi.spyOn(lockout, 'registerFailure').mockResolvedValue({});
  vi.spyOn(auditLog, 'logAuthEvent').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('POST /api/admin/unique-code-login', () => {
  it('rejects a request without a code', async () => {
    const { res } = await call({});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'code_required' });
  });

  it('returns 429 when locked and does not look up the code', async () => {
    lockout.lockScope.mockResolvedValue('client');
    const findOne = vi.spyOn(db.UniqueCode, 'findOne');

    const { res } = await call({ code: 'ABC', ip: '1.2.3.4' });

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'too_many_attempts',
      scope: 'client',
    });
    expect(findOne).not.toHaveBeenCalled();
    expect(lockout.lockScope).toHaveBeenCalledWith({
      clientId: 7,
      ip: '1.2.3.4',
    });
  });

  it('registers a failure and logs login_failed for an unknown code', async () => {
    vi.spyOn(db.UniqueCode, 'findOne').mockResolvedValue(null);

    const { res } = await call({ code: 'WRONG', ip: '1.2.3.4' });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid_code' });
    expect(lockout.registerFailure).toHaveBeenCalledWith({
      clientId: 7,
      ip: '1.2.3.4',
    });
    expect(auditLog.logAuthEvent.mock.calls[0][0].user).toEqual({});
    expect(auditLog.logAuthEvent.mock.calls[0][1]).toBe('login_failed');
  });

  it('scopes the code lookup to the authenticated client, not the body', async () => {
    const findOne = vi.spyOn(db.UniqueCode, 'findOne').mockResolvedValue(null);

    await call({ code: 'ABC', clientId: 99 });

    expect(findOne).toHaveBeenCalledWith({
      where: { code: 'ABC', clientId: 7 },
    });
  });

  it('creates and links a user for a fresh code and assigns the default role', async () => {
    vi.spyOn(db.UniqueCode, 'findOne').mockResolvedValue({
      id: 3,
      userId: null,
    });
    const update = vi.spyOn(db.UniqueCode, 'update').mockResolvedValue([1]);
    vi.spyOn(db.User, 'create').mockResolvedValue(fakeUser(11));
    vi.spyOn(db.UserRole, 'findOne').mockResolvedValue(null);
    const createRole = vi.spyOn(db.UserRole, 'create').mockResolvedValue({});

    const { res } = await call({ code: 'NEW' });

    expect(update).toHaveBeenCalledWith(
      { userId: 11 },
      { where: { id: 3, userId: null } }
    );
    expect(createRole).toHaveBeenCalledWith({
      clientId: 7,
      roleId: 5,
      userId: 11,
    });
    const body = res.json.mock.calls[0][0];
    expect(body.isNew).toBe(true);
    expect(body.role).toBe('member');
    expect(body.user).toEqual({ id: 11, name: 'x' });
    expect(auditLog.logAuthEvent.mock.calls[0][0].user.id).toBe(11);
    expect(auditLog.logAuthEvent.mock.calls[0][1]).toBe('login');
  });

  it('joins the winner when a concurrent first use claimed the code', async () => {
    vi.spyOn(db.UniqueCode, 'findOne')
      .mockResolvedValueOnce({ id: 3, userId: null })
      .mockResolvedValueOnce({ id: 3, userId: 12 });
    vi.spyOn(db.UniqueCode, 'update').mockResolvedValue([0]);
    const loser = { ...fakeUser(11), destroy: vi.fn().mockResolvedValue() };
    vi.spyOn(db.User, 'create').mockResolvedValue(loser);
    vi.spyOn(db.User, 'findOne').mockResolvedValue(fakeUser(12));
    vi.spyOn(db.UserRole, 'findOne').mockResolvedValue({ roleId: 2 });

    const { res } = await call({ code: 'RACE' });

    expect(loser.destroy).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.user.id).toBe(12);
    expect(body.isNew).toBe(false);
  });

  it('logs in as the linked user for a code that is already linked', async () => {
    vi.spyOn(db.UniqueCode, 'findOne').mockResolvedValue({ userId: 12 });
    const findUser = vi
      .spyOn(db.User, 'findOne')
      .mockResolvedValue(fakeUser(12));
    const createUser = vi.spyOn(db.User, 'create');
    vi.spyOn(db.UserRole, 'findOne').mockResolvedValue({ roleId: 2 });
    const createRole = vi.spyOn(db.UserRole, 'create');

    const { res } = await call({ code: 'LINKED' });

    expect(findUser).toHaveBeenCalledWith({ where: { id: 12 } });
    expect(createUser).not.toHaveBeenCalled();
    expect(createRole).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].isNew).toBe(false);
  });

  it('fails without counting a guess when the linked user no longer exists', async () => {
    vi.spyOn(db.UniqueCode, 'findOne').mockResolvedValue({ userId: 13 });
    vi.spyOn(db.User, 'findOne').mockResolvedValue(null);

    const { res } = await call({ code: 'ORPHAN' });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(lockout.registerFailure).not.toHaveBeenCalled();
  });

  it('falls back to the auth type default role without a client default', async () => {
    vi.spyOn(db.UniqueCode, 'findOne').mockResolvedValue({ userId: 12 });
    vi.spyOn(db.User, 'findOne').mockResolvedValue(fakeUser(12));
    vi.spyOn(db.UserRole, 'findOne').mockResolvedValue(null);
    const createRole = vi.spyOn(db.UserRole, 'create').mockResolvedValue({});

    await call({ code: 'LINKED' }, { ...client, config: {} });

    expect(createRole).toHaveBeenCalledWith({
      clientId: 7,
      roleId: authConfig.get('UniqueCode').defaultRoleId,
      userId: 12,
    });
  });

  it('passes database errors to next', async () => {
    const error = new Error('db down');
    vi.spyOn(db.UniqueCode, 'findOne').mockRejectedValue(error);

    const { next } = await call({ code: 'ABC' });

    expect(next).toHaveBeenCalledWith(error);
  });
});
