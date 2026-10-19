import { describe, expect, it } from 'vitest';

import {
  buildResourceVoteLink,
  getResourceIdFromVoteLink,
} from './resource-vote-link';

describe('buildResourceVoteLink', () => {
  it('adds openstadResourceId to the vote page URL', () => {
    expect(buildResourceVoteLink('https://openstad.org/stemmen', 12)).toBe(
      'https://openstad.org/stemmen?openstadResourceId=12'
    );
  });

  it('keeps existing query parameters and the hash', () => {
    expect(
      buildResourceVoteLink('https://openstad.org/stemmen?tagIds=3#stem', '7')
    ).toBe('https://openstad.org/stemmen?tagIds=3&openstadResourceId=7#stem');
  });

  it('replaces an openstadResourceId already in the URL', () => {
    expect(
      buildResourceVoteLink(
        'https://openstad.org/stemmen?openstadResourceId=1',
        2
      )
    ).toBe('https://openstad.org/stemmen?openstadResourceId=2');
  });

  it('turns a domain without protocol into an https URL', () => {
    expect(buildResourceVoteLink('  www.openstad.org/stemmen ', 5)).toBe(
      'https://www.openstad.org/stemmen?openstadResourceId=5'
    );
  });

  it('keeps a relative URL relative', () => {
    expect(buildResourceVoteLink('/stemmen', 5)).toBe(
      '/stemmen?openstadResourceId=5'
    );
  });

  it('returns an empty string for an empty or unsafe URL', () => {
    expect(buildResourceVoteLink('', 5)).toBe('');
    expect(buildResourceVoteLink(undefined, 5)).toBe('');
    expect(buildResourceVoteLink('javascript:alert(1)', 5)).toBe('');
    expect(buildResourceVoteLink('mailto:info@openstad.org', 5)).toBe('');
  });

  it('returns an empty string for an invalid resource id', () => {
    expect(buildResourceVoteLink('https://openstad.org/stemmen', 0)).toBe('');
    expect(buildResourceVoteLink('https://openstad.org/stemmen', 'abc')).toBe(
      ''
    );
    expect(buildResourceVoteLink('https://openstad.org/stemmen', 1.5)).toBe('');
    expect(
      buildResourceVoteLink('https://openstad.org/stemmen', undefined)
    ).toBe('');
  });
});

describe('getResourceIdFromVoteLink', () => {
  it('reads the resource id from the query string', () => {
    expect(getResourceIdFromVoteLink('?openstadResourceId=42')).toBe(42);
    expect(getResourceIdFromVoteLink('?a=1&openstadResourceId=42&b=2')).toBe(
      42
    );
  });

  it('ignores missing or invalid values', () => {
    expect(getResourceIdFromVoteLink('')).toBeNull();
    expect(getResourceIdFromVoteLink(undefined)).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=abc')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=0')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=-3')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=4.2')).toBeNull();
  });
});
