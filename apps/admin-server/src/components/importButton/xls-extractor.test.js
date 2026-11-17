import { describe, expect, it } from 'vitest';

import { processXlsRow } from './xls-extractor';

describe('processXlsRow', () => {
  it('merges a dotted key into a parent that arrives as a JSON string, regardless of column order', () => {
    const dottedFirst = processXlsRow({
      'extraData.embeddedUrl': 'https://example.com/page',
      extraData: '{"theme":"groen"}',
    });
    expect(dottedFirst.extraData).toEqual({
      theme: 'groen',
      embeddedUrl: 'https://example.com/page',
    });

    const parentFirst = processXlsRow({
      extraData: '{"theme":"groen"}',
      'extraData.embeddedUrl': 'https://example.com/page',
    });
    expect(parentFirst.extraData).toEqual({
      theme: 'groen',
      embeddedUrl: 'https://example.com/page',
    });
  });

  it('merges a dotted key into an empty JSON object parent', () => {
    const row = processXlsRow({
      'extraData.embeddedUrl': 'https://example.com/page',
      extraData: '{}',
    });
    expect(row.extraData).toEqual({ embeddedUrl: 'https://example.com/page' });
  });

  it('creates the parent object when the parent column is absent', () => {
    const row = processXlsRow({
      title: 'Testplan',
      'location.lat': '52.37',
      'location.lng': '4.89',
    });
    expect(row.title).toBe('Testplan');
    expect(row.location).toEqual({ lat: 52.37, lng: 4.89 });
  });

  it('parses JSON values in plain columns and leaves other strings alone', () => {
    const row = processXlsRow({
      title: 'Testplan',
      budget: '1500',
      tags: '[1,2,3]',
    });
    expect(row.title).toBe('Testplan');
    expect(row.budget).toBe(1500);
    expect(row.tags).toEqual([1, 2, 3]);
  });

  it('does not choke on a malformed parent cell', () => {
    const row = processXlsRow({
      extraData: '{not valid json',
      'extraData.embeddedUrl': 'https://example.com/page',
    });
    expect(row.extraData).toEqual({ embeddedUrl: 'https://example.com/page' });
  });
});
