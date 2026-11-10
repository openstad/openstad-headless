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

const serialize = (links, linkRequests) => {
  const self = db.Resource.build({ id: 42, projectId: 1, title: 'Titel' });
  self.hasResourceFormConfig = false;
  self.resourceFormFieldKeys = [];
  self.moderatorOnlyExtraDataKeys = [];
  if (links) self.links = links;
  if (linkRequests) self.linkRequests = linkRequests;

  return db.Resource.prototype.auth.toAuthorizedJSON(
    { role: 'anonymous', id: null },
    { id: 42, title: 'Titel' },
    self
  );
};

describe('Resource links serialization', () => {
  it('adds links that were attached to the instance', () => {
    const links = [{ id: 1, direction: 'outgoing' }];
    expect(serialize(links).links).toEqual(links);
  });

  it('adds no links key when none were attached', () => {
    expect(serialize()).not.toHaveProperty('links');
  });

  it('adds the link request result of the plugin', () => {
    expect(serialize(undefined, { received: 1 }).linkRequests).toEqual({
      received: 1,
    });
  });

  it('adds no linkRequests key without a plugin result', () => {
    expect(serialize()).not.toHaveProperty('linkRequests');
  });
});
