import { afterEach, describe, expect, it, vi } from 'vitest';

const { buildUrl, fetchReportingData } = require('./reporting-client');

describe('buildUrl', () => {
  it('builds the versioned project-scoped path with query params, skipping empty/undefined values', () => {
    const url = buildUrl('http://localhost:31410', '2', '/resources', {
      dateFrom: '2026-01-01',
      dateTo: '',
      status: undefined,
      pageSize: 20,
    });
    expect(url.pathname).toBe('/api/project/2/reports/v1/resources');
    expect(url.searchParams.get('dateFrom')).toBe('2026-01-01');
    expect(url.searchParams.has('dateTo')).toBe(false);
    expect(url.searchParams.has('status')).toBe(false);
    expect(url.searchParams.get('pageSize')).toBe('20');
  });
});

describe('fetchReportingData', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const config = {
    apiBaseUrl: 'http://localhost:31410',
    projectId: '2',
    reportingToken: 'osr_test',
  };

  it('sends the bearer token and returns the parsed JSON body on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 1 }], nextLink: null }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const body = await fetchReportingData(config, '/resources', {
      pageSize: 20,
    });

    expect(body).toEqual({ data: [{ id: 1 }], nextLink: null });
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      'http://localhost:31410/api/project/2/reports/v1/resources?pageSize=20'
    );
    expect(options.headers.Authorization).toBe('Bearer osr_test');
  });

  it('throws with the problem+json body attached on a non-2xx response', async () => {
    const problem = {
      type: 'https://developer.overheid.nl/api-design-rules/problem/403',
      title:
        "Component 'votes' is not enabled for this project's reporting scope",
      status: 403,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => problem,
      })
    );

    let err;
    try {
      await fetchReportingData(config, '/votes', {});
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe(problem.title);
    expect(err.status).toBe(403);
    expect(err.problem).toEqual(problem);
  });

  it('reports the real status when a proxy answers with a non-JSON error body', async () => {
    // A 502 from an ingress is an HTML page, not problem+json — parsing it
    // first would throw a SyntaxError and hide the actual status.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        },
      })
    );

    let err;
    try {
      await fetchReportingData(config, '/resources', {});
    } catch (e) {
      err = e;
    }
    expect(err.status).toBe(502);
    expect(err.message).toBe('Reporting API request failed with status 502');
  });

  it('folds a problem body detail into the error message (the SDK only ever surfaces .message to the LLM)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          type: 'https://developer.overheid.nl/api-design-rules/problem/400',
          title: "'dateFrom' is not a valid date: 'nope'",
          detail: 'Use YYYY-MM-DD or ISO-8601 UTC',
          status: 400,
        }),
      })
    );

    let err;
    try {
      await fetchReportingData(config, '/resources', {});
    } catch (e) {
      err = e;
    }
    expect(err.message).toBe(
      "'dateFrom' is not a valid date: 'nope' — Use YYYY-MM-DD or ISO-8601 UTC"
    );
  });

  it('folds every sub-error of a multi-error problem body into one message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          type: 'https://developer.overheid.nl/api-design-rules/problem/400',
          title: 'Multiple validation errors',
          status: 400,
          errors: [
            {
              code: 'invalid_date',
              title: "'dateFrom' is not a valid date: 'nope'",
              param: 'dateFrom',
              detail: 'Use YYYY-MM-DD or ISO-8601 UTC',
            },
            {
              code: 'unsupported_status_filter',
              title: "The 'votes' report has no status field to filter on",
              param: 'status',
              detail: 'Remove the status parameter for this endpoint',
            },
          ],
        }),
      })
    );

    let err;
    try {
      await fetchReportingData(config, '/votes', {});
    } catch (e) {
      err = e;
    }
    expect(err.message).toBe(
      "Multiple validation errors: dateFrom: 'dateFrom' is not a valid date: 'nope' — Use YYYY-MM-DD or ISO-8601 UTC; status: The 'votes' report has no status field to filter on — Remove the status parameter for this endpoint"
    );
  });
});
