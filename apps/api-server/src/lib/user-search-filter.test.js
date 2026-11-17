import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The model layer pulls in db + config at require time, so point node-config at
// the api-server config dir before importing anything.
process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const { Op } = require('sequelize');
const { applyUserSearchFilter } = require('./user-search-filter');

const TABLE = db.User.getTableName();

function selectQueryFor(where, userId, userRole) {
  const Scoped = db.User.scope({
    method: ['onlyListable', userId, userRole],
  });
  const options = { where, attributes: ['id'] };
  Scoped._injectScope(options);
  return db.sequelize
    .getQueryInterface()
    .queryGenerator.selectQuery(TABLE, options, Scoped);
}

function searchQueryFor(userId, userRole) {
  return selectQueryFor(
    applyUserSearchFilter({ projectId: 3 }, 'a'),
    userId,
    userRole
  );
}

describe('applyUserSearchFilter', () => {
  it('nests the search clause under Op.and so it cannot collide with a scope', () => {
    const where = applyUserSearchFilter({ projectId: 3 }, 'a');

    expect(where[Op.or]).toBeUndefined();
    expect(where[Op.and]).toHaveLength(1);
    expect(where[Op.and][0][Op.or]).toHaveLength(3);
  });

  it('keeps clauses that were already registered under Op.and', () => {
    const existing = { role: 'member' };
    const where = applyUserSearchFilter({ [Op.and]: [existing] }, 'a');

    expect(where[Op.and]).toHaveLength(2);
    expect(where[Op.and][0]).toBe(existing);
  });

  it('leaves the where untouched when there is no search term', () => {
    expect(applyUserSearchFilter({ projectId: 3 }, '')[Op.and]).toBeUndefined();
    expect(
      applyUserSearchFilter({ projectId: 3 }, undefined)[Op.and]
    ).toBeUndefined();
    expect(
      applyUserSearchFilter({ projectId: 3 }, '   ')[Op.and]
    ).toBeUndefined();
  });

  it('escapes LIKE wildcards in the search term', () => {
    const where = applyUserSearchFilter({}, '50%_x');
    const nameClause = where[Op.and][0][Op.or][0];

    expect(nameClause.name[Op.like]).toBe('%50\\%\\_x%');
  });
});

describe('applyUserSearchFilter against the real onlyListable scope', () => {
  it('keeps the listability restriction next to the search clause', () => {
    const sql = searchQueryFor(null, 'anonymous');

    expect(sql).toContain("`listableByRole` IN ('anonymous', 'all')");
    expect(sql).toContain("`name` LIKE '%a%'");
    expect(sql).toContain('`projectId` = 3');
  });

  it.each([
    ['anonymous', "'anonymous', 'all'"],
    ['member', "'member', 'anonymous', 'all'"],
    ['moderator', "'moderator', 'member', 'anonymous', 'all'"],
    ['editor', "'editor', 'moderator', 'member', 'anonymous', 'all'"],
    ['admin', "'admin', 'editor', 'moderator', 'member', 'anonymous', 'all'"],
  ])('restricts a %s caller to the roles they may list', (role, expected) => {
    const sql = searchQueryFor(7, role);

    expect(sql).toContain(`\`listableByRole\` IN (${expected})`);
  });

  it('falls back to the owner row and the null branch for the caller', () => {
    const sql = searchQueryFor(7, 'member');

    expect(sql).toContain('`id` = 7');
    expect(sql).toContain(
      "`listableByRole` IS NULL AND 'moderator' IN ('member', 'anonymous', 'all')"
    );
  });
});
