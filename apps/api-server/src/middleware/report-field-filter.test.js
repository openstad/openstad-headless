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
  { apiTokenScope = 'reports', reportingScope, statusCode = 200 } = {}
) {
  const captured = { body: null };

  const req = { apiTokenScope, reportingScope };
  const res = {
    _jsonFn: null,
    statusCode,
    json(body) {
      captured.body = body;
      return res;
    },
    status(code) {
      this.statusCode = code;
      return res;
    },
  };

  const next = vi.fn();

  // Apply the middleware — it wraps res.json synchronously then calls next.
  reportFieldFilter(req, res, next);

  // Simulate the downstream route handler calling res.status(x).json(payload).
  if (statusCode !== undefined) res.status(statusCode);
  res.json(payload);

  return captured.body;
}

// Same as applyFilter, but also reports the status the response ends up with.
function applyFilterWithStatus(payload, options) {
  let statusCode = options?.statusCode ?? 200;
  const captured = { body: null };

  const req = {
    apiTokenScope: options?.apiTokenScope ?? 'reports',
    reportingScope: options?.reportingScope,
  };
  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(code) {
      statusCode = code;
    },
    json(body) {
      captured.body = body;
      return res;
    },
    status(code) {
      statusCode = code;
      return res;
    },
  };

  reportFieldFilter(req, res, vi.fn());
  res.json(payload);

  return { body: captured.body, statusCode };
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

    it('never exposes user.* — not even when asked for explicitly', () => {
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

      // user.* is no longer part of the reporting catalog: the joined user
      // object is dropped wholesale rather than projected down.
      expect(result.user).toBeUndefined();
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

    it('filters the real pagination wrapper { records, metadata }', () => {
      // middleware/pagination.js produces { metadata, records } — not { data }.
      const payload = {
        metadata: { totalCount: 5, page: 0 },
        records: [{ id: 1, opinion: 'yes', ip: '1.2.3.4', userId: 7 }],
      };

      const result = applyFilter(payload, { reportingScope: scope });

      expect(result.metadata).toEqual({ totalCount: 5, page: 0 });
      expect(result.records).toHaveLength(1);
      expect(result.records[0].opinion).toBe('yes');
      // PII still stripped inside the wrapped records.
      expect(result.records[0].ip).toBeUndefined();
      expect(result.records[0].userId).toBeUndefined();
    });

    it('drops an unexpected sibling key next to records (PII leak guard)', () => {
      // A route handler that accidentally attaches extra data alongside the
      // pagination wrapper (e.g. a raw user summary) must not leak it —
      // only { metadata, records } may pass through.
      const payload = {
        metadata: { totalCount: 5, page: 0 },
        records: [{ id: 1, opinion: 'yes' }],
        summary: { email: 'jan@example.com', phoneNumber: '0612345678' },
      };

      const result = applyFilter(payload, { reportingScope: scope });

      expect(result.metadata).toEqual({ totalCount: 5, page: 0 });
      expect(result.records).toHaveLength(1);
      expect(result.summary).toBeUndefined();
    });
  });

  describe('stats component aggregate paths (scope.aggregate)', () => {
    // /stats/project/:id/vote/total resolves componentKey 'votes' but returns
    // { count: n }, not vote records — projecting it to safeFields would empty
    // it. The aggregate flag makes the filter pass it through by shape instead.
    const statsScope = {
      componentKey: 'votes',
      enabledPersonalFields: [],
      aggregate: true,
    };

    it('passes a { count } payload through unchanged', () => {
      const result = applyFilter({ count: 42 }, { reportingScope: statsScope });
      expect(result).toEqual({ count: 42 });
    });

    it('passes an array of { date, counted } rows through unchanged', () => {
      const payload = [
        { date: '2024-01-01', counted: 3 },
        { date: '2024-01-02', counted: 5 },
      ];
      const result = applyFilter(payload, { reportingScope: statsScope });
      expect(result).toEqual(payload);
    });

    it('blocks a rich record payload on a stats path (fail-closed)', () => {
      const payload = [{ id: 1, user: { email: 'x@y.nl' } }];
      const result = applyFilter(payload, { reportingScope: statsScope });
      expect(result.error).toBeDefined();
    });
  });

  describe('error responses pass through untouched (statusCode >= 400)', () => {
    it('does not strip a 404 error body on a component path', () => {
      const scope = { componentKey: 'votes', enabledPersonalFields: [] };
      const payload = { status: 404, message: 'Vote not found' };

      const result = applyFilter(payload, {
        reportingScope: scope,
        statusCode: 404,
      });

      // The message survives so clients can tell a 404 from a scope block.
      expect(result.message).toBe('Vote not found');
      expect(result.status).toBe(404);
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

    it('passes through the real /reports/users/anonymized shape (#442)', () => {
      const payload = {
        data: [
          {
            participantId: 'abc123',
            role: 'member',
            projectId: 2,
            createdAt: '2026-01-01T00:00:00.000Z',
            lastLogin: '2026-02-01T00:00:00.000Z',
          },
        ],
        nextLink: null,
      };
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result).toEqual(payload);
    });

    it('passes through the real /reports/users/aggregates shape (#442)', () => {
      const payload = {
        uniqueParticipants: 12,
        byType: [
          { type: 'votes', count: 5 },
          { type: 'comments', count: 3 },
          { type: 'submissions', count: 2 },
          { type: 'choiceGuides', count: 1 },
        ],
      };
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result).toEqual(payload);
    });

    it('blocks /reports/users/anonymized rows if a PII key ever leaked in (defense in depth)', () => {
      const payload = {
        data: [{ participantId: 'abc', role: 'member', email: 'leak@x.nl' }],
        nextLink: null,
      };
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

    it('blocks flat rows carrying PII keys even without a nested object', () => {
      // Every value is a primitive, so the shape check alone would pass; the
      // PII-key screen (email/postcode) must still block it.
      const payload = [{ id: 1, email: 'jan@example.com', postcode: '1234AB' }];
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result.error).toBeDefined();
      expect(Array.isArray(result)).toBe(false);
    });

    it('blocks PII nested inside an aggregate row result array', () => {
      const payload = [
        { key: 'leak', description: 'x', result: [{ email: 'a@b.nl' }] },
      ];
      const result = applyFilter(payload, { reportingScope: aggregateScope });
      expect(result.error).toBeDefined();
    });
  });

  // Aggregate payloads skip filterPayload, so the top-level identifiers that
  // stripAlwaysBlocked removes on the record path have to be screened by the
  // aggregate check itself.
  describe('aggregate endpoints screen top-level identifiers too', () => {
    const aggregateScope = { componentKey: null, enabledPersonalFields: [] };
    const statsScope = {
      componentKey: 'votes',
      enabledPersonalFields: [],
      aggregate: true,
    };

    it.each([['userId'], ['ip']])(
      'blocks a flat aggregate row carrying %s',
      (key) => {
        const payload = [{ counted: 5, [key]: key === 'ip' ? '10.0.0.9' : 42 }];

        const result = applyFilter(payload, {
          reportingScope: aggregateScope,
        });

        expect(result.error).toBeDefined();
        expect(Array.isArray(result)).toBe(false);
      }
    );

    it('blocks a stats total that carries a userId', () => {
      const result = applyFilter(
        { count: 3, userId: 42 },
        { reportingScope: statsScope }
      );

      expect(result.error).toBeDefined();
    });

    it('blocks a top-level identifier nested in a result array', () => {
      const payload = [
        { key: 'k', description: 'd', result: [{ counted: 1, userId: 7 }] },
      ];

      const result = applyFilter(payload, { reportingScope: aggregateScope });

      expect(result.error).toBeDefined();
    });

    it('still lets a genuine overview payload through', () => {
      const payload = [
        { key: 'votes', description: 'Stemmen', result: [{ counted: 8 }] },
      ];

      const result = applyFilter(payload, { reportingScope: aggregateScope });

      expect(result).toEqual(payload);
    });
  });

  describe('error responses (4xx/5xx) pass through unfiltered', () => {
    const scope = { componentKey: 'votes', enabledPersonalFields: [] };

    it('does not mangle a 400 filter-error body on a component endpoint', () => {
      const payload = {
        error: {
          code: 'unsupported_status_filter',
          message: "The 'votes' report has no status field to filter on",
          param: 'status',
          hint: 'Remove the status parameter for this endpoint',
        },
      };

      const result = applyFilter(payload, {
        reportingScope: scope,
        statusCode: 400,
      });

      expect(result).toEqual(payload);
    });

    it('still filters a normal 200 component response', () => {
      const payload = { id: 1, opinion: 'yes', ip: '1.2.3.4', userId: 9 };

      const result = applyFilter(payload, {
        reportingScope: scope,
        statusCode: 200,
      });

      expect(result.ip).toBeUndefined();
      expect(result.userId).toBeUndefined();
      expect(result.opinion).toBe('yes');
    });

    it('does not mangle a 400 body on an aggregate (componentKey null) endpoint either', () => {
      const aggregateScope = { componentKey: null, enabledPersonalFields: [] };
      const payload = { error: { code: 'bad_request', message: 'nope' } };

      const result = applyFilter(payload, {
        reportingScope: aggregateScope,
        statusCode: 400,
      });

      expect(result).toEqual(payload);
    });
  });

  describe('blocked responses answer with 403', () => {
    it('uses 403 when the reporting scope was never resolved', () => {
      const { body, statusCode } = applyFilterWithStatus(
        { anything: true },
        { reportingScope: undefined }
      );

      expect(body.error).toBe('Reporting scope not resolved');
      expect(statusCode).toBe(403);
    });

    it('uses 403 when an aggregate payload is blocked', () => {
      const { body, statusCode } = applyFilterWithStatus(
        [{ email: 'a@b.nl' }],
        {
          reportingScope: { componentKey: null, enabledPersonalFields: [] },
        }
      );

      expect(body.error).toBeDefined();
      expect(statusCode).toBe(403);
    });

    it('leaves the status alone for a payload that passes', () => {
      const { statusCode } = applyFilterWithStatus([{ counted: 8 }], {
        reportingScope: { componentKey: null, enabledPersonalFields: [] },
      });

      expect(statusCode).toBe(200);
    });

    it('does not turn an upstream error status into a 403', () => {
      const { body, statusCode } = applyFilterWithStatus(
        { error: 'Not found' },
        {
          reportingScope: { componentKey: 'votes', enabledPersonalFields: [] },
          statusCode: 404,
        }
      );

      expect(statusCode).toBe(404);
      expect(body).toEqual({ error: 'Not found' });
    });
  });

  describe('schema/metadata responses bypass the field filter (#440)', () => {
    it('passes through a {name,label,type} field-metadata array unfiltered', () => {
      const scope = { componentKey: 'submissions', enabledPersonalFields: [] };
      const payload = [{ name: 'field_name', label: 'Naam', type: 'text' }];

      const captured = { body: null };
      const req = {
        apiTokenScope: 'reports',
        reportingScope: scope,
        reportSchemaResponse: true,
      };
      const res = {
        statusCode: 200,
        json(body) {
          captured.body = body;
          return res;
        },
      };
      const next = vi.fn();
      require('./report-field-filter')(req, res, next);
      res.json(payload);

      expect(captured.body).toEqual(payload);
    });

    it('still filters normally when reportSchemaResponse is not set', () => {
      const scope = { componentKey: 'submissions', enabledPersonalFields: [] };
      const payload = { id: 1, status: 'approved', userId: 9 };

      const result = applyFilter(payload, { reportingScope: scope });

      expect(result.status).toBe('approved');
      expect(result.userId).toBeUndefined();
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
