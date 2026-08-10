import { describe, expect, it } from 'vitest';

describe('component-registry', () => {
  it('can be required without touching the DB (db is lazy, inside getModel/getFieldTypes)', () => {
    // If this required db.js at module top, requiring it here (no DB
    // available in the unit-test environment) would throw at require-time.
    expect(() => require('./component-registry')).not.toThrow();
  });

  describe('getProjectScope', () => {
    const { getProjectScope } = require('./component-registry');

    it('resources/submissions/choiceguides scope by a direct projectId column', () => {
      for (const key of ['resources', 'submissions', 'choiceguides']) {
        expect(getProjectScope(key)).toEqual({
          type: 'column',
          column: 'projectId',
        });
      }
    });

    it('projects scopes by its own id, not a foreign key', () => {
      expect(getProjectScope('projects')).toEqual({
        type: 'column',
        column: 'id',
      });
    });

    it('votes/comments have no direct projectId column — scope viaResource', () => {
      for (const key of ['votes', 'comments']) {
        expect(getProjectScope(key)).toEqual({ type: 'viaResource' });
      }
    });

    it('throws on an unknown component', () => {
      expect(() => getProjectScope('nope')).toThrow(
        /Unknown reporting component/
      );
    });
  });
});
