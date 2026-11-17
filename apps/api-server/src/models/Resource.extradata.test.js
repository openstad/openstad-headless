import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');

// Drive the model hook directly: the full extraData path needs a loaded project.
const stripFor = (user) => {
  const self = db.Resource.build({ id: 42, projectId: 1, title: 'Titel' });
  self.hasResourceFormConfig = false;
  self.resourceFormFieldKeys = [];
  self.moderatorOnlyExtraDataKeys = ['secret'];

  const data = {
    id: 42,
    title: 'Titel',
    // originalId is in alwaysPublicExtraDataKeys, secret is not.
    extraData: { originalId: 7, secret: 'geheim' },
  };

  return db.Resource.prototype.auth.toAuthorizedJSON(user, data, self);
};

describe('Resource extraData stripping', () => {
  it('strips protected keys for an anonymous viewer', () => {
    expect(
      stripFor({ role: 'anonymous', id: null }).extraData.secret
    ).toBeUndefined();
  });

  it('strips protected keys when the viewer is unknown', () => {
    // No user falls back to {role:'all'}, which used to skip the strip.
    expect(stripFor({ role: 'all' }).extraData.secret).toBeUndefined();
  });

  it('does not leak more to an unknown viewer than to an anonymous one', () => {
    const anonymous = Object.keys(
      stripFor({ role: 'anonymous', id: null }).extraData
    );
    const unknown = Object.keys(stripFor({ role: 'all' }).extraData);

    expect(unknown.sort()).toEqual(anonymous.sort());
  });

  it('keeps always-public keys', () => {
    expect(stripFor({ role: 'all' }).extraData.originalId).toBe(7);
  });

  it('still gives a moderator the protected keys', () => {
    expect(stripFor({ role: 'moderator', id: 7 }).extraData.secret).toBe(
      'geheim'
    );
  });
});
