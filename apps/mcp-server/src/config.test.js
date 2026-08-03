import { describe, expect, it } from 'vitest';

const { loadConfig } = require('./config');

describe('loadConfig', () => {
  it('applies defaults for apiBaseUrl, host and port', () => {
    const config = loadConfig({});
    expect(config).toEqual({
      apiBaseUrl: 'http://localhost:31410',
      host: '127.0.0.1',
      allowedHosts: undefined,
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

  it('parses MCP_ALLOWED_HOSTS into a trimmed list', () => {
    const config = loadConfig({
      MCP_ALLOWED_HOSTS: 'reporting-mcp.example.org, mcp.internal ',
    });
    expect(config.allowedHosts).toEqual([
      'reporting-mcp.example.org',
      'mcp.internal',
    ]);
  });

  it('leaves allowedHosts undefined when MCP_ALLOWED_HOSTS is empty or blank, so the SDK default applies', () => {
    expect(loadConfig({}).allowedHosts).toBeUndefined();
    expect(loadConfig({ MCP_ALLOWED_HOSTS: '' }).allowedHosts).toBeUndefined();
    expect(
      loadConfig({ MCP_ALLOWED_HOSTS: ' , ' }).allowedHosts
    ).toBeUndefined();
  });
});
