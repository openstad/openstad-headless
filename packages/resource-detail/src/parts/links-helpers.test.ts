import { describe, expect, it } from 'vitest';

import {
  type ResourceLink,
  buildItemLink,
  consentLabelParts,
  consentLabelPlain,
  contactConsent,
  contactFieldsShown,
  contactStatus,
  contactTextDefaults,
  effectiveContactHandler,
  filterByTags,
  relatedTagOptions,
  showContactBlock,
  showsOwnResource,
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

describe('toRelatedItems', () => {
  it('maps both directions and leaves out external links', () => {
    const items = toRelatedItems(links, {
      itemLink: '/inzending/[id]',
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
    ]);
  });

  it('links to the detail page of the tag before the widget link', () => {
    const withDetailUrl: ResourceLink[] = [
      {
        ...links[0],
        resource: { ...links[0].resource!, detailUrl: '/stadmaker/2' },
      },
      links[1],
    ];

    expect(
      toRelatedItems(withDetailUrl, { itemLink: '/inzending/[id]' }).map(
        (item) => item.url
      )
    ).toEqual(['/stadmaker/2', '/inzending/9']);
    expect(
      toRelatedItems(withDetailUrl, {
        itemLink: '/inzending/[id]',
        linkToDetail: false,
      }).map((item) => item.url)
    ).toEqual([undefined, undefined]);
  });

  it('filters OpenStad resources by tag', () => {
    const items = toRelatedItems(links, { tagIds: '10' });
    expect(items.map((item) => item.key)).toEqual(['openstad:2']);
  });

  it('never shows external links, which have their own widget', () => {
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
    ownResourceIds: [],
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
    expect(
      validateContact({
        ...base,
        showOwnResource: true,
        ownResourceIds: ['3', '4'],
      })
    ).toBeNull();
  });
});

describe('contactTextDefaults', () => {
  it('mentions the e-mail address for the built-in contact form', () => {
    const defaults = contactTextDefaults('');
    expect(defaults.popupDescription).toContain('e-mailadres');
    expect(defaults.consentLabel).toContain('e-mailadres');
  });

  it('uses the agreed default popup text for the built-in contact form', () => {
    expect(contactTextDefaults('').popupDescription).toBe(
      'Je bericht en e-mailadres worden gedeeld met de indiener.'
    );
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

describe('contactStatus', () => {
  const linked = 'De koppeling is gemaakt.';
  const sent = 'Het bericht is verstuurd.';
  const notSent = 'Er is geen nieuwe uitnodiging verstuurd.';

  it('confirms a link that was made directly', () => {
    expect(
      contactStatus({ linked: [{}], requested: [] }, linked, sent, notSent)
    ).toBe(linked);
  });

  it('mentions both a direct link and a sent request', () => {
    expect(
      contactStatus({ linked: [{}], requested: [{}] }, linked, sent, notSent)
    ).toBe(`${linked} ${sent}`);
  });

  it('falls back to the sent message', () => {
    expect(contactStatus({ requested: [{}] }, linked, sent, notSent)).toBe(
      sent
    );
    expect(contactStatus(undefined, linked, sent, notSent)).toBe(sent);
  });

  it('says nothing was sent when the request was skipped', () => {
    expect(
      contactStatus(
        { requested: [], linked: [], skipped: [{}] },
        linked,
        sent,
        notSent
      )
    ).toBe(notSent);
  });

  it('says nothing was sent when the request was invalid', () => {
    expect(
      contactStatus(
        { requested: [], linked: [], invalid: [{}] },
        linked,
        sent,
        notSent
      )
    ).toBe(notSent);
  });

  it('confirms a link when an open request the other way was accepted', () => {
    expect(
      contactStatus(
        { requested: [], linked: [], accepted: [{}] },
        linked,
        sent,
        notSent
      )
    ).toBe(linked);
  });
});

describe('showsOwnResource', () => {
  it('never shows the own submission field for a plain contact message', () => {
    expect(showsOwnResource(true, '')).toBe(false);
    expect(showsOwnResource(true, undefined)).toBe(false);
  });

  it('shows it when a plugin handler is chosen and the option is on', () => {
    expect(showsOwnResource(true, 'link-request')).toBe(true);
    expect(showsOwnResource(false, 'link-request')).toBe(false);
  });
});

describe('effectiveContactHandler', () => {
  it('keeps a handler whose plugin is loaded', () => {
    expect(effectiveContactHandler('link-request', ['link-request'])).toBe(
      'link-request'
    );
  });

  it('falls back to a contact message when the plugin is not loaded', () => {
    expect(effectiveContactHandler('link-request', [])).toBe('');
    expect(effectiveContactHandler('link-request', undefined)).toBe('');
  });

  it('keeps the contact message', () => {
    expect(effectiveContactHandler('', ['link-request'])).toBe('');
  });
});

describe('contactFieldsShown', () => {
  it('always asks for a message and consent in a contact message', () => {
    expect(contactFieldsShown('', false, false)).toEqual({
      showMessage: true,
      showConsent: true,
    });
  });

  it('follows the settings for a plugin handler', () => {
    expect(contactFieldsShown('link-request', false, true)).toEqual({
      showMessage: false,
      showConsent: true,
    });
  });
});

describe('showContactBlock', () => {
  it('shows the block to visitors when the owner may be contacted', () => {
    expect(
      showContactBlock({
        isOwner: false,
        isDefaultHandler: true,
        contactable: true,
      })
    ).toBe(true);
  });

  it.each([
    ['the owner refused contact', false],
    ['the status is still loading', null],
  ])('hides the block from visitors when %s', (_label, contactable) => {
    expect(
      showContactBlock({ isOwner: false, isDefaultHandler: false, contactable })
    ).toBe(false);
  });

  it('hides the message block from the owner', () => {
    expect(
      showContactBlock({
        isOwner: true,
        isDefaultHandler: true,
        contactable: true,
      })
    ).toBe(false);
  });

  it('keeps a plugin block for the owner whatever the consent', () => {
    expect(
      showContactBlock({
        isOwner: true,
        isDefaultHandler: false,
        contactable: false,
      })
    ).toBe(true);
  });
});
