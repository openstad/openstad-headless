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
      requiredUserRole: 'member',
    });

    const createdRow = {
      id: 5,
      resourceId: 1,
      userId: 1,
      confirmed: false,
      opinion: 'yes',
    };

    const mockScope = {
      findAll: vi.fn().mockResolvedValue([]),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    const resource = { id: 1, statuses: [] };
    db.Resource.findAll = vi.fn().mockResolvedValue([resource]);
    // First findAll = anonymous-IP block (not hit for non-anon); final findAll = result payload
    db.Vote.findAll = vi.fn().mockResolvedValue([createdRow]);
    db.Vote.create = vi.fn().mockResolvedValue(createdRow);

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => {
      return fn({});
    });

    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1, opinion: 'yes' }]);

    expect(res.status).toBe(200);
    // A create action must have been dispatched with the right payload
    expect(db.Vote.create).toHaveBeenCalledTimes(1);
    const [createArg] = db.Vote.create.mock.calls[0];
    expect(createArg).toMatchObject({
      resourceId: 1,
      opinion: 'yes',
      userId: 1,
      confirmed: false,
    });
    // Response is the shaped payload from the final findAll
    expect(res.body).toEqual([
      {
        id: 5,
        resourceId: 1,
        userId: 1,
        confirmed: false,
        opinion: 'yes',
      },
    ]);
  });
});

// ----------------------------------------------------------------------------------------------------
// POST /* — voteType 'count' min/max resources rules
// ----------------------------------------------------------------------------------------------------

describe('POST / — count min/max resources', () => {
  function setupCount({ minResources, maxResources }, resourceIds) {
    const project = makeProject({
      voteType: 'count',
      withExisting: 'replace',
      minResources,
      maxResources,
    });

    const mockScope = { findAll: vi.fn().mockResolvedValue([]) };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.Resource.findAll = vi
      .fn()
      .mockResolvedValue(resourceIds.map((id) => ({ id, statuses: [] })));
    db.Vote.findAll = vi.fn().mockResolvedValue([]);
    db.Vote.create = vi.fn().mockResolvedValue({});

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));

    return project;
  }

  it('returns 400 when fewer resources than minResources are submitted', async () => {
    const project = setupCount({ minResources: 2, maxResources: 5 }, [1]);
    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/aantal resources/i);
    expect(db.Vote.create).not.toHaveBeenCalled();
  });

  it('returns 400 when more resources than maxResources are submitted', async () => {
    const project = setupCount({ minResources: 1, maxResources: 2 }, [1, 2, 3]);
    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }, { resourceId: 2 }, { resourceId: 3 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/aantal resources/i);
    expect(db.Vote.create).not.toHaveBeenCalled();
  });

  it('creates count votes when within min/max bounds', async () => {
    const project = setupCount({ minResources: 1, maxResources: 5 }, [1, 2]);
    db.Vote.findAll = vi
      .fn()
      .mockResolvedValue([
        { id: 7, resourceId: 1, userId: 1, confirmed: false, opinion: null },
      ]);

    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }, { resourceId: 2 }]);

    expect(res.status).toBe(200);
    expect(db.Vote.create).toHaveBeenCalledTimes(2);
    expect(db.Vote.create.mock.calls[0][0]).toMatchObject({
      resourceId: 1,
      userId: 1,
    });
  });
});

// ----------------------------------------------------------------------------------------------------
// POST /* — voteType 'budgeting' min/max budget rules
// ----------------------------------------------------------------------------------------------------

