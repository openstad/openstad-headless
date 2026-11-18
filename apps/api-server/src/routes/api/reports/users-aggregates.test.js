import { describe, expect, it, vi } from 'vitest';

const {
  resolveUserAggregates,
  BY_TYPE_QUERIES,
  UNIQUE_PARTICIPANTS_QUERY,
} = require('./users-aggregates');

// Stub runner: answers each query with the count keyed by the query text, so a
// test can give every source a distinct number and prove the mapping.
function stubRunner(countsByQuery) {
  return {
    QueryTypes: { SELECT: 'SELECT' },
    query: vi.fn(async (query) => {
      const counted = countsByQuery[query];
      return [counted === undefined ? {} : { counted }];
    }),
  };
}

const COUNTS = {
  [UNIQUE_PARTICIPANTS_QUERY]: 7,
  [BY_TYPE_QUERIES.votes]: 5,
  [BY_TYPE_QUERIES.comments]: 3,
  [BY_TYPE_QUERIES.submissions]: 2,
  [BY_TYPE_QUERIES.choiceGuides]: 1,
};

describe('resolveUserAggregates', () => {
  it('maps every source to its own count', async () => {
    const out = await resolveUserAggregates({
      runner: stubRunner(COUNTS),
      projectId: 2,
    });
    expect(out).toEqual({
      uniqueParticipants: 7,
      byType: [
        { type: 'votes', count: 5 },
        { type: 'comments', count: 3 },
        { type: 'submissions', count: 2 },
        { type: 'choiceGuides', count: 1 },
      ],
    });
  });

  // The union query must not be a sum of the per-type counts: a participant who
  // both voted and commented would otherwise be counted twice.
  it('takes uniqueParticipants from the union query, not the sum of byType', async () => {
    const out = await resolveUserAggregates({
      runner: stubRunner(COUNTS),
      projectId: 2,
    });
    const sum = out.byType.reduce((t, r) => t + r.count, 0);
    expect(sum).toBe(11);
    expect(out.uniqueParticipants).toBe(7);
  });

  it('scopes every query to the project, and the union query four times', async () => {
    const runner = stubRunner(COUNTS);
    await resolveUserAggregates({ runner, projectId: 42 });

    expect(runner.query).toHaveBeenCalledTimes(5);
    for (const [, opts] of runner.query.mock.calls) {
      expect(opts.replacements.every((id) => id === 42)).toBe(true);
    }
    const unionCall = runner.query.mock.calls.find(
      ([q]) => q === UNIQUE_PARTICIPANTS_QUERY
    );
    expect(unionCall[1].replacements).toHaveLength(4);
  });

  it('reports 0 rather than undefined when a query returns no row', async () => {
    const out = await resolveUserAggregates({
      runner: stubRunner({}),
      projectId: 2,
    });
    expect(out.uniqueParticipants).toBe(0);
    expect(out.byType.map((r) => r.count)).toEqual([0, 0, 0, 0]);
  });

  // report-field-filter screens non-component responses by SHAPE: byType has to
  // be an array of flat {type, count} objects, not an object keyed by type.
  it('returns byType as an array of flat primitive objects', async () => {
    const { byType } = await resolveUserAggregates({
      runner: stubRunner(COUNTS),
      projectId: 2,
    });
    expect(Array.isArray(byType)).toBe(true);
    for (const row of byType) {
      expect(Object.keys(row).sort()).toEqual(['count', 'type']);
      expect(typeof row.type).toBe('string');
      expect(typeof row.count).toBe('number');
    }
  });
});

describe('the aggregate queries', () => {
  it('exclude the placeholder user id 0 everywhere', () => {
    for (const query of [
      UNIQUE_PARTICIPANTS_QUERY,
      ...Object.values(BY_TYPE_QUERIES),
    ]) {
      expect(query).toContain('userId != 0');
    }
  });

  it('exclude soft-deleted rows everywhere', () => {
    for (const query of [
      UNIQUE_PARTICIPANTS_QUERY,
      ...Object.values(BY_TYPE_QUERIES),
    ]) {
      expect(query).toContain('deletedAt IS NULL');
    }
  });

  // votes/comments have no projectId column, so they must reach the project via
  // resources — scoping them on their own table would silently return nothing.
  it('scope votes and comments through resources, not a projectId column', () => {
    for (const query of [BY_TYPE_QUERIES.votes, BY_TYPE_QUERIES.comments]) {
      expect(query).toContain('JOIN resources');
      expect(query).toContain('r.projectId = ?');
    }
  });
});

describe('error propagation', () => {
  // The handler awaits this and forwards a rejection to next(err); asserting on
  // the handler itself would depend on whether a real DB happens to be
  // reachable, so the contract is pinned here instead.
  it('rejects rather than resolving with zeroes when a query fails', async () => {
    const failing = {
      QueryTypes: { SELECT: 'SELECT' },
      query: vi.fn().mockRejectedValue(new Error('db down')),
    };
    await expect(
      resolveUserAggregates({ runner: failing, projectId: 2 })
    ).rejects.toThrow('db down');
  });
});
