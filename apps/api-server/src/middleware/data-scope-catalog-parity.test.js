import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { COMPONENTS } = require(
  path.resolve(__dirname, '../../../../packages/lib/report-data-scope')
);

// The admin data-scope UI keeps its own catalog (friendly Dutch labels) in
// data-scope-catalog.ts. The set of personal-field KEYS it offers must match
// the backend catalog exactly, otherwise the admin could check a field that is
// silently ignored, or a backend field would never be offered in the UI.
const ADMIN_CATALOG_PATH = path.resolve(
  __dirname,
  '../../../admin-server/src/pages/projects/[project]/settings/data-scope-catalog.ts'
);

function extractAdminPersonalFieldKeys(componentKeys) {
  const text = fs.readFileSync(ADMIN_CATALOG_PATH, 'utf8');

  // Locate the start index of each top-level component block.
  const starts = componentKeys
    .map((key) => ({ key, index: text.indexOf(`${key}: {`) }))
    .sort((a, b) => a.index - b.index);

  const result = {};
  starts.forEach((entry, i) => {
    expect(
      entry.index,
      `component '${entry.key}' missing from admin catalog`
    ).toBeGreaterThan(-1);
    const end = i + 1 < starts.length ? starts[i + 1].index : text.length;
    const block = text.slice(entry.index, end);
    const keys = [...block.matchAll(/key:\s*'([^']+)'/g)].map((m) => m[1]);
    result[entry.key] = keys.sort();
  });
  return result;
}

describe('data-scope catalog parity (admin UI ↔ backend lib)', () => {
  const componentKeys = Object.keys(COMPONENTS);
  const adminKeys = extractAdminPersonalFieldKeys(componentKeys);

  it('admin catalog file exists', () => {
    expect(fs.existsSync(ADMIN_CATALOG_PATH)).toBe(true);
  });

  for (const key of Object.keys(COMPONENTS)) {
    it(`'${key}' personal fields match between admin and lib`, () => {
      const libFields = [...COMPONENTS[key].personalFields].sort();
      expect(adminKeys[key]).toEqual(libFields);
    });
  }
});