describe('POST / — budgeting min/max budget', () => {
  function setupBudgeting({ minBudget, maxBudget }, resources) {
    const project = makeProject({
      voteType: 'budgeting',
      withExisting: 'replace',
      minBudget,
      maxBudget,
    });

    const mockScope = { findAll: vi.fn().mockResolvedValue([]) };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.Resource.findAll = vi.fn().mockResolvedValue(resources);
    db.Vote.findAll = vi.fn().mockResolvedValue([]);
    db.Vote.create = vi.fn().mockResolvedValue({});

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));

    return project;
  }

  it('returns 400 when summed budget is below minBudget', async () => {
    const project = setupBudgeting({ minBudget: 500, maxBudget: 1000 }, [
      { id: 1, statuses: [], budget: 100 },
    ]);
    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/budget/i);
    expect(db.Vote.create).not.toHaveBeenCalled();
  });

  it('returns 400 when summed budget exceeds maxBudget', async () => {
    const project = setupBudgeting({ minBudget: 0, maxBudget: 1000 }, [
      { id: 1, statuses: [], budget: 700 },
      { id: 2, statuses: [], budget: 600 },
    ]);
    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }, { resourceId: 2 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/budget/i);
    expect(db.Vote.create).not.toHaveBeenCalled();
  });

  it('creates budgeting votes when summed budget is within bounds', async () => {
    const project = setupBudgeting({ minBudget: 0, maxBudget: 1000 }, [
      { id: 1, statuses: [], budget: 400 },
      { id: 2, statuses: [], budget: 300 },
    ]);
    db.Vote.findAll = vi
      .fn()
      .mockResolvedValue([
        { id: 8, resourceId: 1, userId: 1, confirmed: false, opinion: null },
      ]);

    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }, { resourceId: 2 }]);

    expect(res.status).toBe(200);
    expect(db.Vote.create).toHaveBeenCalledTimes(2);
  });
});

// ----------------------------------------------------------------------------------------------------
// POST /* — withExisting 'merge' duplicate-resource rejection
// ----------------------------------------------------------------------------------------------------

describe('POST / — merge duplicate rejection', () => {
  it('returns 403 when a submitted resource was already voted on (merge)', async () => {
    const project = makeProject({ voteType: 'count', withExisting: 'merge' });

    const existingVote = {
      id: 99,
      resourceId: 1,
      opinion: null,
      toJSON: () => ({ id: 99, resourceId: 1, opinion: null }),
    };

    const mockScope = { findAll: vi.fn().mockResolvedValue([existingVote]) };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);
    db.Vote.create = vi.fn().mockResolvedValue({});

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));

    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/gestemd/i);
    expect(db.Vote.create).not.toHaveBeenCalled();
  });

  it('merges existing votes with new ones when resources differ', async () => {
    const project = makeProject({
      voteType: 'count',
      withExisting: 'merge',
      minResources: 1,
      maxResources: 5,
    });

    const existingVote = {
      id: 99,
      resourceId: 2,
      opinion: null,
      toJSON: () => ({ id: 99, resourceId: 2, opinion: null }),
    };

    const mockScope = { findAll: vi.fn().mockResolvedValue([existingVote]) };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.Resource.findAll = vi.fn().mockResolvedValue([
      { id: 1, statuses: [] },
      { id: 2, statuses: [] },
    ]);
    db.Vote.findAll = vi.fn().mockResolvedValue([]);
    db.Vote.create = vi.fn().mockResolvedValue({});
    // count voteType also deletes existing votes after re-creating merged copies
    db.Vote.destroy = vi.fn().mockResolvedValue(1);

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));

    const app = createApp({ project, user: makeUser() });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1 }]);

    expect(res.status).toBe(200);
    // new vote (resource 1) created + existing merged vote (resource 2) re-created
    expect(db.Vote.create).toHaveBeenCalledTimes(2);
    const createdResourceIds = db.Vote.create.mock.calls
      .map((c) => c[0].resourceId)
      .sort();
    expect(createdResourceIds).toEqual([1, 2]);
  });
});

// ----------------------------------------------------------------------------------------------------
// POST /* — anonymous likes 5-minute IP duplicate block
// ----------------------------------------------------------------------------------------------------

