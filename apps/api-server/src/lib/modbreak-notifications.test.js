import fs from 'fs';
import nunjucks from 'nunjucks';
import path from 'path';
import { describe, expect, it, vi } from 'vitest';

import {
  buildResourceRedirectUrl,
  buildUnsubscribeUrl,
  findChangedModBreaks,
  findNewModBreaks,
  resolveModBreakRecipients,
  sendModBreakNotifications,
  snapshotModBreakDescriptions,
  snapshotModBreakIds,
} from './modbreak-notifications.js';

describe('snapshotModBreakIds', () => {
  it('returns an empty set for null, undefined and non-array input', () => {
    expect(snapshotModBreakIds(null)).toEqual(new Set());
    expect(snapshotModBreakIds(undefined)).toEqual(new Set());
    expect(snapshotModBreakIds('not an array')).toEqual(new Set());
  });

  it('collects ids and tolerates entries without an id', () => {
    const result = snapshotModBreakIds([
      { id: '1', description: 'a' },
      { description: 'no id here' },
      { id: '2', description: 'b' },
    ]);
    expect(result).toEqual(new Set(['1', '2']));
  });
});

describe('findNewModBreaks', () => {
  it('detects a newly added entry', () => {
    const previousIds = new Set(['1']);
    const saved = [
      { id: '1', description: 'existing' },
      { id: '2', description: 'brand new' },
    ];
    expect(findNewModBreaks(previousIds, saved)).toEqual([
      { id: '2', description: 'brand new' },
    ]);
  });

  it('does not flag editing the description of an existing entry', () => {
    const previousIds = new Set(['1']);
    const saved = [{ id: '1', description: 'edited text' }];
    expect(findNewModBreaks(previousIds, saved)).toEqual([]);
  });

  it('does not flag a deleted entry (it is simply absent from saved)', () => {
    const previousIds = new Set(['1', '2']);
    const saved = [{ id: '1', description: 'still here' }];
    expect(findNewModBreaks(previousIds, saved)).toEqual([]);
  });

  it('does not flag reordering existing entries', () => {
    const previousIds = new Set(['1', '2']);
    const saved = [
      { id: '2', description: 'second' },
      { id: '1', description: 'first' },
    ];
    expect(findNewModBreaks(previousIds, saved)).toEqual([]);
  });

  it('returns all new entries when multiple are added in one save', () => {
    const previousIds = new Set(['1']);
    const saved = [
      { id: '1', description: 'existing' },
      { id: '2', description: 'new one' },
      { id: '3', description: 'new two' },
    ];
    expect(findNewModBreaks(previousIds, saved)).toEqual([
      { id: '2', description: 'new one' },
      { id: '3', description: 'new two' },
    ]);
  });

  it('does not flag a new entry with an empty or whitespace-only description', () => {
    const previousIds = new Set(['1']);
    const saved = [
      { id: '2', description: '' },
      { id: '3', description: '   ' },
    ];
    expect(findNewModBreaks(previousIds, saved)).toEqual([]);
  });

  it('treats existing entries that arrive without ids as new (stable-id contract)', () => {
    // This locks in the stable-id contract documented in the plan: a client
    // that omits ids on entries that already existed gets those entries
    // treated as brand new, because the model mints a fresh uuid for any
    // entry without one on every save. There is no reliable way to tell
    // "existing, id dropped" apart from "genuinely new" without ids.
    const previousIds = new Set(); // nothing seen yet, since no ids were ever returned
    const saved = [
      { id: 'freshly-minted-uuid', description: 'was already there' },
    ];
    expect(findNewModBreaks(previousIds, saved)).toEqual([
      { id: 'freshly-minted-uuid', description: 'was already there' },
    ]);
  });
});

