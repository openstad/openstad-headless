import { describe, expect, it } from 'vitest';

import { EDITOR_PUBLIC_EXTRA_DATA_KEY_AUTH } from '../../../models/lib/filter-public-extra-data.js';
import getExtraDataConfig from './getExtraDataConfig.js';

// Mirrors how Resource.js wires extraData: the resource model itself allows
// the owner to update, so without per-key auth every extraData key is
// writable by the owner.
function makeResource(extraDataConfig, userId = 42) {
  return {
    userId,
    rawAttributes: { extraData: extraDataConfig },
    auth: {
      createableBy: 'member',
      updateableBy: ['editor', 'owner'],
    },
    toString: () => '[object SequelizeInstance:resource]',
  };
}

const project = { config: {} };
const owner = { id: 42, role: 'member' };
const editor = { id: 1, role: 'editor' };

describe('getExtraDataConfig authorizeData with per-key auth', () => {
  const config = getExtraDataConfig(
    'JSON',
    'resources',
    EDITOR_PUBLIC_EXTRA_DATA_KEY_AUTH
  );
  const authorize = (data, action, user) =>
    config.auth.authorizeData(
      data,
      action,
      user,
      makeResource(config),
      project
    );

  it('drops partnerLogo when the resource owner updates it', () => {
    const result = authorize(
      { partnerLogo: 'https://evil.example/x.png', foo: 'bar' },
      'update',
      owner
    );
    expect(result).toEqual({ foo: 'bar' });
  });

  it('drops partnerLogo when a member creates a resource with it', () => {
    const result = authorize(
      { partnerLogo: 'https://evil.example/x.png' },
      'create',
      owner
    );
    expect(result).toEqual({});
  });

  it('lets an editor write partnerLogo', () => {
    const data = { partnerLogo: 'https://example.org/logo.png' };
    expect(authorize({ ...data }, 'update', editor)).toEqual(data);
    expect(authorize({ ...data }, 'create', editor)).toEqual(data);
  });

  it('keeps partnerLogo viewable for everyone', () => {
    const data = { partnerLogo: 'https://example.org/logo.png' };
    expect(authorize({ ...data }, 'view', { role: 'anonymous' })).toEqual(data);
  });

  it('lets project config per-key auth override the default', () => {
    const configured = {
      config: {
        resources: {
          extraData: { partnerLogo: { auth: { updateableBy: 'owner' } } },
        },
      },
    };
    const result = config.auth.authorizeData(
      { partnerLogo: 'x' },
      'update',
      owner,
      makeResource(config),
      configured
    );
    expect(result).toEqual({ partnerLogo: 'x' });
  });

  it('leaves models without per-key auth unchanged', () => {
    const plain = getExtraDataConfig('JSON', 'resources');
    const result = plain.auth.authorizeData(
      { partnerLogo: 'x' },
      'update',
      owner,
      makeResource(plain),
      project
    );
    expect(result).toEqual({ partnerLogo: 'x' });
  });
});
