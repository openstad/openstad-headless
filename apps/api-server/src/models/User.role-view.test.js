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

// Build a User instance whose serializer runs with a given viewer attached.
function adminAuthoredUser(viewer) {
  const u = db.User.build({ id: 93, projectId: 1, role: 'admin' });
  u.auth = Object.create(db.User.auth);
  u.auth.user = viewer;
  return u;
}

const viewer = (role, id, identifier) => ({
  role,
  id,
  idpUser: identifier ? { identifier, provider: 'openstad' } : undefined,
});

describe('User role visibility on view', () => {
  it('masks role to "anonymous" for an unauthenticated viewer', () => {
    expect(adminAuthoredUser(viewer('anonymous', null)).toJSON().role).toBe(
      'anonymous'
    );
  });

  it('masks role for a regular member viewing someone else', () => {
    expect(adminAuthoredUser(viewer('member', 7)).toJSON().role).toBe(
      'anonymous'
    );
  });

  it('shows the real role to a moderator', () => {
    expect(adminAuthoredUser(viewer('moderator', 8)).toJSON().role).toBe(
      'admin'
    );
  });

  it('shows the real role to an admin/superuser (covers the fixed-token caller)', () => {
    expect(adminAuthoredUser(viewer('admin', 1)).toJSON().role).toBe('admin');
    expect(adminAuthoredUser(viewer('superuser', 1)).toJSON().role).toBe(
      'admin'
    );
  });

  it('shows their own role to the user themselves', () => {
    expect(adminAuthoredUser(viewer('admin', 93)).toJSON().role).toBe('admin');
  });

  it('shows the real role to the same person via idp identity on another project', () => {
    const u = adminAuthoredUser(viewer('member', 500, 'idp-93'));
    u.idpUser = { identifier: 'idp-93', provider: 'openstad' };
    expect(u.toJSON().role).toBe('admin');
  });
});
