import { describe, expect, it } from 'vitest';

const { loadConfig } = require('./config');

describe('loadConfig', () => {
  it('applies defaults for apiBaseUrl, host and port', () => {
    const config = loadConfig({});
    expect(config).toEqual({
      apiBaseUrl: 'http://localhost:31410',
      host: '127.0.0.1',
      port: 3900,
    });
  });

  it('honors explicit overrides', () => {
    const config = loadConfig({
      MCP_REPORTING_API_BASE_URL: 'https://reports.example.org',
      MCP_PORT: '4000',
    });
    expect(config.apiBaseUrl).toBe('https://reports.example.org');
    expect(config.port).toBe(4000);
  });

  it('treats MCP_PORT=0 as an explicit value (OS-assigned free port), not "unset"', () => {
    const config = loadConfig({
      MCP_PORT: '0',
    });
    expect(config.port).toBe(0);
  });

  it('honors an explicit MCP_HOST override', () => {
    const config = loadConfig({
      MCP_HOST: '0.0.0.0',
    });
    expect(config.host).toBe('0.0.0.0');
  });
});