describe('snapshotModBreakDescriptions', () => {
  it('returns an empty map for null, undefined and non-array input', () => {
    expect(snapshotModBreakDescriptions(null)).toEqual(new Map());
    expect(snapshotModBreakDescriptions(undefined)).toEqual(new Map());
    expect(snapshotModBreakDescriptions('not an array')).toEqual(new Map());
  });

  it('maps id to description and tolerates entries without an id', () => {
    const result = snapshotModBreakDescriptions([
      { id: '1', description: 'a' },
      { description: 'no id here' },
      { id: '2', description: 'b' },
    ]);
    expect(result).toEqual(
      new Map([
        ['1', 'a'],
        ['2', 'b'],
      ])
    );
  });
});

describe('findChangedModBreaks', () => {
  it('detects an edited description on an existing entry', () => {
    const previousDescriptions = new Map([['1', 'original text']]);
    const saved = [{ id: '1', description: 'edited text' }];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([
      { id: '1', description: 'edited text' },
    ]);
  });

  it('does not flag an entry whose description is unchanged', () => {
    const previousDescriptions = new Map([['1', 'same text']]);
    const saved = [{ id: '1', description: 'same text' }];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([]);
  });

  it('ignores surrounding whitespace when comparing', () => {
    const previousDescriptions = new Map([['1', 'same text']]);
    const saved = [{ id: '1', description: '  same text  ' }];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([]);
  });

  it('does not flag a brand-new entry (no previous id)', () => {
    const previousDescriptions = new Map([['1', 'existing']]);
    const saved = [
      { id: '1', description: 'existing' },
      { id: '2', description: 'brand new' },
    ];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([]);
  });

  it('does not flag an edit that clears the description', () => {
    const previousDescriptions = new Map([['1', 'original text']]);
    const saved = [{ id: '1', description: '   ' }];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([]);
  });

  it('does not flag reordering existing entries', () => {
    const previousDescriptions = new Map([
      ['1', 'first'],
      ['2', 'second'],
    ]);
    const saved = [
      { id: '2', description: 'second' },
      { id: '1', description: 'first' },
    ];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([]);
  });

  it('flags a change to whitespace inside the text (only leading/trailing is ignored)', () => {
    const previousDescriptions = new Map([['1', 'same  text']]);
    const saved = [{ id: '1', description: 'same text' }];
    expect(findChangedModBreaks(previousDescriptions, saved)).toEqual([
      { id: '1', description: 'same text' },
    ]);
  });
});

function fakeUser(overrides) {
  return {
    id: 1,
    email: 'user@example.org',
    emailNotificationConsent: true,
    ...overrides,
  };
}

describe('resolveModBreakRecipients', () => {
  it('returns the owner', async () => {
    const db = {
      User: {
        findByPk: async () => fakeUser({ id: 10, email: 'author@example.org' }),
      },
    };
    const recipients = await resolveModBreakRecipients({
      db,
      resource: { id: 1, userId: 10 },
      excludeUserId: null,
    });
    expect(recipients).toEqual([{ userId: 10, email: 'author@example.org' }]);
  });

  it('skips the owner when emailNotificationConsent is false', async () => {
    const db = {
      User: {
        findByPk: async () =>
          fakeUser({
            id: 10,
            email: 'author@example.org',
            emailNotificationConsent: false,
          }),
      },
    };
    const recipients = await resolveModBreakRecipients({
      db,
      resource: { id: 1, userId: 10 },
      excludeUserId: null,
    });
    expect(recipients).toEqual([]);
  });

  it('skips the owner without an email', async () => {
    const db = {
      User: { findByPk: async () => fakeUser({ id: 10, email: null }) },
    };
    const recipients = await resolveModBreakRecipients({
      db,
      resource: { id: 1, userId: 10 },
      excludeUserId: null,
    });
    expect(recipients).toEqual([]);
  });

  it('excludes the editor who placed the modbreak', async () => {
    const db = {
      User: {
        findByPk: async () => fakeUser({ id: 10, email: 'author@example.org' }),
      },
    };
    const recipients = await resolveModBreakRecipients({
      db,
      resource: { id: 1, userId: 10 },
      excludeUserId: 10,
    });
    expect(recipients).toEqual([]);
  });
});

