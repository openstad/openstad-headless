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

describe('Comment.isStaffMember', () => {
  it('is true for an admin author', () => {
    expect(comment('admin').isStaffMember).toBe(true);
  });

  it('is true for an editor author', () => {
    expect(comment('editor').isStaffMember).toBe(true);
  });

  it('is false for a moderator author (moderator is not badged today)', () => {
    expect(comment('moderator').isStaffMember).toBe(false);
  });

  it('is false for a regular member author', () => {
    expect(comment('member').isStaffMember).toBe(false);
  });

  it('is false when no author association is loaded', () => {
    expect(db.Comment.build({ id: 1 }).isStaffMember).toBe(false);
  });

  it('is included in the forced reply attributes of includeRepliesOnComments', () => {
    const scope = db.Comment.options.scopes.includeRepliesOnComments(undefined);
    expect(scope.include[0].attributes).toContain('isStaffMember');
  });
});
