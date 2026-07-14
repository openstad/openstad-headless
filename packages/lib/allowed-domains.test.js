import { describe, expect, test } from 'vitest';

const {
  addWithParents,
  expandDomains,
  getParentDomains,
} = require('./allowed-domains');

describe('allowed-domains www handling', () => {
  test('expands a bare domain to include its www variant', () => {
    const result = expandDomains(['amsterdam.nl']);
    expect(result).toContain('amsterdam.nl');
    expect(result).toContain('www.amsterdam.nl');
  });

  test('expands a www domain to include its bare variant', () => {
    const result = expandDomains(['www.amsterdam.nl']);
    expect(result).toContain('www.amsterdam.nl');
    expect(result).toContain('amsterdam.nl');
  });

  test('adds www variants for parent domains too', () => {
    const result = expandDomains(['openstad.gemeente.nl']);
    expect(result).toContain('openstad.gemeente.nl');
    expect(result).toContain('www.openstad.gemeente.nl');
    expect(result).toContain('gemeente.nl');
    expect(result).toContain('www.gemeente.nl');
  });

  test('addWithParents includes the www variant of the host', () => {
    const list = [];
    addWithParents(list, 'amsterdam.nl');
    expect(list).toContain('amsterdam.nl');
    expect(list).toContain('www.amsterdam.nl');
  });

  test('getParentDomains still returns only ancestor domains', () => {
    expect(getParentDomains('openstad.gemeente.nl')).toEqual(['gemeente.nl']);
  });
});
