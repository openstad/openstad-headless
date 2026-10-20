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
const {
  consentingUserIds,
  ownerAllowsContact,
  requiresContactConsent,
} = require('./contact-consent');

const projectWithConsent = {
  id: 1,
  config: {
    auth: {
      provider: {
        openstad: { requiredUserFields: ['name', 'emailNotificationConsent'] },
      },
    },
  },
};
const projectWithoutConsent = {
  id: 1,
  config: {
    auth: { provider: { openstad: { requiredUserFields: ['name'] } } },
  },
};

const owners = {
  1: { id: 1, emailNotificationConsent: true },
  2: { id: 2, emailNotificationConsent: false },
  3: { id: 3, emailNotificationConsent: null },
};
db.User.findByPk = async (id) => owners[id] || null;

describe('requiresContactConsent', () => {
  it('is on when the consent field is a required user field', () => {
    expect(requiresContactConsent(projectWithConsent)).toBe(true);
  });

  it.each([projectWithoutConsent, { id: 1, config: {} }, { id: 1 }, null])(
    'is off when the consent field is not required (%j)',
    (project) => {
      expect(requiresContactConsent(project)).toBe(false);
    }
  );
});

describe('ownerAllowsContact', () => {
  it('allows every owner when the project does not ask for consent', async () => {
    await expect(
      ownerAllowsContact(projectWithoutConsent, { userId: 2 })
    ).resolves.toBe(true);
  });

  it('allows an owner who gave consent', async () => {
    await expect(
      ownerAllowsContact(projectWithConsent, { userId: 1 })
    ).resolves.toBe(true);
  });

  it.each([
    ['refused consent', 2],
    ['never answered', 3],
    ['an unknown owner', 99],
  ])('refuses an owner with %s', async (_label, userId) => {
    await expect(
      ownerAllowsContact(projectWithConsent, { userId })
    ).resolves.toBe(false);
  });

  it('refuses a submission without owner', async () => {
    await expect(
      ownerAllowsContact(projectWithConsent, { userId: null })
    ).resolves.toBe(false);
  });
});

describe('consentingUserIds', () => {
  it('returns the ids of users in the project who gave consent', async () => {
    const queries = [];
    db.User.findAll = async (query) => {
      queries.push(query);
      return [{ id: 1 }, { id: 4 }];
    };

    await expect(consentingUserIds(projectWithConsent)).resolves.toEqual([
      1, 4,
    ]);
    expect(queries[0]).toEqual({
      where: { projectId: 1, emailNotificationConsent: true },
      attributes: ['id'],
    });
  });
});
