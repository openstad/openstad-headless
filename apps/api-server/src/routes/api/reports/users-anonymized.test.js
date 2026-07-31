import { beforeAll, describe, expect, it } from 'vitest';

const {
  toParticipantRow,
  toIsoOrNull,
  EXCLUDED_ROLES,
} = require('./users-anonymized');

beforeAll(() => {
  process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET = 'test-secret';
});

describe('toIsoOrNull', () => {
  it('converts a Date to an ISO string', () => {
    expect(toIsoOrNull(new Date('2026-01-01T00:00:00Z'))).toBe(
      '2026-01-01T00:00:00.000Z'
    );
  });
  it('null/undefined/invalid → null', () => {
    expect(toIsoOrNull(null)).toBeNull();
    expect(toIsoOrNull(undefined)).toBeNull();
    expect(toIsoOrNull('not a date')).toBeNull();
  });
});

describe('EXCLUDED_ROLES', () => {
  it('keeps staff out of the roster — a unique role would single someone out', () => {
    for (const role of ['admin', 'editor', 'moderator']) {
      expect(EXCLUDED_ROLES).toContain(role);
    }
  });

  it('still excludes the placeholder roles', () => {
    expect(EXCLUDED_ROLES).toContain('anonymous');
    expect(EXCLUDED_ROLES).toContain('unknown');
  });

  it('keeps real participants in', () => {
    expect(EXCLUDED_ROLES).not.toContain('member');
  });
});

describe('toParticipantRow', () => {
  it('maps a User row to a flat, pseudonymized participant row', () => {
    const row = {
      id: 5,
      role: 'member',
      projectId: 2,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      lastLogin: new Date('2026-02-01T00:00:00Z'),
    };
    const out = toParticipantRow(row);

    expect(out).toEqual({
      participantId: expect.any(String),
      role: 'member',
      projectId: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLogin: '2026-02-01T00:00:00.000Z',
    });
    // Never the raw id.
    expect(out.participantId).not.toBe(5);
    expect(out.participantId).not.toBe('5');
  });

  it('is a flat object of primitives only (must pass the aggregate/shape screen)', () => {
    const out = toParticipantRow({
      id: 5,
      role: 'member',
      projectId: 2,
      createdAt: null,
      lastLogin: null,
    });
    for (const value of Object.values(out)) {
      expect(
        ['string', 'number', 'boolean'].includes(typeof value) || value === null
      ).toBe(true);
    }
  });

  it('the same raw id in the same project always produces the same pseudonym (stable/joinable within a project)', () => {
    const a = toParticipantRow({ id: 42, role: 'member', projectId: 2 });
    const b = toParticipantRow({ id: 42, role: 'admin', projectId: 2 });
    expect(a.participantId).toBe(b.participantId);
  });

  it('the same raw id in a different project produces a different pseudonym (not joinable across projects)', () => {
    const a = toParticipantRow({ id: 42, role: 'member', projectId: 2 });
    const b = toParticipantRow({ id: 42, role: 'member', projectId: 3 });
    expect(a.participantId).not.toBe(b.participantId);
  });

  it('a different raw id produces a different pseudonym', () => {
    const a = toParticipantRow({ id: 1, role: 'member', projectId: 2 });
    const b = toParticipantRow({ id: 2, role: 'member', projectId: 2 });
    expect(a.participantId).not.toBe(b.participantId);
  });
});
