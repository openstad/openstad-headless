import { describe, expect, it, vi } from 'vitest';

const reportFinalize = require('./report-finalize');

// Installs the middleware on a fake req/res, then simulates the downstream
// (post field-filter) res.json call and returns the captured output.
function run(payload, reqOverrides = {}) {
  const captured = { body: undefined };
  const req = { apiTokenScope: 'reports', ...reqOverrides };
  const res = {
    json(body) {
      captured.body = body;
      return res;
    },
  };
  const next = vi.fn();
  reportFinalize(req, res, next);
  expect(next).toHaveBeenCalled();
  res.json(payload);
  return captured.body;
}

describe('reportFinalize', () => {
  it('rebuilds { data, nextLink } and restores pseudonymous userId + extra columns', () => {
    const out = run(
      // shape produced by report-field-filter (metadata + data, nextLink dropped)
      { metadata: undefined, data: [{ id: 1, status: 'x' }] },
      {
        reportNextLink: 'api/project/1/reports/votes?page=2&pageSize=100',
        reportUserPseudonyms: { 1: 'hash1' },
        reportExtraColumns: { 1: { voteId: 1 } },
      }
    );
    expect(out).toEqual({
      data: [{ id: 1, status: 'x', userId: 'hash1', voteId: 1 }],
      nextLink: 'api/project/1/reports/votes?page=2&pageSize=100',
    });
  });

  it('anonymous rows → userId null; last page → nextLink null', () => {
    const out = run(
      { data: [{ id: 2 }] },
      { reportNextLink: null, reportUserPseudonyms: { 2: null } }
    );
    expect(out).toEqual({ data: [{ id: 2, userId: null }], nextLink: null });
  });

  it('accepts a bare array payload from the field-filter', () => {
    const out = run([{ id: 3 }], {
      reportNextLink: null,
      reportUserPseudonyms: {},
    });
    expect(out).toEqual({ data: [{ id: 3, userId: null }], nextLink: null });
  });

  it('does not touch non-reporting requests', () => {
    const payload = { anything: true };
    const out = run(payload, { apiTokenScope: undefined });
    expect(out).toBe(payload);
  });

  it('passes through reporting responses that did not go through pagination', () => {
    // e.g. an aggregate endpoint that never set req.reportNextLink
    const payload = [{ counted: 5 }];
    const out = run(payload, {});
    expect(out).toBe(payload);
  });
});
