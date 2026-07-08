import { afterEach, describe, expect, it, vi } from 'vitest';

const { makeReportTool, DEFAULT_MCP_PAGE_SIZE } = require('./make-report-tool');

function stubFetch(implementation) {
  vi.stubGlobal('fetch', vi.fn(implementation));
}

describe('makeReportTool', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const config = {
    apiBaseUrl: 'http://localhost:31410',
    projectId: '2',
    reportingToken: 'osr_test',
  };

  it('injects the default MCP page size when the caller omits it, for a tool whose paramsShape declares pageSize', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], nextLink: null }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const tool = makeReportTool({
      name: 'reporting_resources',
      description: 'x',
      path: '/resources',
      paramsShape: { pageSize: true },
    });
    await tool.handler(config, { dateFrom: '2026-01-01' });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('dateFrom=2026-01-01');
    expect(String(url)).toContain(`pageSize=${DEFAULT_MCP_PAGE_SIZE}`);
  });

  it('respects an explicit pageSize from the caller', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], nextLink: null }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const tool = makeReportTool({
      name: 'reporting_resources',
      description: 'x',
      path: '/resources',
      paramsShape: { pageSize: true },
    });
    await tool.handler(config, { pageSize: 5 });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('pageSize=5');
  });

  it('does NOT inject a pageSize for a tool whose paramsShape omits it (e.g. an unpaginated endpoint)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ uniqueParticipants: 0, byType: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const tool = makeReportTool({
      name: 'reporting_users_aggregates',
      description: 'x',
      path: '/users/aggregates',
      // no paramsShape at all — mirrors definitions.js's reporting_users_aggregates
    });
    await tool.handler(config, {});

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('pageSize');
  });

  it('returns the reporting API response as MCP text content', async () => {
    stubFetch(async () => ({
      ok: true,
      json: async () => ({ data: [{ id: 1 }], nextLink: null }),
    }));

    const tool = makeReportTool({
      name: 'reporting_resources',
      description: 'x',
      path: '/resources',
    });
    const result = await tool.handler(config, {});

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ data: [{ id: 1 }], nextLink: null }),
        },
      ],
    });
  });

  it('propagates the reporting API problem+json error so the SDK can surface it as a tool error', async () => {
    stubFetch(async () => ({
      ok: false,
      status: 403,
      json: async () => ({
        type: 'https://developer.overheid.nl/api-design-rules/problem/403',
        title:
          "Component 'votes' is not enabled for this project's reporting scope",
        status: 403,
      }),
    }));

    const tool = makeReportTool({
      name: 'reporting_votes',
      description: 'x',
      path: '/votes',
    });

    await expect(tool.handler(config, {})).rejects.toThrow(
      "Component 'votes' is not enabled for this project's reporting scope"
    );
  });
});
