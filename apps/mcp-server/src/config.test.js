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

  it('accepts the highest valid port', () => {
    expect(loadConfig({ MCP_PORT: '65535' }).port).toBe(65535);
  });

  // These reached listen() before and threw a RangeError there
  // ("options.port should be >= 0 and < 65536"), taking the server down at
  // startup instead of falling back to the default.
  it.each([
    ['3900.5', 'not an integer'],
    ['65536', 'one above the maximum'],
    ['99999', 'far out of range'],
    ['-1', 'negative'],
    ['abc', 'not a number'],
    ['1e4000', 'Infinity'],
    [' ', 'whitespace only — Number(" ") is 0, which would mean "random port"'],
    ['\t\n', 'whitespace only'],
  ])('falls back to the default for MCP_PORT=%s (%s)', (value) => {
    expect(loadConfig({ MCP_PORT: value }).port).toBe(3900);
  });

  it('still accepts a padded value', () => {
    expect(loadConfig({ MCP_PORT: ' 4000 ' }).port).toBe(4000);
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
