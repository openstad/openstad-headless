import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const { withAll } = require('./code');

const run = (query) =>
  new Promise((resolve) => {
    const req = { query, client: { id: 3 } };
    withAll(req, {}, () => resolve(req));
  });

afterEach(() => vi.restoreAllMocks());

describe('codeMw.withAll', () => {
  it('filters on userId when it is given', async () => {
    const findAll = vi.spyOn(db.UniqueCode, 'findAll').mockResolvedValue([]);
    vi.spyOn(db.UniqueCode, 'count').mockResolvedValue(0);

    await run({ userId: '42' });

    expect(findAll.mock.calls[0][0].where).toEqual({ clientId: 3, userId: 42 });
  });

  it('filters on the client only without userId', async () => {
    const findAll = vi.spyOn(db.UniqueCode, 'findAll').mockResolvedValue([]);
    vi.spyOn(db.UniqueCode, 'count').mockResolvedValue(0);

    await run({});

    expect(findAll.mock.calls[0][0].where).toEqual({ clientId: 3 });
  });
});
