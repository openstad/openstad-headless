import { describe, expect, it } from 'vitest';

const filter = require('./report-field-filter');
const {
  getExposedFields,
  matchComponent,
} = require('@openstad-headless/lib/report-data-scope');

function runFilter(req, payload) {
  let captured;
  const res = {
    json(value) {
      captured = value;
    },
  };
  filter(req, res, () => {});
  res.json(payload);
  return captured;
}

function reqFor(path, dataScope, apiTokenScope = 'reports') {
  return { path, apiTokenScope, project: { config: { dataScope } } };
}

describe('report-data-scope catalog', () => {
  it('matches nested resource comment route as comments, not plans', () => {
    expect(matchComponent('/api/project/2/resource/5/comment')).toBe(
      'comments'
    );
    expect(matchComponent('/api/project/2/resource/5')).toBe('plans');
  });

  it('returns null exposed fields when a component is disabled', () => {
    expect(getExposedFields('votes', undefined)).toBeNull();
    expect(getExposedFields('votes', { enabled: false })).toBeNull();
  });

  it('ignores opted-in personal fields that are not in the catalog', () => {
    const fields = getExposedFields('votes', {
      enabled: true,
      personalFields: ['ip', 'bogus'],
    });
    expect(fields).toContain('ip');
    expect(fields).not.toContain('bogus');
  });
});

describe('report-field-filter middleware', () => {
  it('does not touch requests without a reporting token', () => {
    const payload = [{ id: 1, ip: '1.2.3.4' }];
    const out = runFilter(
      reqFor('/api/project/2/vote', { votes: { enabled: true } }, null),
      payload
    );
    expect(out).toEqual(payload);
  });

  it('keeps safe fields and opted-in personal fields, drops the rest', () => {
    const out = runFilter(
      reqFor('/api/project/2/vote', {
        votes: { enabled: true, personalFields: ['ip'] },
      }),
      [
        {
          id: 1,
          opinion: 'yes',
          checked: true,
          ip: '1.2.3.4',
          userId: 9,
          user: { email: 'a@b.nl' },
        },
      ]
    );
    expect(out).toEqual([
      { id: 1, opinion: 'yes', checked: true, ip: '1.2.3.4' },
    ]);
  });

  it('filters paginated { records } wrappers and preserves metadata', () => {
    const out = runFilter(
      reqFor('/api/project/2/vote', {
        votes: { enabled: true, personalFields: [] },
      }),
      { records: [{ id: 1, opinion: 'no', ip: '9.9.9.9' }], count: 1, page: 0 }
    );
    expect(out.records).toEqual([{ id: 1, opinion: 'no' }]);
    expect(out.count).toBe(1);
  });

  it('keeps only opted-in nested user fields', () => {
    const out = runFilter(
      reqFor('/api/project/2/vote', {
        votes: { enabled: true, personalFields: ['user.email'] },
      }),
      [{ id: 1, user: { email: 'a@b.nl', name: 'Secret', postcode: '1000AA' } }]
    );
    expect(out).toEqual([{ id: 1, user: { email: 'a@b.nl' } }]);
  });

  it('leaves /stats responses untouched', () => {
    const out = runFilter(reqFor('/stats/project/2/vote/total', {}), {
      count: 42,
    });
    expect(out).toEqual({ count: 42 });
  });
});

describe('report-field-filter — choiceguides and wrapper shapes', () => {
  const enableGuides = (personalFields = []) => ({
    choiceguides: { enabled: true, personalFields },
  });

  it('does not expose raw submitted answers (result) by default', () => {
    const out = runFilter(
      reqFor('/api/project/2/choicesguide', enableGuides()),
      [
        {
          id: 1,
          result: { answer: 'secret', ipAddress: 'hashed' },
          extraData: { email: 'a@b.nl' },
          createdAt: 't',
        },
      ]
    );
    expect(out).toEqual([{ id: 1, createdAt: 't' }]);
  });

  it('exposes result only when explicitly opted in', () => {
    const out = runFilter(
      reqFor('/api/project/2/choicesguide', enableGuides(['result'])),
      [{ id: 1, result: { answer: 'x' }, extraData: { email: 'a@b.nl' } }]
    );
    expect(out).toEqual([{ id: 1, result: { answer: 'x' } }]);
  });

  it('filters the choiceguide list { data, pagination } wrapper', () => {
    const out = runFilter(
      reqFor('/api/project/2/choicesguide', enableGuides()),
      {
        data: [{ id: 1, result: { answer: 'x' }, createdAt: 't' }],
        pagination: { page: 0, totalPages: 1, totalCount: 1 },
      }
    );
    expect(out.data).toEqual([{ id: 1, createdAt: 't' }]);
    expect(out.pagination).toEqual({ page: 0, totalPages: 1, totalCount: 1 });
  });

  it('passes a { count } aggregate through untouched', () => {
    const out = runFilter(
      reqFor('/api/project/2/submission', {
        surveys: { enabled: true, personalFields: [] },
      }),
      { count: 7 }
    );
    expect(out).toEqual({ count: 7 });
  });

  it('fails closed on an id-less non-metadata object (no leak)', () => {
    const out = runFilter(
      reqFor('/api/project/2/submission', {
        surveys: { enabled: true, personalFields: [] },
      }),
      { email: 'a@b.nl', name: 'Secret' }
    );
    expect(out).toEqual({});
  });

  it('treats plan free-text (description/summary) as opt-in', () => {
    const rec = {
      id: 1,
      title: 'Plan',
      summary: 'samenvatting',
      description: 'Bel mij op 06-12345678',
      status: 'OPEN',
    };
    const without = runFilter(
      reqFor('/api/project/2/resource', {
        plans: { enabled: true, personalFields: [] },
      }),
      [rec]
    );
    expect(without).toEqual([{ id: 1, title: 'Plan', status: 'OPEN' }]);

    const withText = runFilter(
      reqFor('/api/project/2/resource', {
        plans: { enabled: true, personalFields: ['description'] },
      }),
      [rec]
    );
    expect(withText).toEqual([
      {
        id: 1,
        title: 'Plan',
        status: 'OPEN',
        description: 'Bel mij op 06-12345678',
      },
    ]);
  });

  it('filters a single record identified by id', () => {
    const out = runFilter(
      reqFor('/api/project/2/submission', {
        surveys: { enabled: true, personalFields: [] },
      }),
      { id: 'uuid-1', status: 'approved', submittedData: { email: 'a@b.nl' } }
    );
    expect(out).toEqual({ id: 'uuid-1', status: 'approved' });
  });
});
