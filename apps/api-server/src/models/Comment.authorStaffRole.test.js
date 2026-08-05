import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The model is plain CommonJS and pulls in config at require time.
process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');

function comment(authorRole) {
  const c = db.Comment.build({ id: 1 });
  // association value used by the getter (real role, pre-serialization)
  c.user = db.User.build({ id: 5, projectId: 1, role: authorRole });
  return c;
}

describe('Comment.authorStaffRole', () => {
  it('is "admin" for an admin author', () => {
    expect(comment('admin').authorStaffRole).toBe('admin');
  });

  it('is "editor" for an editor author', () => {
    expect(comment('editor').authorStaffRole).toBe('editor');
  });

  it('is null for a moderator author (moderator is not badged today)', () => {
    expect(comment('moderator').authorStaffRole).toBe(null);
  });

  it('is null for a regular member author', () => {
    expect(comment('member').authorStaffRole).toBe(null);
  });

  it('is null when no author association is loaded', () => {
    expect(db.Comment.build({ id: 1 }).authorStaffRole).toBe(null);
  });

  it('is included in the forced reply attributes of includeRepliesOnComments', () => {
    const scope = db.Comment.options.scopes.includeRepliesOnComments(undefined);
    expect(scope.include[0].attributes).toContain('authorStaffRole');
  });
});
