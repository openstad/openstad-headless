import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../../db');
// Import the REAL deadlock helpers used by vote.js (extracted to a shared module)
const {
  isDeadlockError,
  withDeadlockRetry,
} = require('../../lib/deadlock-retry');

const origVoteScope = db.Vote.scope;
const origVoteFindAll = db.Vote.findAll;
const origVoteCreate = db.Vote.create;
const origVoteUpdate = db.Vote.update;
const origVoteDestroy = db.Vote.destroy;
const origResourceFindAll = db.Resource.findAll;
const origTransaction = db.sequelize.transaction;

afterEach(() => {
  db.Vote.scope = origVoteScope;
  db.Vote.findAll = origVoteFindAll;
  db.Vote.create = origVoteCreate;
  db.Vote.update = origVoteUpdate;
  db.Vote.destroy = origVoteDestroy;
  db.Resource.findAll = origResourceFindAll;
  db.sequelize.transaction = origTransaction;
});

function makeProject(votes = {}) {
  return {
    id: 1,
    config: {
      votes: {
        isViewable: true,
        voteType: 'likes',
        requiredUserRole: 'member',
        withExisting: 'replace',
        minResources: 1,
        maxResources: 5,
        minBudget: 0,
        maxBudget: 1000,
        ...votes,
      },
    },
    isVoteActive: vi.fn().mockReturnValue(true),
  };
}

function makeUser(role = 'member') {
  return { id: 1, role };
}

function createApp({ project, user } = {}) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.project = project;
    req.user = user;
    req.dbQuery = { where: {} };
    next();
  });
  app.use(require('./vote'));
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

// ----------------------------------------------------------------------------------------------------
// Middleware: project config guard
// ----------------------------------------------------------------------------------------------------

describe('project config guard', () => {
  it('returns 403 when project has no votes config', async () => {
    const project = { id: 1, config: {}, isVoteActive: vi.fn() };
    const app = createApp({ project, user: makeUser() });

    const res = await request(app).get('/');

    expect(res.status).toBe(403);
  });

  it('returns 403 when req.project is undefined', async () => {
    const app = createApp({ project: undefined, user: makeUser() });

    const res = await request(app).get('/');

    expect(res.status).toBe(403);
  });
});

// ----------------------------------------------------------------------------------------------------
// Middleware: vote active check (POST only)
// ----------------------------------------------------------------------------------------------------

describe('vote active guard (POST)', () => {
  it('returns 403 when isVoteActive() is false', async () => {
    const project = makeProject();
    project.isVoteActive.mockReturnValue(false);
    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/gesloten/i);
  });

  it('does NOT apply the active check for GET requests', async () => {
    const project = makeProject();
    project.isVoteActive.mockReturnValue(false);

    const mockScope = {
      findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    const app = createApp({ project, user: makeUser('admin') });

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
  });
});

// ----------------------------------------------------------------------------------------------------
// Middleware: user required + role check (non-GET)
// ----------------------------------------------------------------------------------------------------

describe('user required guard (POST)', () => {
  it('returns 401 when user is not set', async () => {
    const project = makeProject();
    const app = createApp({ project, user: undefined });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/gebruiker/i);
  });

  it('returns 401 when user lacks the required role', async () => {
    const project = makeProject({ requiredUserRole: 'admin' });
    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/stemmen/i);
  });
});

// ----------------------------------------------------------------------------------------------------
// GET / — vote list visibility
// ----------------------------------------------------------------------------------------------------

