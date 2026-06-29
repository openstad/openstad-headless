import path from 'path';
import { describe, expect, it, vi } from 'vitest';

// Redirect the package import to the local worktree file so tests can run
// before npm install has updated the shared node_modules.
vi.mock('@openstad-headless/lib/report-data-scope', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(
    path.resolve(__dirname, '../../../../packages/lib/report-data-scope')
  );
});

const reportFieldFilter = require('./report-field-filter');

function applyFilter(
  payload,
  { apiTokenScope = 'reports', reportingScope } = {}
) {
  const captured = { body: null };

  const req = { apiTokenScope, reportingScope };
  const res = {
    _jsonFn: null,
    json(body) {
      captured.body = body;
      return res;
    },
    status(code) {
      return res;
    },
  };

  const next = vi.fn();

  // Apply the middleware — it wraps res.json synchronously then calls next.
  reportFieldFilter(req, res, next);

  // Simulate the downstream route handler calling res.json(payload).
  res.json(payload);

  return captured.body;
}

describe('reportFieldFilter', () => {
  describe('non-reporting requests are not filtered', () => {
    it('does not wrap res.json for normal requests', () => {
      const req = { apiTokenScope: undefined };
      const res = {
        json: vi.fn(),
      };
      const next = vi.fn();

      reportFieldFilter(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      // res.json should not be overwritten
      res.json({ foo: 'bar' });
      expect(res.json).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  describe('component endpoint filtering', () => {
    const scope = {
      componentKey: 'votes',
      enabledPersonalFields: [],
    };

    it('keeps only safe fields on a single vote record', () => {
      const payload = {
        id: 1,
        ip: '127.0.0.1',
        userId: 99,
        opinion: 'yes',
        createdAt: '2024-01-01',
        extraData: { secret: 'hidden' },
      };

      const result = applyFilter(payload, { reportingScope: scope });

      expect(result.id).toBe(1);
      expect(result.opinion).toBe('yes');
      expect(result.createdAt).toBe('2024-01-01');
      // PII always stripped
      expect(result.ip).toBeUndefined();
      expect(result.userId).toBeUndefined();
      expect(result.extraData).toBeUndefined();
    });

    it('keeps user.displayName only when opted in', () => {
      const scopeWithPersonal = {
        componentKey: 'votes',
        enabledPersonalFields: ['user.displayName'],
      };
      const payload = {
        id: 1,
        opinion: 'yes',
        userId: 99,
        user: {
          displayName: 'User-42',
          email: 'real@email.com',
          phoneNumber: '0612345678',
        },
      };

      const result = applyFilter(payload, {
        reportingScope: scopeWithPersonal,
      });

      expect(result.user).toBeDefined();
      expect(result.user.displayName).toBe('User-42');
      // PII in user always stripped
      expect(result.user.email).toBeUndefined();
      expect(result.user.phoneNumber).toBeUndefined();
      // userId at top level still stripped
      expect(result.userId).toBeUndefined();
    });

    it('never returns user.email even when not in personal fields list', () => {
      const scopeResources = {
        componentKey: 'resources',
        enabledPersonalFields: ['title'],
      };
      const payload = {
        id: 1,
        title: 'My plan',
        userId: 5,
        user: { email: 'owner@example.com', displayName: 'Someone' },
      };

      const result = applyFilter(payload, { reportingScope: scopeResources });

      expect(result.title).toBe('My plan');
      expect(result.userId).toBeUndefined();
      // user not in allowedFields at all → user block absent
      expect(result.user).toBeUndefined();
    });

    it('filters an array of records', () => {
      const records = [
        { id: 1, opinion: 'yes', ip: '1.1.1.1', userId: 10 },
        { id: 2, opinion: 'no', ip: '2.2.2.2', userId: 20 },
      ];

      const result = applyFilter(records, { reportingScope: scope });

      expect(result).toHaveLength(2);
      result.forEach((r) => {
        expect(r.ip).toBeUndefined();
        expect(r.userId).toBeUndefined();
        expect(r.opinion).toBeDefined();
      });
    });

    it('filters paginated wrapper { data, metadata }', () => {
      const payload = {
        metadata: { total: 5, page: 1 },
        data: [{ id: 1, opinion: 'yes', ip: '1.2.3.4', userId: 7 }],
      };

      const result = applyFilter(payload, { reportingScope: scope });

      expect(result.metadata).toEqual({ total: 5, page: 1 });
      expect(result.data[0].opinion).toBe('yes');
      expect(result.data[0].ip).toBeUndefined();
      expect(result.data[0].userId).toBeUndefined();
    });
  });

  describe('aggregate / metadata endpoint (componentKey === null)', () => {
    const aggregateScope = { componentKey: null, enabledPersonalFields: [] };

    it('passes through primitive-only objects (counts)', () => {
      const payload = { count: 123 };
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result).toEqual({ count: 123 });
    });

    it('passes through an array of aggregate rows', () => {
      const payload = [
        { counted: 5, date: '2024-01-01' },
        { counted: 8, date: '2024-01-02' },
      ];
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result).toEqual(payload);
    });

    it('passes through real /overview rows (key/description/result[])', () => {
      const payload = [
        {
          key: 'resourceTotal',
          description: 'Amount of resources',
          result: [{ counted: 8 }],
        },
        {
          key: 'voteTotal',
          description: 'Amount of votes',
          result: [{ counted: 3 }, { counted: 5 }],
        },
      ];
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result).toEqual(payload);
    });

    it('blocks an unexpected object payload on aggregate endpoint', () => {
      const payload = { counted: 5, secret: { nested: 'object' } };
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result.error).toBeDefined();
    });

    it('blocks an array of rich records (e.g. a user list) — PII leak guard', () => {
      const payload = [
        { id: 1, email: 'jan@example.com', postcode: '1234AB' },
        { id: 2, email: 'piet@example.com', user: { email: 'x@y.nl' } },
      ];
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result.error).toBeDefined();
      expect(Array.isArray(result)).toBe(false);
    });
  });

  describe('registry — PII fields never in safe universe', () => {
    it('exposable-fields registry does not include ip', () => {
      const {
        getExposedFields,
      } = require('@openstad-headless/lib/report-data-scope');
      const fields = getExposedFields('votes', []);
      expect(fields).not.toContain('ip');
    });

    it('exposable-fields registry does not include userId in safe fields', () => {
      const {
        getExposedFields,
      } = require('@openstad-headless/lib/report-data-scope');
      const fields = getExposedFields('votes', []);
      expect(fields).not.toContain('userId');
    });

    it('exposable-fields registry does not include email in any component', () => {
      const {
        COMPONENTS,
        getExposedFields,
      } = require('@openstad-headless/lib/report-data-scope');
      for (const key of Object.keys(COMPONENTS)) {
        const all = getExposedFields(key, COMPONENTS[key].personalFields);
        expect(all).not.toContain('email');
        expect(all.find((f) => f.includes('email'))).toBeUndefined();
      }
    });
  });
});
