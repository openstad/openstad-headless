import { describe, expect, it } from 'vitest';

import {
  type ResourceLink,
  buildItemLink,
  contactTextDefaults,
  externalIdsBySource,
  toRelatedItems,
  validateContact,
} from './links-helpers';

const links: ResourceLink[] = [
  {
    id: 1,
    direction: 'outgoing',
    source: 'openstad',
    targetId: '2',
    resource: {
      id: 2,
      title: 'Arno Segeren',
      summary: 'Stadmaker',
      images: [{ url: 'https://img/2' }],
      tags: [{ id: 10 }],
    },
  },
  {
    id: 2,
    direction: 'incoming',
    source: 'openstad',
    targetId: '5',
    resource: { id: 9, title: 'De Binnentuin', tags: [{ id: 20 }] },
  },
  { id: 3, direction: 'outgoing', source: 'metkoos', targetId: 'k1' },
];

describe('buildItemLink', () => {
  it('replaces the id placeholder', () => {
    expect(buildItemLink('/stadmakers/[id]', '2')).toBe('/stadmakers/2');
  });

  it('returns nothing without placeholder', () => {
    expect(buildItemLink('/stadmakers', '2')).toBeUndefined();
    expect(buildItemLink(undefined, '2')).toBeUndefined();
  });
});

describe('externalIdsBySource', () => {
  it('collects external targets per source', () => {
    expect(externalIdsBySource(links)).toEqual({ metkoos: ['k1'] });
  });
});

describe('toRelatedItems', () => {
  it('maps both directions and external items', () => {
    const items = toRelatedItems(links, {
      itemLink: '/inzending/[id]',
      externalItems: {
        'metkoos:k1': {
          id: 'k1',
          label: 'Kunstlessen',
          url: 'https://koos/k1',
        },
      },
    });

    expect(items).toEqual([
      {
        key: 'openstad:2',
        source: 'openstad',
        id: '2',
        title: 'Arno Segeren',
        summary: 'Stadmaker',
        image: 'https://img/2',
        url: '/inzending/2',
      },
      {
        key: 'openstad:9',
        source: 'openstad',
        id: '9',
        title: 'De Binnentuin',
        summary: undefined,
        image: undefined,
        url: '/inzending/9',
      },
      {
        key: 'metkoos:k1',
        source: 'metkoos',
        id: 'k1',
        title: 'Kunstlessen',
        image: undefined,
        url: 'https://koos/k1',
      },
    ]);
  });

  it('filters OpenStad resources by tag', () => {
    const items = toRelatedItems(links, { tagIds: '10' });
    expect(items.map((item) => item.key)).toEqual(['openstad:2']);
  });

  it('drops external urls that are not http or https', () => {
    const items = toRelatedItems([links[2]], {
      externalItems: {
        'metkoos:k1': {
          id: 'k1',
          label: 'Kunstlessen',
          url: 'javascript:alert(1)',
        },
      },
    });
    expect(items[0].url).toBeUndefined();
  });

  it('leaves out external links whose item could not be loaded', () => {
    expect(toRelatedItems([links[2]], {}).map((item) => item.key)).toEqual([]);
  });
});

describe('validateContact', () => {
  const base = {
    isDefaultHandler: true,
    showMessage: true,
    showConsent: true,
    showOwnResource: false,
    message: 'Hallo',
    consent: true,
    ownResourceId: '',
    messageRequiredText: 'bericht',
    consentRequiredText: 'toestemming',
    ownResourceRequiredText: 'inzending',
  };

  it('accepts a complete default contact message', () => {
    expect(validateContact(base)).toBeNull();
  });

  it('requires a message for the default handler', () => {
    expect(validateContact({ ...base, message: ' ' })).toBe('bericht');
  });

  it('allows an empty message for a plugin handler', () => {
    expect(
      validateContact({ ...base, isDefaultHandler: false, message: '' })
    ).toBeNull();
  });

  it('requires consent when the consent field is shown', () => {
    expect(validateContact({ ...base, consent: false })).toBe('toestemming');
  });

  it('requires an own submission when the picker is shown', () => {
    expect(validateContact({ ...base, showOwnResource: true })).toBe(
      'inzending'
    );
  });
});

describe('contactTextDefaults', () => {
  it('mentions the e-mail address for the built-in contact form', () => {
    const defaults = contactTextDefaults('');
    expect(defaults.popupDescription).toContain('e-mailadres');
    expect(defaults.consentLabel).toContain('e-mailadres');
  });

  it('does not promise to share the e-mail address for a plugin handler', () => {
    const defaults = contactTextDefaults('link-request');
    expect(Object.values(defaults).join(' ')).not.toMatch(/e-mail/);
  });
});
