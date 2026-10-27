import { Op } from 'sequelize';
import { describe, expect, it } from 'vitest';

const {
  buildReportingWhere,
  respondFilterError,
  ReportingFilterError,
  ReportingValidationErrors,
} = require('./filters');

const TYPES_WITH_STATUS = { status: 'ENUM', createdAt: 'DATE' };
const TYPES_NO_STATUS = { createdAt: 'DATE' };

function req(query = {}, project = { id: 5 }) {
  return { query, project };
}

describe('buildReportingWhere', () => {
  it('scopes by projectId from the path (query projectId ignored)', () => {
    const { where } = buildReportingWhere(
      req({ projectId: '999' }),
      'resources',
      { fieldTypes: TYPES_WITH_STATUS }
    );
    expect(where.projectId).toBe(5);
    expect(where).not.toHaveProperty('id');
  });

  it('projects component scopes by id, not projectId', () => {
    const { where } = buildReportingWhere(req(), 'projects', {
      fieldTypes: { createdAt: 'DATE' },
    });
    expect(where.id).toBe(5);
    expect(where).not.toHaveProperty('projectId');
  });

  it('votes/comments (no direct projectId column) scope via a resource include, not where.projectId', () => {
    for (const componentKey of ['votes', 'comments']) {
      const { where, include } = buildReportingWhere(req(), componentKey, {
        fieldTypes: TYPES_NO_STATUS,
      });
      expect(where).not.toHaveProperty('projectId');
      expect(include).toEqual([
        { viaModel: 'Resource', where: { projectId: 5 } },
      ]);
    }
  });

  it('column-scoped components (resources/submissions/choiceguides/projects) never return an include', () => {
    for (const componentKey of [
      'resources',
      'submissions',
      'choiceguides',
      'projects',
    ]) {
      const { include } = buildReportingWhere(req(), componentKey, {
        fieldTypes: TYPES_NO_STATUS,
      });
      expect(include).toBeUndefined();
    }
  });

  it('date range is half-open [dateFrom, dateTo) in UTC; accepts date + ISO', () => {
    const { where } = buildReportingWhere(
      req({ dateFrom: '2026-01-01', dateTo: '2026-02-01T12:00:00Z' }),
      'resources',
      { fieldTypes: TYPES_WITH_STATUS }
    );
    expect(where.createdAt[Op.gte].toISOString()).toBe(
      '2026-01-01T00:00:00.000Z'
    );
    expect(where.createdAt[Op.lt].toISOString()).toBe(
      '2026-02-01T12:00:00.000Z'
    );
  });

  it('rejects invalid dates and inverted ranges with a structured error', () => {
    expect(() =>
      buildReportingWhere(req({ dateFrom: 'nope' }), 'resources', {
        fieldTypes: TYPES_WITH_STATUS,
      })
    ).toThrow(ReportingFilterError);
    let err;
    try {
      buildReportingWhere(
        req({ dateFrom: '2026-02-01', dateTo: '2026-01-01' }),
        'resources',
        { fieldTypes: TYPES_WITH_STATUS }
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('invalid_date_range');
    expect(err.param).toBe('dateFrom');
  });

  // new Date() accepts all of these, silently querying a window the client
  // never asked for instead of returning the documented 400.
  it.each([
    ['01/02/2026', 'not ISO-8601, and read in the server timezone'],
    ['Jan 5 2026', 'not ISO-8601'],
    ['2026', 'year only'],
    ['2026-01-01T12:00:00', 'no zone, so server-local'],
    ['2026-02-31', 'impossible day, rolls into March'],
    ['2026-02-30T00:00:00Z', 'impossible day with a zone'],
    ['2026-01-01T24:00:00Z', 'hour out of range'],
    ['2026-01-01T00:60:00Z', 'minute out of range'],
    [' 2026-01-01', 'leading whitespace'],
    ['2026-1-1', 'unpadded components'],
  ])('rejects %s (%s)', (value) => {
    let err;
    try {
      buildReportingWhere(req({ dateFrom: value }), 'resources', {
        fieldTypes: TYPES_WITH_STATUS,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('invalid_date');
    expect(err.param).toBe('dateFrom');
  });

  it('rejects a non-string date param without echoing a coerced value', () => {
    let err;
    try {
      buildReportingWhere(
        req({ dateFrom: ['2026-01-01', '2026-02-01'] }),
        'resources',
        { fieldTypes: TYPES_WITH_STATUS }
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('invalid_date');
  });

  it.each([['2026-02-29'], ['2025-02-29']])(
    'rejects %s: Feb 29 in a non-leap year',
    (value) => {
      expect(() =>
        buildReportingWhere(req({ dateFrom: value }), 'resources', {
          fieldTypes: TYPES_WITH_STATUS,
        })
      ).toThrow(ReportingFilterError);
    }
  );

  it.each([
    ['2024-02-29', '2024-02-29T00:00:00.000Z'], // leap day in a leap year
    ['2026-12-31', '2026-12-31T00:00:00.000Z'], // December, days-in-month rollover
    ['2026-01-01T00:00:00.500Z', '2026-01-01T00:00:00.500Z'], // milliseconds
    ['2026-01-01T12:30Z', '2026-01-01T12:30:00.000Z'], // seconds optional
    ['2026-01-01T01:00:00+02:00', '2025-12-31T23:00:00.000Z'], // explicit offset
  ])('accepts %s', (value, expected) => {
    const { where } = buildReportingWhere(
      req({ dateFrom: value }),
      'resources',
      { fieldTypes: TYPES_WITH_STATUS }
    );
    expect(where.createdAt[Op.gte].toISOString()).toBe(expected);
  });

  it('applies status only where the component has a status column', () => {
    const ok = buildReportingWhere(req({ status: 'approved' }), 'resources', {
      fieldTypes: TYPES_WITH_STATUS,
      statusEnumValues: null,
    });
    expect(ok.where.status).toBe('approved');

    let err;
    try {
      buildReportingWhere(req({ status: 'approved' }), 'votes', {
        fieldTypes: TYPES_NO_STATUS,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('unsupported_status_filter');
    expect(err.param).toBe('status');
  });

  it('rejects a non-string status (e.g. ?status[x]=y qs-parsed into an object) with 400', () => {
    let err;
    try {
      buildReportingWhere(req({ status: { x: 'y' } }), 'submissions', {
        fieldTypes: TYPES_WITH_STATUS,
        statusEnumValues: ['approved', 'pending', 'unapproved'],
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('invalid_status_type');
    expect(err.param).toBe('status');
  });

  it('rejects an unknown status value against the component enum with 400', () => {
    let err;
    try {
      buildReportingWhere(req({ status: 'bogus' }), 'submissions', {
        fieldTypes: TYPES_WITH_STATUS,
        statusEnumValues: ['approved', 'pending', 'unapproved'],
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('unknown_status');
    expect(err.param).toBe('status');
    expect(err.hint).toContain('approved');
  });

  it('accepts a valid status value against the component enum', () => {
    const { where } = buildReportingWhere(
      req({ status: 'pending' }),
      'submissions',
      {
        fieldTypes: TYPES_WITH_STATUS,
        statusEnumValues: ['approved', 'pending', 'unapproved'],
      }
    );
    expect(where.status).toBe('pending');
  });

  it('skips enum validation when the component has no fixed status enum', () => {
    const { where } = buildReportingWhere(
      req({ status: 'anything-goes' }),
      'resources',
      { fieldTypes: TYPES_WITH_STATUS, statusEnumValues: null }
    );
    expect(where.status).toBe('anything-goes');
  });

  it('collects independent invalid dateFrom + dateTo into one ReportingValidationErrors (NLgov ADR: report all validation errors together)', () => {
    let err;
    try {
      buildReportingWhere(
        req({ dateFrom: 'nope', dateTo: 'also-nope' }),
        'resources',
        { fieldTypes: TYPES_WITH_STATUS }
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingValidationErrors);
    expect(err.errors).toHaveLength(2);
    expect(err.errors.map((e) => e.param)).toEqual(['dateFrom', 'dateTo']);
  });

  it('collects an invalid dateFrom together with an unsupported status filter', () => {
    let err;
    try {
      buildReportingWhere(req({ dateFrom: 'nope', status: 'x' }), 'votes', {
        fieldTypes: TYPES_NO_STATUS,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingValidationErrors);
    expect(err.errors.map((e) => e.code)).toEqual([
      'invalid_date',
      'unsupported_status_filter',
    ]);
  });

  it('collects an invalid dateFrom together with an unknown status value', () => {
    let err;
    try {
      buildReportingWhere(
        req({ dateFrom: 'nope', status: 'bogus' }),
        'submissions',
        {
          fieldTypes: TYPES_WITH_STATUS,
          statusEnumValues: ['approved', 'pending', 'unapproved'],
        }
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingValidationErrors);
    expect(err.errors.map((e) => e.code)).toEqual([
      'invalid_date',
      'unknown_status',
    ]);
  });

  it('does not double-report an inverted range when one side is also individually invalid', () => {
    // dateTo is unparseable — the range-order check must not ALSO fire,
    // since it can't meaningfully compare an invalid value.
    let err;
    try {
      buildReportingWhere(
        req({ dateFrom: '2026-02-01', dateTo: 'nope' }),
        'resources',
        { fieldTypes: TYPES_WITH_STATUS }
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('invalid_date');
    expect(err.param).toBe('dateTo');
  });
});

describe('respondFilterError', () => {
  it('sends HTTP 400 as an application/problem+json body (NLgov ADR)', () => {
    const captured = { headers: {} };
    const res = {
      status(c) {
        captured.status = c;
        return res;
      },
      set(k, v) {
        captured.headers[k] = v;
        return res;
      },
      json(b) {
        captured.body = b;
        return res;
      },
    };
    respondFilterError(
      res,
      new ReportingFilterError('invalid_date', 'bad', 'dateFrom', 'use ISO')
    );
    expect(captured.status).toBe(400);
    expect(captured.headers['Content-Type']).toBe('application/problem+json');
    expect(captured.body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/400',
      title: 'bad',
      status: 400,
      detail: 'use ISO',
      code: 'invalid_date',
      param: 'dateFrom',
    });
  });

  it('sends multiple validation errors together as one problem+json body with an errors array', () => {
    const captured = { headers: {} };
    const res = {
      status(c) {
        captured.status = c;
        return res;
      },
      set(k, v) {
        captured.headers[k] = v;
        return res;
      },
      json(b) {
        captured.body = b;
        return res;
      },
    };
    respondFilterError(
      res,
      new ReportingValidationErrors([
        new ReportingFilterError(
          'invalid_date',
          'bad dateFrom',
          'dateFrom',
          'hint1'
        ),
        new ReportingFilterError(
          'invalid_date',
          'bad dateTo',
          'dateTo',
          'hint2'
        ),
      ])
    );
    expect(captured.status).toBe(400);
    expect(captured.body.errors).toHaveLength(2);
    expect(captured.body.errors[0]).toEqual({
      code: 'invalid_date',
      title: 'bad dateFrom',
      param: 'dateFrom',
      detail: 'hint1',
    });
  });

  it('re-throws non-filter errors', () => {
    expect(() => respondFilterError({}, new Error('boom'))).toThrow('boom');
  });
});
