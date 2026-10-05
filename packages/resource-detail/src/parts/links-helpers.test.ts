import { describe, expect, it } from 'vitest';

import {
  type ResourceLink,
  buildItemLink,
  consentLabelParts,
  consentLabelPlain,
  contactConsent,
  contactTextDefaults,
  externalIdsBySource,
  filterByTags,
  relatedTagOptions,
  toRelatedItems,
  validateContact,
  withoutLinked,
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
        tags: [{ id: '10', name: '', type: undefined }],
      },
      {
        key: 'openstad:9',
        source: 'openstad',
        id: '9',
        title: 'De Binnentuin',
        summary: undefined,
        image: undefined,
        url: '/inzending/9',
        tags: [{ id: '20', name: '', type: undefined }],
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

describe('related tag filter', () => {
  const tagged = toRelatedItems(
    [
      {
        id: 1,
        direction: 'outgoing',
        source: 'openstad',
        targetId: '2',
        resource: {
          id: 2,
          title: 'Arno',
          tags: [
            { id: 10, name: 'Stadmaker', type: 'soort' },
            { id: 30, name: 'Noord', type: 'gebied' },
          ],
        },
      },
      {
        id: 2,
        direction: 'outgoing',
        source: 'openstad',
        targetId: '3',
        resource: {
          id: 3,
          title: 'Binnentuin',
          tags: [
            { id: 11, name: 'Initiatief', type: 'soort' },
            { id: 30, name: 'Noord', type: 'gebied' },
          ],
        },
      },
      {
        id: 3,
        direction: 'outgoing',
        source: 'openstad',
        targetId: '4',
        resource: { id: 4, title: 'Zonder tag', tags: [{ id: 12 }] },
      },
    ],
    {}
  );

  it('lists each named tag once, sorted by name', () => {
    expect(relatedTagOptions(tagged).map((tag) => tag.name)).toEqual([
      'Initiatief',
      'Noord',
      'Stadmaker',
    ]);
  });

  it('limits the tags to the chosen types', () => {
    expect(relatedTagOptions(tagged, 'soort').map((tag) => tag.id)).toEqual([
      '11',
      '10',
    ]);
  });

  it('keeps the items with at least one selected tag', () => {
    expect(filterByTags(tagged, []).map((item) => item.id)).toEqual([
      '2',
      '3',
      '4',
    ]);
    expect(filterByTags(tagged, ['10', '11']).map((item) => item.id)).toEqual([
      '2',
      '3',
    ]);
    expect(filterByTags(tagged, ['30']).map((item) => item.id)).toEqual([
      '2',
      '3',
    ]);
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

describe('withoutLinked', () => {
  it('leaves out own submissions that are already linked in either direction', () => {
    const options = [
      { id: '10', label: 'Gekoppeld uitgaand' },
      { id: '11', label: 'Gekoppeld inkomend' },
      { id: '12', label: 'Nog niet gekoppeld' },
    ];
    const linked: ResourceLink[] = [
      {
        id: 1,
        direction: 'outgoing',
        source: 'openstad',
        targetId: '10',
        resource: { id: 10, title: 'A' },
      },
      {
        id: 2,
        direction: 'incoming',
        source: 'openstad',
        targetId: '99',
        resource: { id: 11, title: 'B' },
      },
      { id: 3, direction: 'outgoing', source: 'metkoos', targetId: '12' },
    ];

    expect(withoutLinked(options, linked).map((option) => option.id)).toEqual([
      '12',
    ]);
  });
});

describe('consentLabelParts', () => {
  const url = 'https://example.nl/privacy';

  it('puts the link at the {link} placeholder', () => {
    expect(
      consentLabelParts('Ik ga akkoord met de {link} van de gemeente', url)
    ).toEqual({
      before: 'Ik ga akkoord met de ',
      linkText: 'privacyverklaring',
      after: ' van de gemeente',
    });
  });

  it('turns the word privacyverklaring into the link without a placeholder', () => {
    expect(
      consentLabelParts('Ik ga akkoord met de Privacyverklaring', url)
    ).toEqual({
      before: 'Ik ga akkoord met de ',
      linkText: 'Privacyverklaring',
      after: '',
    });
  });

  it('gives no link without a valid url or without a place for the link', () => {
    expect(consentLabelParts('Ik ga akkoord met de {link}', '')).toBeNull();
    expect(
      consentLabelParts('Ik ga akkoord met de {link}', 'javascript:alert(1)')
    ).toBeNull();
    expect(consentLabelParts('Ik ga akkoord', url)).toBeNull();
  });

  it('shows the placeholder as plain text when there is no link', () => {
    expect(consentLabelPlain('Ik ga akkoord met de {link}')).toBe(
      'Ik ga akkoord met de privacyverklaring'
    );
  });

  it('uses the link text of the authentication settings', () => {
    expect(
      consentLabelParts('Ik ga akkoord met het {link}', url, 'Privacybeleid')
    ).toEqual({
      before: 'Ik ga akkoord met het ',
      linkText: 'privacybeleid',
      after: '',
    });
    expect(
      consentLabelParts('Lees ons privacybeleid', url, 'privacybeleid')
    ).toEqual({ before: 'Lees ons ', linkText: 'privacybeleid', after: '' });
    expect(
      consentLabelParts('Volgens de privacyverklaring', url, 'privacybeleid')
    ).toEqual({
      before: 'Volgens de ',
      linkText: 'privacyverklaring',
      after: '',
    });
  });
});

describe('contactConsent', () => {
  const privacyConsent = {
    url: 'https://gemeente.nl/privacy',
    linkText: 'privacybeleid',
    label: 'Ik ga akkoord met het {link}',
  };

  it('uses the label and link of the authentication settings for a request', () => {
    expect(contactConsent({ handler: 'linkRequest', privacyConsent })).toEqual({
      label: 'Ik ga akkoord met het {link}',
      url: 'https://gemeente.nl/privacy',
      linkText: 'privacybeleid',
    });
  });

  it('keeps the e-mail consent sentence for a contact message', () => {
    expect(contactConsent({ privacyConsent })).toEqual({
      label: contactTextDefaults().consentLabel,
      url: 'https://gemeente.nl/privacy',
      linkText: 'privacybeleid',
    });
  });

  it('lets the widget settings win', () => {
    expect(
      contactConsent({
        handler: 'linkRequest',
        consentLabel: 'Eigen tekst met {link}',
        privacyUrl: 'https://eigen.nl/privacy',
        privacyConsent,
      })
    ).toEqual({
      label: 'Eigen tekst met {link}',
      url: 'https://eigen.nl/privacy',
      linkText: undefined,
    });
  });

  it('falls back to the default label without authentication settings', () => {
    expect(contactConsent({ handler: 'linkRequest' })).toEqual({
      label: contactTextDefaults('linkRequest').consentLabel,
      url: undefined,
      linkText: undefined,
    });
  });
});