describe('POST / — anonymous likes IP duplicate block', () => {
  it('returns 403 when an anonymous IP already voted within 5 minutes', async () => {
    const project = makeProject({
      voteType: 'likes',
      requiredUserRole: 'anonymous',
    });

    const mockScope = { findAll: vi.fn().mockResolvedValue([]) };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.Resource.findAll = vi.fn().mockResolvedValue([{ id: 1, statuses: [] }]);
    // The IP-block findAll returns a recent vote -> rejection
    db.Vote.findAll = vi.fn().mockResolvedValue([{ id: 50 }]);
    db.Vote.create = vi.fn().mockResolvedValue({});

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));

    const app = createApp({ project, user: makeUser('anonymous') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1, opinion: 'yes' }]);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/gestemd/i);
    expect(db.Vote.create).not.toHaveBeenCalled();
    // the block query filters on the 5-minute window
    const [{ where }] = db.Vote.findAll.mock.calls[0];
    expect(where.resourceId).toBe(1);
    expect(where.createdAt).toBeDefined();
  });
});

// ----------------------------------------------------------------------------------------------------
// POST /* — likes action switch (create / update / delete)
// ----------------------------------------------------------------------------------------------------

describe('POST / — likes action switch', () => {
  function setupLikes(existingVotes) {
    const project = makeProject({
      voteType: 'likes',
      requiredUserRole: 'member',
    });

    const mockScope = {
      findAll: vi.fn().mockResolvedValue(existingVotes),
    };
    db.Vote.scope = vi.fn().mockReturnValue(mockScope);

    db.Resource.findAll = vi.fn().mockResolvedValue([{ id: 1, statuses: [] }]);
    db.Vote.findAll = vi.fn().mockResolvedValue([]);
    db.Vote.create = vi.fn().mockResolvedValue({});
    db.Vote.update = vi.fn().mockResolvedValue([1]);
    db.Vote.destroy = vi.fn().mockResolvedValue(1);

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));

    return project;
  }

  it('deletes the existing like when the same opinion is re-submitted (toggle off)', async () => {
    const existing = {
      id: 70,
      resourceId: 1,
      opinion: 'yes',
      toJSON: () => ({ id: 70, resourceId: 1, opinion: 'yes' }),
    };
    const project = setupLikes([existing]);
    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1, opinion: 'yes' }]);

    expect(res.status).toBe(200);
    expect(db.Vote.destroy).toHaveBeenCalledTimes(1);
    expect(db.Vote.destroy.mock.calls[0][0].where).toEqual({ id: 70 });
    expect(db.Vote.create).not.toHaveBeenCalled();
    expect(db.Vote.update).not.toHaveBeenCalled();
  });

  it('updates the existing like when a different opinion is submitted', async () => {
    const existing = {
      id: 71,
      resourceId: 1,
      opinion: 'no',
      toJSON: () => ({ id: 71, resourceId: 1, opinion: 'no' }),
    };
    const project = setupLikes([existing]);
    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1, opinion: 'yes' }]);

    expect(res.status).toBe(200);
    expect(db.Vote.update).toHaveBeenCalledTimes(1);
    const [updatePayload, updateOpts] = db.Vote.update.mock.calls[0];
    expect(updatePayload.opinion).toBe('yes');
    expect(updateOpts.where).toEqual({ id: 71 });
    expect(db.Vote.destroy).not.toHaveBeenCalled();
    expect(db.Vote.create).not.toHaveBeenCalled();
  });

  it('creates a new like when no existing vote for the resource', async () => {
    const project = setupLikes([]);
    const app = createApp({ project, user: makeUser('member') });

    const res = await request(app)
      .post('/')
      .send([{ resourceId: 1, opinion: 'yes' }]);

    expect(res.status).toBe(200);
    expect(db.Vote.create).toHaveBeenCalledTimes(1);
    expect(db.Vote.create.mock.calls[0][0]).toMatchObject({
      resourceId: 1,
      opinion: 'yes',
    });
    expect(db.Vote.update).not.toHaveBeenCalled();
    expect(db.Vote.destroy).not.toHaveBeenCalled();
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
