import path from 'path';
import { describe, expect, it, vi } from 'vitest';

// serialize.js (required transitively by paginate.js) imports the workspace
// package; redirect it to the local worktree file.
vi.mock('@openstad-headless/lib/report-data-scope', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(
    path.resolve(__dirname, '../../../../../packages/lib/report-data-scope')
  );
});

const {
  parsePageParams,
  paginateReporting,
  buildNextLink,
} = require('./paginate');

// stub serializer — identity-ish, avoids loading the db-backed registry
const serialize = (_componentKey, row) => ({ id: row.id });

function makeReq(query = {}) {
  return {
    query,
    baseUrl: '/api/project/1/reports',
    path: '/resources',
    reportingScope: { componentKey: 'resources', enabledPersonalFields: [] },
  };
}

describe('parsePageParams', () => {
  it('defaults: page 1, pageSize 100, offset 0, fetchLimit 101', () => {
    expect(parsePageParams({ query: {} })).toEqual({
      page: 1,
      pageSize: 100,
      offset: 0,
      fetchLimit: 101,
    });
  });
  it('1-based offset', () => {
    expect(
      parsePageParams({ query: { page: '3', pageSize: '100' } }).offset
    ).toBe(200);
  });
  it('clamps pageSize > 1000 to 1000', () => {
    expect(parsePageParams({ query: { pageSize: '5000' } }).pageSize).toBe(
      1000
    );
  });
  it('invalid pageSize → 100, invalid page → 1', () => {
    expect(
      parsePageParams({ query: { pageSize: 'abc', page: '0' } })
    ).toMatchObject({
      pageSize: 100,
      page: 1,
    });
    expect(parsePageParams({ query: { page: '-2' } }).page).toBe(1);
  });
});

describe('buildNextLink', () => {
  it('RelativePath: no leading slash, api/ prefix, projectId in path, filters kept', () => {
    const req = makeReq({
      dateFrom: '2026-01-01',
      pageSize: '100',
      page: '1',
      foo: 'bar',
    });
    expect(buildNextLink(req, 2)).toBe(
      'api/project/1/reports/resources?dateFrom=2026-01-01&page=2&pageSize=100'
    );
  });
});

describe('paginateReporting', () => {
  it('lookahead: pageSize+1 rows → hasNext, data trimmed to pageSize, nextLink set', () => {
    const req = makeReq({ page: '1', pageSize: '2' });
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }]; // fetched 3 (=pageSize+1)
    const { data, nextLink } = paginateReporting({
      req,
      componentKey: 'resources',
      rows,
      page: 1,
      pageSize: 2,
      serialize,
    });
    expect(data).toHaveLength(2);
    expect(data.map((d) => d.id)).toEqual([1, 2]);
    expect(nextLink).toBe('api/project/1/reports/resources?page=2&pageSize=2');
  });

  it('exactly pageSize rows → nextLink null (last page)', () => {
    const req = makeReq({ page: '1', pageSize: '3' });
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const { data, nextLink } = paginateReporting({
      req,
      componentKey: 'resources',
      rows,
      page: 1,
      pageSize: 3,
      serialize,
    });
    expect(data).toHaveLength(3);
    expect(nextLink).toBeNull();
  });

  it('empty result → { data: [], nextLink: null }', () => {
    const req = makeReq();
    const { data, nextLink } = paginateReporting({
      req,
      componentKey: 'resources',
      rows: [],
      page: 1,
      pageSize: 100,
      serialize,
    });
    expect(data).toEqual([]);
    expect(nextLink).toBeNull();
    expect(req.reportNextLink).toBeNull();
  });

  it('stashes extra columns and pseudonym map by id for report-finalize', () => {
    process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET = 'test-secret';
    const req = makeReq({ pageSize: '10' });
    const rows = [{ id: 7, userId: null }];
    paginateReporting({
      req,
      componentKey: 'votes',
      rows,
      page: 1,
      pageSize: 10,
      serialize,
      extraColumns: (r) => ({ voteId: r.id }),
    });
    expect(req.reportExtraColumns[7]).toEqual({ voteId: 7 });
    expect(req.reportUserPseudonyms[7]).toBeNull(); // anonymous
  });

  it('passes req and the full page of plain rows as the 2nd/3rd extraColumns args (#440 cross-row union)', () => {
    const req = makeReq({ pageSize: '10' });
    const rows = [
      { id: 1, widgetId: 5 },
      { id: 2, widgetId: 6 },
    ];
    const seenArgs = [];
    paginateReporting({
      req,
      componentKey: 'submissions',
      rows,
      page: 1,
      pageSize: 10,
      serialize,
      includeUserId: false,
      extraColumns: (row, passedReq, allRows) => {
        seenArgs.push({ row, passedReq, allRows });
        return {};
      },
    });
    expect(seenArgs).toHaveLength(2);
    expect(seenArgs[0].passedReq).toBe(req);
    expect(seenArgs[0].allRows).toEqual(rows);
    expect(seenArgs[1].allRows).toBe(seenArgs[0].allRows); // same page-wide array both calls
  });
});
