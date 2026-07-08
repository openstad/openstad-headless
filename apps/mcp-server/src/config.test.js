import { describe, expect, it } from 'vitest';

const { loadConfig } = require('./config');

describe('loadConfig', () => {
  it('throws when MCP_REPORTING_API_TOKEN is missing', () => {
    expect(() => loadConfig({ MCP_REPORTING_PROJECT_ID: '2' })).toThrow(
      'MCP_REPORTING_API_TOKEN'
    );
  });

  it('throws when MCP_REPORTING_PROJECT_ID is missing', () => {
    expect(() => loadConfig({ MCP_REPORTING_API_TOKEN: 'osr_x' })).toThrow(
      'MCP_REPORTING_PROJECT_ID'
    );
  });

  it('applies defaults for apiBaseUrl, host and port', () => {
    const config = loadConfig({
      MCP_REPORTING_API_TOKEN: 'osr_x',
      MCP_REPORTING_PROJECT_ID: '2',
    });
    expect(config).toEqual({
      apiBaseUrl: 'http://localhost:31410',
      reportingToken: 'osr_x',
      projectId: '2',
      host: '127.0.0.1',
      authToken: undefined,
      port: 3900,
    });
  });

  it('honors explicit overrides', () => {
    const config = loadConfig({
      MCP_REPORTING_API_TOKEN: 'osr_x',
      MCP_REPORTING_PROJECT_ID: '2',
      MCP_REPORTING_API_BASE_URL: 'https://reports.example.org',
      MCP_PORT: '4000',
    });
    expect(config.apiBaseUrl).toBe('https://reports.example.org');
    expect(config.port).toBe(4000);
  });

  it('treats MCP_PORT=0 as an explicit value (OS-assigned free port), not "unset"', () => {
    const config = loadConfig({
      MCP_REPORTING_API_TOKEN: 'osr_x',
      MCP_REPORTING_PROJECT_ID: '2',
      MCP_PORT: '0',
    });
    expect(config.port).toBe(0);
  });

  it('refuses a non-localhost MCP_HOST without MCP_SERVER_AUTH_TOKEN', () => {
    expect(() =>
      loadConfig({
        MCP_REPORTING_API_TOKEN: 'osr_x',
        MCP_REPORTING_PROJECT_ID: '2',
        MCP_HOST: '0.0.0.0',
      })
    ).toThrow('MCP_SERVER_AUTH_TOKEN');
  });

  it('allows a non-localhost MCP_HOST when MCP_SERVER_AUTH_TOKEN is set', () => {
    const config = loadConfig({
      MCP_REPORTING_API_TOKEN: 'osr_x',
      MCP_REPORTING_PROJECT_ID: '2',
      MCP_HOST: '0.0.0.0',
      MCP_SERVER_AUTH_TOKEN: 'shared-secret',
    });
    expect(config.host).toBe('0.0.0.0');
    expect(config.authToken).toBe('shared-secret');
  });
});
