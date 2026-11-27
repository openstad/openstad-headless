import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { parseConfig } = require('./config-field');

describe('project config map.clustering', () => {
  it('defaults to off when not set', () => {
    expect(parseConfig('projectConfig', {}).map.clustering).toBe('off');
  });

  it.each(['off', 'low', 'medium', 'high'])('accepts %s', (level) => {
    const config = parseConfig('projectConfig', {
      map: { clustering: level },
    });
    expect(config.map.clustering).toBe(level);
  });

  it('rejects an unknown value', () => {
    expect(() =>
      parseConfig('projectConfig', { map: { clustering: 'banana' } })
    ).toThrow('clustering has an invalid value');
  });

  it('keeps the other map fields', () => {
    const config = parseConfig('projectConfig', {
      map: { clustering: 'high', maxZoom: '18' },
    });
    expect(config.map.maxZoom).toBe('18');
  });
});
