import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationFactory from './Notification.js';

// Notification.js takes (db, sequelize, DataTypes) as plain arguments and
// only calls sequelize.define() once, so the hooks can be captured directly
// without standing up a real Sequelize model.
function buildNotificationHooks(db) {
  let hooks;
  const sequelize = {
    define: (name, attributes, options) => {
      hooks = options.hooks;
      return { prototype: {} };
    },
  };
  NotificationFactory(db, sequelize, {
    INTEGER: 'INTEGER',
    ENUM: () => 'ENUM',
    STRING: 'STRING',
    JSON: 'JSON',
  });
  return hooks;
}

function makeInstance(overrides = {}) {
  const instance = {
    id: 1,
    projectId: 5,
    type: 'notification comment - user',
    engine: 'email',
    to: 'author@example.com',
    from: 'noreply@example.com',
    data: { comment: { description: 'hi' } },
    status: 'new',
    update: vi.fn(async function (patch) {
      Object.assign(instance, patch);
    }),
    ...overrides,
  };
  return instance;
}

// Pins the step-2 fix: a mail failure during afterCreate must leave the
// notification on status 'failed', never stuck on 'pending' forever (the
// cron only retries 'queued' rows, so 'pending' was silent permanent loss).
describe('Notification afterCreate', () => {
  let db;
  let afterCreate;

  beforeEach(() => {
    const message = { send: vi.fn().mockResolvedValue(undefined) };
    db = {
      NotificationMessage: {
        create: vi.fn().mockResolvedValue(message),
      },
    };
    afterCreate = buildNotificationHooks(db).afterCreate;
  });

  it('marks the notification as sent when the message sends successfully', async () => {
    const instance = makeInstance();

    await afterCreate(instance, {});

    expect(instance.status).toBe('sent');
  });

  it('marks the notification as failed (not pending) when sending throws', async () => {
    db.NotificationMessage.create.mockRejectedValue(
      new Error('Notification template not found')
    );
    const instance = makeInstance();

    await afterCreate(instance, {});

    expect(instance.status).toBe('failed');
    expect(instance.status).not.toBe('pending');
  });

  it('marks the notification as failed when the message object rejects on send', async () => {
    const message = { send: vi.fn().mockRejectedValue(new Error('smtp down')) };
    db.NotificationMessage.create.mockResolvedValue(message);
    const instance = makeInstance();

    await afterCreate(instance, {});

    expect(instance.status).toBe('failed');
  });

  it('queues non-immediate notification types instead of sending right away', async () => {
    const instance = makeInstance({
      type: 'new or updated comment - admin update',
    });

    await afterCreate(instance, {});

    expect(instance.status).toBe('queued');
    expect(db.NotificationMessage.create).not.toHaveBeenCalled();
  });
});