describe('buildResourceRedirectUrl', () => {
  it('returns an empty string when project.url is falsy', () => {
    expect(buildResourceRedirectUrl({ url: '' })).toBe('');
    expect(buildResourceRedirectUrl(null)).toBe('');
  });

  it('adds https:// when the url has no scheme', () => {
    expect(buildResourceRedirectUrl({ url: 'example.org' })).toBe(
      'https://example.org'
    );
  });

  it('strips a trailing slash from a url that already has a scheme', () => {
    expect(buildResourceRedirectUrl({ url: 'https://example.org/' })).toBe(
      'https://example.org'
    );
  });
});

describe('buildUnsubscribeUrl', () => {
  it('returns an empty string when there is no userId', () => {
    expect(buildUnsubscribeUrl({ userId: null, projectId: 2 })).toBe('');
  });

  it('builds a link for userId 0 (falsy but valid... treated as absent here)', () => {
    // userId 0 does not occur in this system (ids start at 1), but the
    // helper follows the same falsy-check shape as the rest of the code:
    // a userId of 0 is treated the same as "no userId".
    expect(buildUnsubscribeUrl({ userId: 0, projectId: 2 })).toBe('');
  });
});

// A fake db for sendModBreakNotifications: one project with the given
// toggles, an owner, and a spy on Notification.create. Comment.findAll
// throws so a leftover commenter query would fail loudly instead of
// silently passing.
function fakeSendDb({ notifications = {}, author } = {}) {
  return {
    Project: {
      scope: () => ({
        findByPk: async () => ({
          url: 'example.org',
          emailConfig: { notifications },
        }),
      }),
    },
    User: {
      findByPk: async () => author,
    },
    Comment: {
      findAll: async () => {
        throw new Error('Comment.findAll should not be called anymore');
      },
    },
    Notification: {
      create: vi.fn(async () => ({})),
    },
  };
}

function fakeReq({ userId = 1, resourceUserId = 10 } = {}) {
  return {
    project: { id: 2 },
    params: { projectId: '2' },
    user: { id: userId },
    results: { id: 5, userId: resourceUserId },
  };
}

