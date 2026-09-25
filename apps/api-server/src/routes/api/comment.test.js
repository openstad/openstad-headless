import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// comment.js is a plain CommonJS module loaded via a top-level
// `require('../../db')`. vi.mock's ESM-graph interception does not reach
// that native require call (confirmed empirically: a minimal CJS-requiring
// -CJS repro is not intercepted by vi.mock in this project's Vitest setup),
// so the db module is stubbed by pre-seeding Node's own require cache
// instead, the same mechanism Node itself uses to resolve `require('../../db')`.
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

// The final .post() handler on router.route('/') is the one that decides
// the notification type and fills in confirmationSent — pull it out of the
// route stack directly rather than exercising the whole auth/db middleware
// chain in front of it.
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

  it('selects "notification comment - user" for a top-level comment and reports confirmationSent true when sent', async () => {
    db.Resource.findByPk.mockResolvedValue({ id: 1, userId: 42 });
    db.User.findByPk.mockResolvedValue({
      id: 42,
      email: 'author@example.com',
      emailNotificationConsent: true,
      projectId: 5,
    });
    db.Notification.create.mockResolvedValue({ status: 'sent' });

    const req = makeReq({
      confirmation: true,
      results: { ...makeReq().results, resourceId: 1 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(db.Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'notification comment - user' })
    );
    expect(req.results.confirmationSent).toBe(true);
    expect(res.json).toHaveBeenCalledWith(req.results);
  });

  it('selects "notification comment reply - user" for a reply and reports confirmationSent true when sent', async () => {
    db.User.findByPk.mockResolvedValue({
      id: 7,
      email: 'parent@example.com',
      emailNotificationConsent: true,
      projectId: 5,
    });
    db.Notification.create.mockResolvedValue({ status: 'sent' });

    const req = makeReq({
      confirmationReplies: true,
      parentComment: { user: { id: 7 }, description: 'the parent comment' },
      results: { ...makeReq().results, parentId: 9 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(db.Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'notification comment reply - user' })
    );
    expect(req.results.confirmationSent).toBe(true);
  });

  it('reports confirmationSent undefined when the notification ends up "failed"', async () => {
    db.Resource.findByPk.mockResolvedValue({ id: 1, userId: 42 });
    db.User.findByPk.mockResolvedValue({
      id: 42,
      email: 'author@example.com',
      emailNotificationConsent: true,
      projectId: 5,
    });
    db.Notification.create.mockResolvedValue({ status: 'failed' });

    const req = makeReq({
      confirmation: true,
      results: { ...makeReq().results, resourceId: 1 },
    });
    const res = makeRes();

    await handler(req, res, () => {});

    expect(req.results.confirmationSent).toBeUndefined();
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
