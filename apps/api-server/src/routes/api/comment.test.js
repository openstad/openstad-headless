import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nodeRequire = createRequire(import.meta.url);
const dbPath = nodeRequire.resolve('../../db');

const db = {
  Comment: {},
  Resource: { findByPk: vi.fn() },
  User: { findByPk: vi.fn() },
  Notification: { create: vi.fn() },
};

nodeRequire.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: db,
};

const commentRouter = nodeRequire('./comment.js');

function getConfirmationHandler() {
  const route = commentRouter.stack.find(
    (layer) => layer.route && layer.route.path === '/'
  ).route;
  return route.stack[route.stack.length - 1].handle;
}

function makeReq(overrides = {}) {
  return {
    confirmation: false,
    confirmationReplies: false,
    overwriteEmailAddress: '',
    embeddedUrl: '',
    project: { id: 5 },
    parentComment: null,
    results: {
      description: 'a comment',
      sentiment: 'for',
      createDateHumanized: 'today',
    },
    ...overrides,
  };
}

function makeRes() {
  return { json: vi.fn() };
}

describe('comment.js POST / confirmation handler', () => {
  const handler = getConfirmationHandler();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends "notification comment - user" in the background for a top-level comment and returns the notification id', async () => {
    db.Resource.findByPk.mockResolvedValue({ id: 1, userId: 42 });
    db.User.findByPk.mockResolvedValue({
      id: 42,
      email: 'author@example.com',
      emailNotificationConsent: true,
      projectId: 5,
    });
    db.Notification.create.mockResolvedValue({ id: 11, status: 'pending' });

    const req = makeReq({
      confirmation: true,
      results: { ...makeReq().results, resourceId: 1 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(db.Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'notification comment - user' }),
      { sendInBackground: true }
    );
    expect(req.results.confirmationNotificationId).toBe(11);
    expect(req.results.confirmationSent).toBeUndefined();
    expect(res.json).toHaveBeenCalledWith(req.results);
  });

  it('sends "notification comment reply - user" in the background for a reply and returns the notification id', async () => {
    db.User.findByPk.mockResolvedValue({
      id: 7,
      email: 'parent@example.com',
      emailNotificationConsent: true,
      projectId: 5,
    });
    db.Notification.create.mockResolvedValue({ id: 12, status: 'pending' });

    const req = makeReq({
      confirmationReplies: true,
      parentComment: { user: { id: 7 }, description: 'the parent comment' },
      results: { ...makeReq().results, parentId: 9 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(db.Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'notification comment reply - user' }),
      { sendInBackground: true }
    );
    expect(req.results.confirmationNotificationId).toBe(12);
  });

  it('reports confirmationSent undefined when creating the notification rejects', async () => {
    db.Resource.findByPk.mockResolvedValue({ id: 1, userId: 42 });
    db.User.findByPk.mockResolvedValue({
      id: 42,
      email: 'author@example.com',
      emailNotificationConsent: true,
      projectId: 5,
    });
    db.Notification.create.mockRejectedValue(new Error('smtp down'));

    const req = makeReq({
      confirmation: true,
      results: { ...makeReq().results, resourceId: 1 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(req.results.confirmationSent).toBeUndefined();
    expect(req.results.confirmationNotificationId).toBeUndefined();
  });

  it('reports confirmationSent false and never creates a notification when the author has no consent', async () => {
    db.Resource.findByPk.mockResolvedValue({ id: 1, userId: 42 });
    db.User.findByPk.mockResolvedValue({
      id: 42,
      email: 'author@example.com',
      emailNotificationConsent: false,
    });

    const req = makeReq({
      confirmation: true,
      results: { ...makeReq().results, resourceId: 1 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(db.Notification.create).not.toHaveBeenCalled();
    expect(req.results.confirmationSent).toBe(false);
  });
});
