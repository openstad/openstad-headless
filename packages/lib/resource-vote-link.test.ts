import { describe, expect, it } from 'vitest';

import {
  buildResourceVoteLink,
  getResourceIdFromVoteLink,
} from './resource-vote-link';

describe('buildResourceVoteLink', () => {
  it('voegt openstadResourceId toe aan de stempagina', () => {
    expect(buildResourceVoteLink('https://openstad.org/stemmen', 12)).toBe(
      'https://openstad.org/stemmen?openstadResourceId=12'
    );
  });

  it('behoudt bestaande queryparameters en de hash', () => {
    expect(
      buildResourceVoteLink('https://openstad.org/stemmen?tagIds=3#stem', '7')
    ).toBe('https://openstad.org/stemmen?tagIds=3&openstadResourceId=7#stem');
  });

  it('vervangt een openstadResourceId die al in de link stond', () => {
    expect(
      buildResourceVoteLink(
        'https://openstad.org/stemmen?openstadResourceId=1',
        2
      )
    ).toBe('https://openstad.org/stemmen?openstadResourceId=2');
  });

  it('maakt van een domein zonder protocol een https-link', () => {
    expect(buildResourceVoteLink('  www.openstad.org/stemmen ', 5)).toBe(
      'https://www.openstad.org/stemmen?openstadResourceId=5'
    );
  });

  it('houdt een relatieve link relatief', () => {
    expect(buildResourceVoteLink('/stemmen', 5)).toBe(
      '/stemmen?openstadResourceId=5'
    );
  });

  it('geeft niets terug bij een lege of onveilige link', () => {
    expect(buildResourceVoteLink('', 5)).toBe('');
    expect(buildResourceVoteLink(undefined, 5)).toBe('');
    expect(buildResourceVoteLink('javascript:alert(1)', 5)).toBe('');
    expect(buildResourceVoteLink('mailto:info@openstad.org', 5)).toBe('');
  });

  it('geeft niets terug bij een ongeldig inzending-id', () => {
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
  it('leest het inzending-id uit de querystring', () => {
    expect(getResourceIdFromVoteLink('?openstadResourceId=42')).toBe(42);
    expect(getResourceIdFromVoteLink('?a=1&openstadResourceId=42&b=2')).toBe(
      42
    );
  });

  it('negeert ontbrekende of ongeldige waarden', () => {
    expect(getResourceIdFromVoteLink('')).toBeNull();
    expect(getResourceIdFromVoteLink(undefined)).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=abc')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=0')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=-3')).toBeNull();
    expect(getResourceIdFromVoteLink('?openstadResourceId=4.2')).toBeNull();
  });
});