describe('sendModBreakNotifications', () => {
  const newModBreaks = [{ id: 'a', description: '<p>Let op</p>' }];

  it('does nothing when there are no new or changed modbreaks', async () => {
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: true },
      author: fakeUser({ id: 10, email: 'author@example.org' }),
    });
    const result = await sendModBreakNotifications({
      db,
      req: fakeReq(),
      newModBreaks: [],
      changedModBreaks: [],
    });
    expect(result).toBeUndefined();
    expect(db.Notification.create).not.toHaveBeenCalled();
  });

  it('sends nothing when the project toggle is off', async () => {
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: false },
      author: fakeUser({ id: 10, email: 'author@example.org' }),
    });
    const result = await sendModBreakNotifications({
      db,
      req: fakeReq(),
      newModBreaks,
      changedModBreaks: [],
    });
    expect(result).toBeUndefined();
    expect(db.Notification.create).not.toHaveBeenCalled();
  });

  it('creates exactly one notification, to the owner, even with a stale commenters toggle', async () => {
    const db = fakeSendDb({
      notifications: {
        sendModBreakNotification: true,
        // Stale key from a project that saved it before this option was
        // removed; nothing reads it anymore, so it must have no effect.
        sendModBreakNotificationToCommenters: true,
      },
      author: fakeUser({ id: 10, email: 'author@example.org' }),
    });
    const { sending } = await sendModBreakNotifications({
      db,
      req: fakeReq(),
      newModBreaks,
      changedModBreaks: [],
    });
    await sending;

    expect(db.Notification.create).toHaveBeenCalledTimes(1);
    const first = db.Notification.create.mock.calls[0][0];
    expect(first).toMatchObject({
      type: 'new modbreak - user feedback',
      projectId: 2,
      to: 'author@example.org',
      data: {
        userId: 10,
        resourceId: 5,
        newModBreaks,
        changedModBreaks: [],
        redirectUrl: 'https://example.org',
      },
    });
  });

  it('does not mail the creator of a new resource (create route usage)', async () => {
    // On create the author is normally the admin who placed the modbreak.
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: true },
      author: fakeUser({ id: 1, email: 'admin@example.org' }),
    });
    const { sending } = await sendModBreakNotifications({
      db,
      req: fakeReq({ userId: 1, resourceUserId: 1 }),
      newModBreaks: findNewModBreaks(new Set(), newModBreaks),
      changedModBreaks: [],
    });
    await sending;
    expect(db.Notification.create).not.toHaveBeenCalled();
  });

  it('mails the author when an admin creates a resource on their behalf', async () => {
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: true },
      author: fakeUser({ id: 10, email: 'author@example.org' }),
    });
    const { sending } = await sendModBreakNotifications({
      db,
      req: fakeReq({ userId: 1, resourceUserId: 10 }),
      newModBreaks: findNewModBreaks(new Set(), newModBreaks),
      changedModBreaks: [],
    });
    await sending;
    expect(db.Notification.create).toHaveBeenCalledTimes(1);
    expect(db.Notification.create.mock.calls[0][0].to).toBe(
      'author@example.org'
    );
  });

  it('uses an explicit resource over req.results (create route: refetch can be null)', async () => {
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: true },
      author: fakeUser({ id: 10, email: 'author@example.org' }),
    });
    const req = { ...fakeReq(), results: null };
    const { sending } = await sendModBreakNotifications({
      db,
      req,
      resource: { id: 7, userId: 10 },
      newModBreaks,
      changedModBreaks: [],
    });
    await sending;
    expect(db.Notification.create).toHaveBeenCalledTimes(1);
    expect(db.Notification.create.mock.calls[0][0].data.resourceId).toBe(7);
  });

  it('is a no-op (does not throw) when there is no resource', async () => {
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: true },
    });
    await expect(
      sendModBreakNotifications({
        db,
        req: { ...fakeReq(), results: null },
        newModBreaks,
        changedModBreaks: [],
      })
    ).resolves.toBeUndefined();
    expect(db.Notification.create).not.toHaveBeenCalled();
  });

  it('never throws when a lookup fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const db = fakeSendDb({
      notifications: { sendModBreakNotification: true },
    });
    db.User.findByPk = async () => {
      throw new Error('db down');
    };
    await expect(
      sendModBreakNotifications({
        db,
        req: fakeReq(),
        newModBreaks,
        changedModBreaks: [],
      })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("default template 'new modbreak - user feedback'", () => {
  const templatePath = path.join(
    __dirname,
    '../notifications/default-templates/new modbreak - user feedback'
  );
  const body = fs
    .readFileSync(templatePath, 'utf8')
    .match(/<body>((?:.|\r|\n)*)<\/body>/)[1];
  // Same environment as NotificationMessage.js: autoescape is on by default.
  const render = (data) => new nunjucks.Environment().renderString(body, data);

  it('renders the (already sanitized) modbreak HTML, not escaped markup', () => {
    const html = render({
      user: { name: 'Jan' },
      resource: { title: 'Plan' },
      newModBreaks: [
        {
          description: '<p><strong>Let op</strong></p>',
          authorName: 'Redactie',
        },
      ],
      changedModBreaks: [
        { description: '<p>Aangepast</p>', authorName: 'Redactie' },
      ],
    });
    expect(html).toContain('<p><strong>Let op</strong></p>');
    expect(html).toContain('<p>Aangepast</p>');
    expect(html).not.toContain('&lt;strong&gt;');
  });

  it('still escapes the author name', () => {
    const html = render({
      newModBreaks: [{ description: 'x', authorName: '<b>Redactie</b>' }],
    });
    expect(html).toContain('&lt;b&gt;Redactie&lt;/b&gt;');
  });
});
