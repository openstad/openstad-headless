import { Op } from 'sequelize';
import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference (the db
// singleton) that the service holds, then stub methods on it — the pattern used
// across this app's tests (vi.mock does not intercept these internal requires).
const require = createRequire(import.meta.url);
const db = require('../db');
const authSettings = require('../util/auth-settings');
const projectUsers = require('./projectUsers');

const orig = {
  userFindAll: db.User.findAll,
  userFindOne: db.User.findOne,
  userCreate: db.User.create,
  authConfig: authSettings.config,
  authAdapter: authSettings.adapter,
};

const updateUserOnAuthServer = vi.fn();

function stubAuth() {
  authSettings.config = vi.fn().mockResolvedValue({ provider: 'openstad' });
  authSettings.adapter = vi.fn().mockResolvedValue({
    service: { updateUser: updateUserOnAuthServer },
  });
}

afterEach(() => {
  db.User.findAll = orig.userFindAll;
  db.User.findOne = orig.userFindOne;
  db.User.create = orig.userCreate;
  authSettings.config = orig.authConfig;
  authSettings.adapter = orig.authAdapter;
  vi.clearAllMocks();
});

describe('addAutoAdminUsers', () => {
  const project = { id: 5 };

  it('creates an admin row for each flagged admin-project user', async () => {
    stubAuth();
    db.User.findAll = vi.fn().mockResolvedValue([
      {
        id: 11,
        projectId: 1,
        role: 'editor',
        autoAddToNewProjects: true,
        idpUser: { identifier: 'idp-1', provider: 'openstad' },
      },
    ]);
    db.User.findOne = vi.fn().mockResolvedValue(null);
    db.User.create = vi.fn().mockResolvedValue({});

    await projectUsers.addAutoAdminUsers(project);

    expect(db.User.findAll).toHaveBeenCalledWith({
      where: {
        projectId: 1,
        autoAddToNewProjects: true,
        role: { [Op.in]: ['admin', 'editor'] },
      },
      raw: true,
    });
    expect(db.User.create).toHaveBeenCalledTimes(1);
    const created = db.User.create.mock.calls[0][0];
    expect(created.projectId).toBe(5);
    expect(created.role).toBe('admin');
    expect(created.id).toBeUndefined();
    expect(created.autoAddToNewProjects).toBeUndefined();
    expect(updateUserOnAuthServer).toHaveBeenCalledWith({
      authConfig: { provider: 'openstad' },
      userData: { id: 'idp-1', role: 'admin' },
    });
  });

  it('updates the existing row when the user is already on the project', async () => {
    stubAuth();
    const existing = { update: vi.fn().mockResolvedValue({}) };
    db.User.findAll = vi.fn().mockResolvedValue([
      {
        id: 11,
        projectId: 1,
        role: 'admin',
        autoAddToNewProjects: true,
        idpUser: { identifier: 'idp-1', provider: 'openstad' },
      },
    ]);
    db.User.findOne = vi.fn().mockResolvedValue(existing);
    db.User.create = vi.fn();

    await projectUsers.addAutoAdminUsers(project);

    expect(existing.update).toHaveBeenCalledTimes(1);
    expect(existing.update.mock.calls[0][0].role).toBe('admin');
    expect(db.User.create).not.toHaveBeenCalled();
  });

  it('skips flagged users without an idp identifier', async () => {
    stubAuth();
    db.User.findAll = vi
      .fn()
      .mockResolvedValue([
        { id: 11, projectId: 1, role: 'admin', idpUser: {} },
      ]);
    db.User.findOne = vi.fn();
    db.User.create = vi.fn();

    await projectUsers.addAutoAdminUsers(project);

    expect(db.User.findOne).not.toHaveBeenCalled();
    expect(db.User.create).not.toHaveBeenCalled();
  });

  it('does nothing when the new project is the admin project itself', async () => {
    db.User.findAll = vi.fn();

    await projectUsers.addAutoAdminUsers({ id: 1 });

    expect(db.User.findAll).not.toHaveBeenCalled();
  });

  it('continues with remaining users when one grant fails', async () => {
    stubAuth();
    db.User.findAll = vi.fn().mockResolvedValue([
      {
        id: 11,
        projectId: 1,
        role: 'admin',
        idpUser: { identifier: 'idp-1', provider: 'openstad' },
      },
      {
        id: 12,
        projectId: 1,
        role: 'admin',
        idpUser: { identifier: 'idp-2', provider: 'openstad' },
      },
    ]);
    db.User.findOne = vi.fn().mockResolvedValue(null);
    db.User.create = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({});
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await projectUsers.addAutoAdminUsers(project);

    expect(db.User.create).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});

describe('upsertProjectUser', () => {
  it('copies the source role when no override is given', async () => {
    stubAuth();
    db.User.findOne = vi.fn().mockResolvedValue(null);
    db.User.create = vi.fn().mockResolvedValue({});

    await projectUsers.upsertProjectUser(
      {
        id: 3,
        projectId: 2,
        role: 'editor',
        idpUser: { identifier: 'idp-3', provider: 'openstad' },
      },
      { id: 9 }
    );

    const created = db.User.create.mock.calls[0][0];
    expect(created.role).toBe('editor');
    expect(created.projectId).toBe(9);
  });
});