describe('GET / — vote list visibility', () => {
  it('returns 403 when votes are not viewable and user is not moderator', async () => {
    const project = makeProject({ isViewable: false });

    const mockScope = {
      findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app).get('/');

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/niet zichtbaar/i);
  });

  it('returns 200 with vote list when votes are viewable', async () => {
    const project = makeProject({ isViewable: true });

    const fakeVote = {
      id: 10,
      resourceId: 2,
      confirmed: false,
      opinion: 'yes',
      createdAt: new Date().toISOString(),
      userId: 1,
    };

    const mockScope = {
      findAndCountAll: vi
        .fn()
        .mockResolvedValue({ rows: [fakeVote], count: 1 }),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('allows moderator to see votes even when isViewable is false', async () => {
    const project = makeProject({ isViewable: false });

    const mockScope = {
      findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    const app = createApp({ project, user: makeUser('admin') });

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
  });
});

// ----------------------------------------------------------------------------------------------------
// POST /* — vote creation
// ----------------------------------------------------------------------------------------------------

describe('POST / — vote creation', () => {
  it('returns 403 when user already voted and withExisting is "error"', async () => {
    const project = makeProject({ voteType: 'count', withExisting: 'error' });

    const existingVote = {
      id: 99,
      resourceId: 1,
      toJSON: () => ({ id: 99, resourceId: 1 }),
    };

    const mockScope = {
      findAll: vi.fn().mockResolvedValue([existingVote]),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => {
      return fn({});
    });

    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/gestemd/i);
  });

  it('returns 400 when a resource is not found', async () => {
    const project = makeProject({ voteType: 'likes' });

    const mockScope = {
      findAll: vi.fn().mockResolvedValue([]),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.Resource.findAll = vi.fn().mockResolvedValue([]);

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => {
      return fn({});
    });

    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 999 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/resource/i);
  });

  it('creates a new like vote and returns the result', async () => {
    const project = makeProject({
      voteType: 'likes',
      requiredUserRole: 'anonymous',
    });

    const newVote = {
      id: 5,
      resourceId: 1,
      userId: 1,
      confirmed: false,
      opinion: 'yes',
      toJSON: () => ({ id: 5, resourceId: 1 }),
    };

    const mockScope = {
      findAll: vi.fn().mockResolvedValue([]),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    const resource = { id: 1, statuses: [] };
    db.Resource.findAll = vi.fn().mockResolvedValue([resource]);
    db.Vote.findAll = vi.fn().mockResolvedValue([]);
    db.Vote.create = vi.fn().mockResolvedValue(newVote);

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => {
      return fn({});
    });

    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1, opinion: 'yes' }]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ----------------------------------------------------------------------------------------------------
// Pure helpers: isDeadlockError (real implementation from src/lib/deadlock-retry.js)
// ----------------------------------------------------------------------------------------------------

describe('isDeadlockError', () => {
  it('recognises deadlock by code on root error', () => {
    expect(isDeadlockError({ code: 'ER_LOCK_DEADLOCK' })).toBe(true);
  });

  it('recognises deadlock by errno 1213 on root error', () => {
    expect(isDeadlockError({ errno: 1213 })).toBe(true);
  });

  it('recognises deadlock via nested parent.code', () => {
    expect(isDeadlockError({ parent: { code: 'ER_LOCK_DEADLOCK' } })).toBe(
      true
    );
  });

  it('returns false for non-deadlock errors', () => {
    expect(isDeadlockError({ code: 'ER_NO_SUCH_TABLE' })).toBe(false);
    expect(isDeadlockError(new Error('random'))).toBe(false);
  });
});

// ----------------------------------------------------------------------------------------------------
// Pure helpers: withDeadlockRetry (real implementation from src/lib/deadlock-retry.js)
// ----------------------------------------------------------------------------------------------------

describe('withDeadlockRetry', () => {
  it('returns the result immediately when fn succeeds first try', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    expect(await withDeadlockRetry(fn)).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on deadlock and eventually succeeds', async () => {
    const deadlock = Object.assign(new Error('deadlock'), {
      code: 'ER_LOCK_DEADLOCK',
    });
    const fn = vi.fn().mockRejectedValueOnce(deadlock).mockResolvedValue('ok');

    expect(await withDeadlockRetry(fn)).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting all attempts', async () => {
    const deadlock = Object.assign(new Error('deadlock'), {
      code: 'ER_LOCK_DEADLOCK',
    });
    const fn = vi.fn().mockRejectedValue(deadlock);

    await expect(withDeadlockRetry(fn, 3)).rejects.toThrow('deadlock');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws immediately for non-deadlock errors', async () => {
    const err = new Error('syntax');
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withDeadlockRetry(fn)).rejects.toThrow('syntax');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
