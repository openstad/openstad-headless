import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../../db');
const useReqUser = require('./use-req-user');

function buildUser() {
  return db.User.build({
    id: 2,
    projectId: 1,
    role: 'member',
    name: 'Doelwit',
    email: 'doelwit@example.com',
  });
}

const admin = { id: 1, role: 'admin' };

function run(user, results) {
  useReqUser({ user, results }, {}, () => {});
}

describe('useReqUser', () => {
  it('does not write the user onto the shared model auth object', () => {
    run(admin, buildUser());

    expect(db.User.prototype.auth.user).toBeUndefined();
  });

  it('keeps one request from widening another request serialization', () => {
    const before = buildUser().toJSON();
    run(admin, buildUser());
    const after = buildUser().toJSON();

    expect(after).toEqual(before);
    expect(after.email).toBeUndefined();
    expect(after.role).toBe('anonymous');
  });

  it('still authorizes the instance it was given', () => {
    const target = buildUser();
    run(admin, target);

    expect(target.toJSON().email).toBe('doelwit@example.com');
  });

  it('handles a list of results', () => {
    const results = [buildUser(), buildUser()];
    run(admin, results);

    expect(results.every((r) => r.auth.user === admin)).toBe(true);
    expect(db.User.prototype.auth.user).toBeUndefined();
  });

  it('preserves the model auth config it copies', () => {
    const target = buildUser();
    run(admin, target);

    expect(target.auth.updateableBy).toEqual(
      db.User.prototype.auth.updateableBy
    );
  });
});
