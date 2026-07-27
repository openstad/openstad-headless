import { beforeEach, describe, expect, it, vi } from 'vitest';

import processQueuedNotifications from './cron.js';

function notification(overrides) {
  return {
    projectId: 1,
    engine: 'email',
    from: 'a@b.c',
    to: 'd@e.f',
    data: {},
    update: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('processQueuedNotifications', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('marks a broken notification as failed and still sends the rest', async () => {
    const broken = notification({ type: 'nonsense type' });
    const valid = notification({ type: 'submission', to: 'g@h.i' });

    const db = {
      Notification: {
        scope: () => ({
          findAll: vi.fn().mockResolvedValue([broken, valid]),
        }),
      },
      NotificationMessage: {
        create: vi.fn(async ({ type }) => {
          if (type === 'nonsense type') throw new Error('template not found');
          return { send: vi.fn().mockResolvedValue(undefined) };
        }),
      },
    };

    await processQueuedNotifications(db);

    expect(broken.update).toHaveBeenCalledWith({ status: 'failed' });
    expect(valid.update).toHaveBeenCalledWith({ status: 'sent' });
  });
});
