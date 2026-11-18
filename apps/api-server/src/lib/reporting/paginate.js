'use strict';

const { pseudonymizeUserId } = require('./pseudonymize');
const { toPlain } = require('./serialize');

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1000;

/**
 * Parses pagination params from the request.
 *  - page: 1-based; invalid / <1 → 1
 *  - pageSize: default 100; invalid / <1 → 100; >1000 → clamped to 1000 (silent)
 *  - fetchLimit = pageSize + 1  (limit+1 lookahead — no COUNT / totalCount)
 * @param {import('express').Request} req
 */
function parsePageParams(req) {
  const q = (req && req.query) || {};

  let page = parseInt(q.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let pageSize = parseInt(q.pageSize, 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    fetchLimit: pageSize + 1,
  };
}

/**
 * Builds the nextLink as a RelativePath (Power BI Service scheduled refresh).
 *
 * projectId lives in the PATH (routing choice A: /api/project/:projectId/reports/*),
 * so it is NOT added to the query. The relative path is taken from the request
 * (req.baseUrl + req.path), normalised to: no leading slash, with an `api/`
 * prefix. Active filters (dateFrom, dateTo, status, widgetId) + pageSize are
 * preserved and `page` is set to nextPage.
 *
 * e.g. "api/project/1/reports/resources?dateFrom=2026-01-01&page=2&pageSize=100"
 *
 * @param {import('express').Request} req
 * @param {number} nextPage
 * @returns {string}
 */
function buildNextLink(req, nextPage) {
  const rawPath = `${req.baseUrl || ''}${req.path || ''}`;
  let path = rawPath.replace(/^\/+/, ''); // strip leading slash(es)
  if (!/^api\//.test(path)) path = `api/${path}`;

  const params = new URLSearchParams();
  const q = req.query || {};
  for (const key of ['dateFrom', 'dateTo', 'status', 'widgetId']) {
    if (q[key] !== undefined && q[key] !== '') params.set(key, String(q[key]));
  }
  params.set('page', String(nextPage));
  // pageSize is echoed explicitly (already clamped by the caller).
  const pageSize = parseInt(q.pageSize, 10);
  params.set(
    'pageSize',
    String(
      Number.isFinite(pageSize) && pageSize >= 1
        ? Math.min(pageSize, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE
    )
  );

  return `${path}?${params.toString()}`;
}

/**
 * Turns raw rows (fetched with fetchLimit = pageSize+1, ORDER BY id ASC) into
 * the reporting envelope { data, nextLink }, and stashes the data needed by the
 * report-finalize middleware to survive the field-filter:
 *   - req.reportNextLink        (string|null)
 *   - req.reportUserPseudonyms  ({ [id]: pseudonym|null })   — unless includeUserId=false
 *   - req.reportExtraColumns    ({ [id]: {..extra columns} }) — via opts.extraColumns
 *
 * @param {{
 *   req: import('express').Request,
 *   componentKey: string,
 *   rows: any[],
 *   page: number,
 *   pageSize: number,
 *   serialize: (componentKey:string, row:any, scope:any)=>object,
 *   includeUserId?: boolean,
 *   extraColumns?: (plainRow:object, req:import('express').Request, allPlainRows:object[])=>object,
 * }} args
 * @returns {{data: object[], nextLink: string|null}}
 */
function paginateReporting({
  req,
  componentKey,
  rows,
  page,
  pageSize,
  serialize,
  includeUserId = true,
  extraColumns,
}) {
  const list = Array.isArray(rows) ? rows : [];
  const hasNext = list.length > pageSize;
  const pageRows = hasNext ? list.slice(0, pageSize) : list;

  if (includeUserId && !req.reportUserPseudonyms) req.reportUserPseudonyms = {};
  if (extraColumns && !req.reportExtraColumns) req.reportExtraColumns = {};

  // Pre-computed once so extraColumns callbacks that need cross-row context
  // (e.g. #440's multi-form field union) don't each re-derive it themselves.
  const allPlainRows = extraColumns ? pageRows.map(toPlain) : null;

  const data = pageRows.map((row) => {
    const plain = toPlain(row);
    if (includeUserId) {
      req.reportUserPseudonyms[plain.id] = pseudonymizeUserId(
        plain.userId,
        req.project.id
      );
    }
    if (extraColumns) {
      req.reportExtraColumns[plain.id] =
        extraColumns(plain, req, allPlainRows) || {};
    }
    return serialize(componentKey, plain, req.reportingScope);
  });

  const nextLink = hasNext ? buildNextLink(req, page + 1) : null;
  req.reportNextLink = nextLink;

  return { data, nextLink };
}

module.exports = {
  parsePageParams,
  paginateReporting,
  buildNextLink,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
