import path from 'path';
import { describe, expect, it, vi } from 'vitest';

// Redirect the workspace package import to the local worktree file so tests can
// run before npm install has updated the shared node_modules.
vi.mock('@openstad-headless/lib/report-data-scope', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(
    path.resolve(__dirname, '../../../../../packages/lib/report-data-scope')
  );
});

const { serializeRecord, coerceValue } = require('./serialize');
const {
  getExposedFields,
} = require('@openstad-headless/lib/report-data-scope');

// A fake Sequelize instance to prove .get({plain:true}) normalization.
function fakeInstance(plain) {
  return { get: ({ plain: p } = {}) => (p ? plain : plain) };
}

describe('coerceValue', () => {
  it('dates → full ISO-8601 UTC (Date and string), null-safe', () => {
    expect(coerceValue(new Date('2026-07-01T14:30:00Z'), 'DATE')).toBe(
      '2026-07-01T14:30:00.000Z'
    );
    expect(coerceValue('2026-07-01', 'DATEONLY')).toBe(
      '2026-07-01T00:00:00.000Z'
    );
    expect(coerceValue(null, 'DATE')).toBeNull();
  });
  it('DECIMAL/FLOAT → Number, null-safe', () => {
    expect(coerceValue('10.5', 'DECIMAL')).toBe(10.5);
    expect(coerceValue(null, 'DECIMAL')).toBeNull();
  });
  it('JSON and any object/array → JSON string', () => {
    expect(coerceValue({ a: 1 }, 'JSON')).toBe('{"a":1}');
    expect(coerceValue([1, 2], 'UNKNOWN')).toBe('[1,2]');
    expect(coerceValue({ lat: 1 }, 'UNKNOWN')).toBe('{"lat":1}');
  });
  it('primitives pass through', () => {
    expect(coerceValue('todo', 'STRING')).toBe('todo');
    expect(coerceValue(3, 'INTEGER')).toBe(3);
  });
});

describe('serializeRecord', () => {
  const fieldTypes = {
    id: 'INTEGER',
    projectId: 'INTEGER',
    createdAt: 'DATE',
    updatedAt: 'DATE',
    publishDate: 'DATE',
    startDate: 'DATE',
    endDate: 'DATE',
    budget: 'DECIMAL',
    tags: 'JSON',
    location: 'JSON',
    status: 'STRING',
    widgetId: 'INTEGER',
  };

  it('emits exactly the exposed top-level keys (minus user.*)', () => {
    const scope = { componentKey: 'resources', enabledPersonalFields: [] };
    const out = serializeRecord(
      'resources',
      fakeInstance({
        id: 1,
        projectId: 2,
        createdAt: new Date('2026-07-01T00:00:00Z'),
      }),
      scope,
      { fieldTypes }
    );
    const expectedTop = getExposedFields('resources', []).filter(
      (f) => !f.includes('.')
    );
    expect(Object.keys(out).sort()).toEqual(expectedTop.sort());
  });

  it('never emits raw userId / ip / submittedData', () => {
    const out = serializeRecord(
      'resources',
      { id: 1, userId: 99, ip: '1.2.3.4', submittedData: { x: 1 } },
      { enabledPersonalFields: [] },
      { fieldTypes }
    );
    expect(out).not.toHaveProperty('userId');
    expect(out).not.toHaveProperty('ip');
    expect(out).not.toHaveProperty('submittedData');
  });

  it('null-fills missing allowed columns (present, not omitted)', () => {
    const out = serializeRecord(
      'resources',
      { id: 1 },
      { enabledPersonalFields: [] },
      { fieldTypes }
    );
    expect(out).toHaveProperty('status', null);
    expect(out).toHaveProperty('budget', null);
    expect(out).toHaveProperty('location', null);
  });

  it('coerces per introspected type (date → ISO, decimal → number, json → string)', () => {
    const out = serializeRecord(
      'resources',
      {
        id: 1,
        createdAt: new Date('2026-07-01T14:30:00Z'),
        budget: '250.00',
        location: { lat: 52 },
      },
      { enabledPersonalFields: [] },
      { fieldTypes }
    );
    expect(out.createdAt).toBe('2026-07-01T14:30:00.000Z');
    expect(out.budget).toBe(250);
    expect(out.location).toBe('{"lat":52}');
  });

  it('nested user: always present with allowed sub-keys, null when absent', () => {
    const scope = {
      enabledPersonalFields: ['user.displayName', 'user.nickName'],
    };
    const withUser = serializeRecord(
      'resources',
      { id: 1, user: { displayName: 'Ann', nickName: null } },
      scope,
      { fieldTypes }
    );
    expect(withUser.user).toEqual({ displayName: 'Ann', nickName: null });

    const noUser = serializeRecord('resources', { id: 1 }, scope, {
      fieldTypes,
    });
    expect(noUser.user).toEqual({ displayName: null, nickName: null });
  });
});
