import { describe, expect, it } from 'vitest';

const { resolveSitePrefix } = require('./resolve-site-prefix');

describe('resolveSitePrefix', () => {
  const projects = {
    'example.com/site-a': { id: 1, name: 'site-a' },
    'example.com/site-b': { id: 2, name: 'site-b' },
  };

  it('returns the matching subdirectory site for a known prefix', () => {
    const site = resolveSitePrefix({
      projects,
      openstadDomain: 'example.com',
      sitePrefix: 'site-b',
      alreadyResolved: false,
    });

    expect(site).toBe(projects['example.com/site-b']);
  });

  it('returns null when a prefix was already resolved on a previous routing pass', () => {
    const site = resolveSitePrefix({
      projects,
      openstadDomain: 'example.com',
      sitePrefix: 'site-a',
      alreadyResolved: true,
    });

    expect(site).toBeNull();
  });

  it('returns null when no project matches the prefix', () => {
    const site = resolveSitePrefix({
      projects,
      openstadDomain: 'example.com',
      sitePrefix: 'nonexistent',
      alreadyResolved: false,
    });

    expect(site).toBeNull();
  });

  it('returns null when required inputs are missing', () => {
    expect(
      resolveSitePrefix({
        projects,
        openstadDomain: 'example.com',
        sitePrefix: '',
        alreadyResolved: false,
      })
    ).toBeNull();

    expect(
      resolveSitePrefix({
        projects: undefined,
        openstadDomain: 'example.com',
        sitePrefix: 'site-a',
        alreadyResolved: false,
      })
    ).toBeNull();
  });
});
