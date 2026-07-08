import { describe, expect, it } from 'vitest';

const { resolveCombinedInclude } = require('./make-report-endpoint');

// Stub db — a pure marker object per model name, no real Sequelize/connection
// involved. resolveCombinedInclude only ever does `db[entry.viaModel]`
// (and, if present, `.unscoped()` on it).
const stubDb = {
  Resource: { __model: 'Resource' },
  Widget: { __model: 'Widget' },
};

describe('resolveCombinedInclude (bug 1/2 fix: votes/comments project scoping)', () => {
  it('resolves a viaResource scope descriptor into a required Sequelize include', () => {
    const scopeInclude = [{ viaModel: 'Resource', where: { projectId: 2 } }];

    const result = resolveCombinedInclude(scopeInclude, undefined, stubDb);

    expect(result).toEqual([
      {
        model: stubDb.Resource,
        attributes: [],
        required: true,
        where: { projectId: 2 },
      },
    ]);
  });

  it('unscopes the joined model when it exposes .unscoped() (avoids Resource.defaultScope leaking a nested Status include)', () => {
    const unscopedMarker = { __model: 'Resource (unscoped)' };
    const dbWithUnscope = {
      Resource: { __model: 'Resource', unscoped: () => unscopedMarker },
    };
    const scopeInclude = [{ viaModel: 'Resource', where: { projectId: 2 } }];

    const result = resolveCombinedInclude(
      scopeInclude,
      undefined,
      dbWithUnscope
    );

    expect(result[0].model).toBe(unscopedMarker);
  });

  it('returns an empty array for column-scoped components (no scopeInclude, no callerInclude)', () => {
    expect(resolveCombinedInclude(undefined, undefined, stubDb)).toEqual([]);
  });

  it('merges the scope include with a component-specific caller include (e.g. enquiries Widget join)', () => {
    const scopeInclude = [{ viaModel: 'Resource', where: { projectId: 2 } }];
    const callerInclude = [
      {
        model: stubDb.Widget,
        attributes: [],
        where: { type: 'enquete' },
        required: true,
      },
    ];

    const result = resolveCombinedInclude(scopeInclude, callerInclude, stubDb);

    expect(result).toHaveLength(2);
    expect(result[0].model).toBe(stubDb.Resource);
    expect(result[1]).toBe(callerInclude[0]);
  });

  it('passes through a caller include unchanged when there is no scope include (column-scoped component)', () => {
    const callerInclude = [
      { model: stubDb.Widget, where: { type: 'enquete' } },
    ];

    const result = resolveCombinedInclude(undefined, callerInclude, stubDb);

    expect(result).toEqual(callerInclude);
  });
});
