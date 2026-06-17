import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashWidgetUrl, recordWidgetLoad } from './normalize-widget-url.js';

function createMockDb({ widget, existingLoad } = {}) {
  return {
    Project: {},
    Widget: {
      findOne: vi.fn().mockResolvedValue(widget ?? null),
    },
    WidgetLoad: {
      findOne: vi.fn().mockResolvedValue(existingLoad ?? null),
      create: vi.fn().mockResolvedValue({}),
    },
  };
}

const widget = { id: 12, project: { id: 3 } };

describe('recordWidgetLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a row with the normalized url and hash for a new url', async () => {
    const db = createMockDb({ widget });

    const result = await recordWidgetLoad(db, {
      widgetId: '12',
      rawUrl: 'https://openstad.org/test?p=4#x',
    });

    expect(result.status).toBe('created');
    expect(db.WidgetLoad.create).toHaveBeenCalledWith({
      projectId: 3,
      widgetId: 12,
      url: 'https://openstad.org/test',
      urlHash: hashWidgetUrl('https://openstad.org/test'),
    });
  });

  it('updates count and lastSeen for a known url', async () => {
    const existingLoad = {
      count: 4,
      update: vi.fn().mockResolvedValue({}),
    };
    const db = createMockDb({ widget, existingLoad });

    const result = await recordWidgetLoad(db, {
      widgetId: '12',
      rawUrl: 'https://openstad.org/test',
    });

    expect(result.status).toBe('updated');
    expect(existingLoad.update).toHaveBeenCalledWith({
      count: 5,
      lastSeen: expect.any(Date),
    });
    expect(db.WidgetLoad.create).not.toHaveBeenCalled();
  });

  it('returns not-found for an unknown widget', async () => {
    const db = createMockDb({ widget: null });

    const result = await recordWidgetLoad(db, {
      widgetId: '999',
      rawUrl: 'https://openstad.org/test',
    });

    expect(result.status).toBe('not-found');
    expect(db.WidgetLoad.findOne).not.toHaveBeenCalled();
    expect(db.WidgetLoad.create).not.toHaveBeenCalled();
  });

  it('returns invalid-url for an unusable url without touching the db', async () => {
    const db = createMockDb({ widget });

    const result = await recordWidgetLoad(db, {
      widgetId: '12',
      rawUrl: 'javascript:alert(1)',
    });

    expect(result.status).toBe('invalid-url');
    expect(db.Widget.findOne).not.toHaveBeenCalled();
    expect(db.WidgetLoad.create).not.toHaveBeenCalled();
  });

  it('falls back to an update when create hits the unique index (race)', async () => {
    const db = createMockDb({ widget });
    const racedRow = {
      count: 1,
      update: vi.fn().mockResolvedValue({}),
    };
    db.WidgetLoad.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(racedRow);
    db.WidgetLoad.create.mockRejectedValue(
      Object.assign(new Error('duplicate'), {
        name: 'SequelizeUniqueConstraintError',
      })
    );

    const result = await recordWidgetLoad(db, {
      widgetId: '12',
      rawUrl: 'https://openstad.org/test',
    });

    expect(result.status).toBe('updated');
    expect(racedRow.update).toHaveBeenCalledWith({
      count: 2,
      lastSeen: expect.any(Date),
    });
  });

  it('rethrows unexpected create errors', async () => {
    const db = createMockDb({ widget });
    db.WidgetLoad.create.mockRejectedValue(new Error('db down'));

    await expect(
      recordWidgetLoad(db, {
        widgetId: '12',
        rawUrl: 'https://openstad.org/test',
      })
    ).rejects.toThrow('db down');
  });
});
