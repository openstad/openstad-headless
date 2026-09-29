import { describe, expect, it } from 'vitest';

import {
  type LinkSelection,
  buildLinkPayload,
  buildPrefill,
  extractLinkValues,
  getLinkFields,
  itemsToFetch,
  linkRequestMessage,
  needsLinkConfirmation,
  restoreLinkValues,
  splitAddedLinks,
} from './link-selection';

const stadmakerField = {
  fieldKey: 'stadmakers',
  linkSource: 'openstad',
  linkTags: '10',
};
const initiatiefField = {
  fieldKey: 'initiatieven',
  linkSource: 'openstad',
  linkTags: '20',
};
const koosField = { fieldKey: 'activiteiten', linkSource: 'metkoos' };

const arno = { source: 'openstad', id: '2', label: 'Arno Segeren' };
const lena = { source: 'openstad', id: '3', label: 'Lena van der Wal' };

describe('getLinkFields', () => {
  it('returns only resource link questions', () => {
    expect(
      getLinkFields([
        { type: 'text', fieldKey: 'title' },
        {
          type: 'resourceLink',
          fieldKey: 'stadmakers',
          linkSource: 'openstad',
          linkTags: '10',
        },
      ])
    ).toEqual([stadmakerField]);
  });
});

describe('extractLinkValues', () => {
  it('moves link fields out of the form data', () => {
    const { formData, valuesByField } = extractLinkValues(
      { title: 'Binnenplaats', stadmakers: [arno] },
      [stadmakerField, koosField]
    );
    expect(formData).toEqual({ title: 'Binnenplaats' });
    expect(valuesByField).toEqual({ stadmakers: [arno], activiteiten: [] });
  });
});

describe('buildLinkPayload', () => {
  it('sends the whole selection with messages for new items', () => {
    const payload = buildLinkPayload(
      { stadmakers: [arno, lena] },
      { stadmakers: [arno] },
      { 'openstad:3': ' Wil je meedoen? ', 'openstad:2': 'genegeerd' }
    );

    expect(payload.links).toEqual([
      { source: 'openstad', id: '2', message: 'genegeerd' },
      { source: 'openstad', id: '3', message: 'Wil je meedoen?' },
    ]);
    expect(payload.added).toEqual([lena]);
    expect(payload.removed).toEqual([]);
    expect(payload.removedLinks).toEqual([]);
  });

  it('reports removed prefilled items', () => {
    const payload = buildLinkPayload(
      { stadmakers: [] },
      { stadmakers: [arno] }
    );
    expect(payload.removed).toEqual([arno]);
    expect(payload.removedLinks).toEqual([{ source: 'openstad', id: '2' }]);
    expect(payload.links).toEqual([]);
  });

  it('does not count an item as removed when it moved to another field', () => {
    const payload = buildLinkPayload(
      { stadmakers: [], initiatieven: [arno] },
      { stadmakers: [arno] }
    );
    expect(payload.removed).toEqual([]);
    expect(payload.added).toEqual([]);
  });
});

const selection: LinkSelection = {
  links: [
    {
      source: 'openstad',
      targetId: '2',
      direction: 'outgoing',
      resource: {
        id: 2,
        title: 'Arno Segeren',
        images: [{ url: 'https://img/2' }],
        tags: [{ id: 10 }],
      },
    },
    {
      source: 'openstad',
      targetId: '1',
      direction: 'incoming',
      resource: { id: 9, title: 'De Binnentuin', tags: [{ id: 20 }] },
    },
    { source: 'metkoos', targetId: 'k1', direction: 'outgoing' },
  ],
  pending: [
    { source: 'openstad', id: '3' },
    { source: 'openstad', id: '404' },
  ],
};

describe('itemsToFetch', () => {
  it('collects external links and pending items per source', () => {
    expect(itemsToFetch(selection)).toEqual({
      metkoos: ['k1'],
      openstad: ['3', '404'],
    });
  });
});

describe('buildPrefill', () => {
  it('puts each link in the field that matches its source and tags', () => {
    const prefill = buildPrefill(
      selection,
      [stadmakerField, initiatiefField, koosField],
      {
        'openstad:3': { id: '3', label: 'Lena van der Wal', tagIds: ['10'] },
        'metkoos:k1': { id: 'k1', label: 'Kunstlessen van Art-S-Cool' },
      }
    );

    expect(prefill).toEqual({
      stadmakers: [
        {
          source: 'openstad',
          id: '2',
          label: 'Arno Segeren',
          image: 'https://img/2',
        },
        { source: 'openstad', id: '3', label: 'Lena van der Wal' },
      ],
      initiatieven: [{ source: 'openstad', id: '9', label: 'De Binnentuin' }],
      activiteiten: [
        { source: 'metkoos', id: 'k1', label: 'Kunstlessen van Art-S-Cool' },
      ],
    });
  });

  it('shows the id of an external link whose item is no longer available', () => {
    const prefill = buildPrefill(selection, [koosField], {});
    expect(prefill.activiteiten).toEqual([
      { source: 'metkoos', id: 'k1', label: 'k1' },
    ]);
  });
});

describe('own submissions', () => {
  const own = {
    source: 'openstad',
    id: '9',
    label: 'Eigen inzending',
    own: true,
  };

  it('splits added items into items of others and own items', () => {
    expect(splitAddedLinks([arno, own, lena])).toEqual({
      others: [arno, lena],
      own: [own],
    });
  });

  it('asks for confirmation only when others are involved', () => {
    expect(needsLinkConfirmation({ added: [own], removed: [] })).toBe(false);
    expect(needsLinkConfirmation({ added: [own, arno], removed: [] })).toBe(
      true
    );
    expect(needsLinkConfirmation({ added: [own], removed: [lena] })).toBe(true);
    expect(needsLinkConfirmation({ added: [], removed: [] })).toBe(false);
  });

  it('keeps the own flag in the payload of added items', () => {
    const payload = buildLinkPayload({ stadmakers: [own] }, {});
    expect(payload.added).toEqual([own]);
    expect(payload.links).toEqual([{ source: 'openstad', id: '9' }]);
  });
});

describe('linkRequestMessage', () => {
  it('shows the notice of the link request handler', () => {
    expect(
      linkRequestMessage({ requested: [], notice: 'Niet verstuurd: Arno.' })
    ).toBe('Niet verstuurd: Arno.');
  });

  it('shows a general message when the handler failed', () => {
    expect(linkRequestMessage({ error: 'database down' })).toBe(
      'Koppelverzoeken konden niet worden verstuurd'
    );
  });

  it('shows nothing when everything was sent', () => {
    expect(linkRequestMessage({ requested: [] })).toBeNull();
    expect(linkRequestMessage(undefined)).toBeNull();
  });
});

describe('restoreLinkValues', () => {
  it('puts the saved selection back in the link fields and keeps other edits', () => {
    const restored = restoreLinkValues(
      { title: 'Nieuwe titel', stadmakers: [lena] },
      [stadmakerField, koosField],
      { stadmakers: [arno] }
    );

    expect(restored).toEqual({
      title: 'Nieuwe titel',
      stadmakers: [arno],
      activiteiten: [],
    });
  });
});
