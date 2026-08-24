import { Op } from 'sequelize';
import { describe, expect, it } from 'vitest';

import { hideIncompleteMembersClause } from './user-list-filters.js';

describe('hideIncompleteMembersClause', () => {
  it('lets any non-member role through unconditionally', () => {
    const clause = hideIncompleteMembersClause();
    expect(clause[Op.or]).toContainEqual({ role: { [Op.ne]: 'member' } });
  });

  it('requires a member to have a non-empty name or a non-empty email', () => {
    const clause = hideIncompleteMembersClause();
    expect(clause[Op.or]).toContainEqual({
      name: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
    });
    expect(clause[Op.or]).toContainEqual({
      email: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
    });
  });

  it('is a fresh object on every call so callers can safely mutate it', () => {
    const first = hideIncompleteMembersClause();
    const second = hideIncompleteMembersClause();
    expect(first).not.toBe(second);
    expect(first[Op.or]).not.toBe(second[Op.or]);
  });
});
