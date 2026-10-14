import { looseEqual } from '@/lib/loose-equal';
import { describe, expect, it } from 'vitest';

import {
  type ShownDefault,
  asDefaultType,
  changesToSave,
  collectRepair,
  collectShownDefaults,
  draftFieldValue,
  rebaseDraft,
  withRepairs,
  withShownDefaults,
} from './useWidgetDraft';

const shownMap = (pairs: [string, unknown][], stored?: unknown) =>
  new Map<string, ShownDefault>(
    pairs.map(([path, shown]) => [path, { shown, stored }])
  );

const shown = shownMap([
  ['toggleShowText', 'Lees meer'],
  ['displayTitle', false],
  ['toggleType', 'full'],
]);

const isDirty = (draft: any, saved: any) =>
  !looseEqual(withShownDefaults(draft, shown), withShownDefaults(saved, shown));

describe('widget draft dirty check', () => {
  it('is clean when a field shows its default again', () => {
    expect(isDirty({ toggleShowText: 'Lees meer' }, {})).toBe(false);
    expect(isDirty({ displayTitle: false }, {})).toBe(false);
    expect(isDirty({ toggleType: 'full' }, {})).toBe(false);
  });

  it('is clean when a number field holds the stored number as text', () => {
    expect(isDirty({ itemsPerPage: '9999' }, { itemsPerPage: 9999 })).toBe(
      false
    );
  });

  it('is dirty for a real change, also away from a shown default', () => {
    expect(isDirty({ toggleShowText: 'Lees meer qa' }, {})).toBe(true);
    expect(isDirty({ displayTitle: true }, {})).toBe(true);
    expect(isDirty({ itemsPerPage: '10000' }, { itemsPerPage: 9999 })).toBe(
      true
    );
    expect(isDirty({ title: '' }, { title: 'Agenda' })).toBe(true);
  });
});

describe('widget save payload', () => {
  it('does not write defaults that were only shown', () => {
    expect(
      changesToSave(
        { toggleShowText: 'Lees meer', displayTitle: false, title: 'x' },
        { title: 'old' },
        shown
      )
    ).toEqual({ title: 'x' });
  });

  it('leaves out a value that did not change (the server keeps its own)', () => {
    expect(
      changesToSave(
        { itemsPerPage: '9999', title: 'old' },
        { itemsPerPage: 9999, title: 'old' },
        shown
      )
    ).toEqual({});
  });

  it('sends real changes, including clearing a stored value', () => {
    expect(
      changesToSave(
        { itemsPerPage: '10000', title: '' },
        { itemsPerPage: 9999, title: 'Agenda' },
        shown
      )
    ).toEqual({ itemsPerPage: 10000, title: '' });
  });

  it('clears a key the draft no longer has a value for (sent as null)', () => {
    expect(
      changesToSave({ resourceId: undefined }, { resourceId: '28' }, shown)
    ).toEqual({ resourceId: null });
  });

  it('keeps a stored number a number when it changes', () => {
    expect(changesToSave({ minZoom: '-7' }, { minZoom: -6 }, shown)).toEqual({
      minZoom: -7,
    });
  });
});

describe('number inputs without a schema', () => {
  it('keeps a field whose default is a number a number', () => {
    expect(asDefaultType('10000', 9999)).toBe(10000);
    expect(asDefaultType('-7', -6)).toBe(-7);
  });

  it('leaves text, cleared numbers and fields without a number default alone', () => {
    expect(asDefaultType('', 9999)).toBe('');
    expect(asDefaultType('abc', 1)).toBe('abc');
    expect(asDefaultType('12', '')).toBe('12');
    expect(asDefaultType('12', undefined)).toBe('12');
  });

  it('keeps a number a number when it is typed again after emptying the field', () => {
    expect(draftFieldValue('9999', '', 0)).toBe(9999);
    expect(draftFieldValue('9999', undefined, 20)).toBe(9999);
    expect(draftFieldValue('12', '', 'abc')).toBe('12');
    expect(draftFieldValue('12', '', undefined)).toBe('12');
    expect(draftFieldValue('', '', 9999)).toBe('');
    expect(draftFieldValue('12', 'text', 5)).toBe('12');
  });
});

describe('shown defaults under a prefix (tabs that write general.x)', () => {
  const nested = shownMap([['general.resource', 'resource']]);

  it('is clean when a nested field shows its default again', () => {
    const draft = { general: { resource: 'resource' } };
    expect(
      looseEqual(
        withShownDefaults(draft, nested),
        withShownDefaults({}, nested)
      )
    ).toBe(true);
  });

  it('does not write the nested default on save', () => {
    expect(
      changesToSave({ general: { resource: 'resource' } }, {}, nested)
    ).toEqual({});
  });

  it('still sees a nested change', () => {
    const draft = { general: { resource: 'idea' } };
    expect(
      looseEqual(
        withShownDefaults(draft, nested),
        withShownDefaults({}, nested)
      )
    ).toBe(false);
  });
});

describe('switches and texts that show a default the widget never saved', () => {
  const defaultsOn = shownMap([
    ['displayLikes', true],
    ['toggleShowText', 'Lees meer'],
  ]);
  const dirty = (draft: any, saved: any) =>
    !looseEqual(
      withShownDefaults(draft, defaultsOn),
      withShownDefaults(saved, defaultsOn)
    );

  it('an editor where nothing was touched is clean', () => {
    expect(dirty({}, {})).toBe(false);
    expect(dirty({ title: 'x' }, { title: 'x' })).toBe(false);
  });

  it('switching off a default-on switch is a change, and it is sent', () => {
    expect(dirty({ displayLikes: false }, {})).toBe(true);
    expect(changesToSave({ displayLikes: false }, {}, defaultsOn)).toEqual({
      displayLikes: false,
    });
  });

  it('switching it on again after saving it off is a change', () => {
    expect(dirty({ displayLikes: true }, { displayLikes: false })).toBe(true);
  });

  it('emptying a default text is a change, and the empty text is sent', () => {
    expect(dirty({ toggleShowText: '' }, {})).toBe(true);
    expect(changesToSave({ toggleShowText: '' }, {}, defaultsOn)).toEqual({
      toggleShowText: '',
    });
  });

  it('typing the cleared text back after saving it empty is a change', () => {
    expect(dirty({ toggleShowText: 'Lees meer' }, { toggleShowText: '' })).toBe(
      true
    );
  });
});

describe('which shown defaults a tab records', () => {
  const none = new Map<string, ShownDefault>();

  it('records a key that was never saved with what the tab showed', () => {
    expect(
      collectShownDefaults(
        { toggleShowText: 'Lees meer' },
        undefined,
        {},
        {},
        none
      )
    ).toEqual([['toggleShowText', { shown: 'Lees meer', stored: undefined }]]);
  });

  it('does not record a text saved empty: the site can show it empty', () => {
    const saved = { yesLabel: '' };
    expect(
      collectShownDefaults({ yesLabel: 'Ja' }, undefined, saved, saved, none)
    ).toEqual([]);
  });

  it('does not record a key with an unsaved edit', () => {
    expect(
      collectShownDefaults({ title: 'x' }, undefined, { title: 'x' }, {}, none)
    ).toEqual([]);
  });

  it('records under the prefix, also inside a partly saved object', () => {
    const config = { generalSettings: { cta: { show: true } } };
    const found = collectShownDefaults(
      { stickyBarDefaultOpen: true, cta: { show: false, label: 'Lees' } },
      'generalSettings',
      config,
      config,
      none
    );
    expect(found.map(([path]) => path)).toEqual([
      'generalSettings.stickyBarDefaultOpen',
      'generalSettings.cta.label',
    ]);
  });

  it('keeps the first record', () => {
    expect(
      collectShownDefaults({ a: 2 }, undefined, {}, {}, shownMap([['a', 1]]))
    ).toEqual([]);
  });
});

describe('values inside an object or a list', () => {
  const recorded = (defaults: Record<string, unknown>, prefix?: string) =>
    new Map(collectShownDefaults(defaults, prefix, {}, {}, new Map()));

  it('switching off a default-on switch under a prefix is a change, and it is sent', () => {
    const known = recorded({ stickyBarDefaultOpen: true }, 'generalSettings');
    const off = { generalSettings: { stickyBarDefaultOpen: false } };
    expect(
      looseEqual(withShownDefaults(off, known), withShownDefaults({}, known))
    ).toBe(false);
    expect(changesToSave(off, {}, known)).toEqual(off);

    const onAgain = { generalSettings: { stickyBarDefaultOpen: true } };
    expect(
      looseEqual(
        withShownDefaults(onAgain, known),
        withShownDefaults({}, known)
      )
    ).toBe(true);
  });

  it('unticking "show on load" for a selected map layer is sent', () => {
    const saved = { datalayer: [{ id: 1, name: 'Bomen' }] };
    const draft = {
      datalayer: [{ id: 1, name: 'Bomen', activeOnInit: false }],
    };
    expect(changesToSave(draft, saved, new Map())).toEqual(draft);
  });

  it('typing the shown text over a text saved empty can be saved', () => {
    const saved = { yesLabel: '' };
    const known = new Map(
      collectShownDefaults(
        { yesLabel: 'Ja' },
        undefined,
        saved,
        saved,
        new Map()
      )
    );
    expect(changesToSave({ yesLabel: 'Ja' }, saved, known)).toEqual({
      yesLabel: 'Ja',
    });
  });
});

describe('a field that showed nothing (no default)', () => {
  const blank = shownMap([
    ['showMap', undefined],
    ['intro', undefined],
    ['tags', undefined],
  ]);
  const dirty = (draft: any) =>
    !looseEqual(withShownDefaults(draft, blank), withShownDefaults({}, blank));

  it('is clean again once it is emptied (switch off, text cleared, list cleared)', () => {
    expect(dirty({ showMap: false })).toBe(false);
    expect(dirty({ intro: '' })).toBe(false);
    expect(dirty({ tags: [] })).toBe(false);
    expect(changesToSave({ showMap: false, intro: '' }, {}, blank)).toEqual({});
  });

  it('a value is still a change', () => {
    expect(dirty({ showMap: true })).toBe(true);
    expect(dirty({ intro: 'x' })).toBe(true);
    expect(dirty({ tags: [1] })).toBe(true);
  });
});

describe('a save made elsewhere while the editor is open', () => {
  const base = { title: 'Mine', itemsPerPage: 10, general: { a: 1, b: 1 } };
  const next = { title: 'Theirs', itemsPerPage: 10, general: { a: 1, b: 2 } };

  it('takes over every value the user did not change', () => {
    expect(
      rebaseDraft({ ...base, widgetId: '7' }, base, next, ['widgetId'])
    ).toEqual({ ...next, widgetId: '7' });
  });

  it('keeps what the user changed, also inside an object', () => {
    const draft = {
      title: 'Mine',
      itemsPerPage: '20',
      general: { a: 5, b: 1 },
    };
    expect(rebaseDraft(draft, base, next)).toEqual({
      title: 'Theirs',
      itemsPerPage: '20',
      general: { a: 5, b: 2 },
    });
  });

  it('merges an object the user started with keys another save put in it', () => {
    expect(
      rebaseDraft(
        { generalSettings: { stickyBarDefaultOpen: false } },
        {},
        { generalSettings: { submitButtonText: 'Send' } }
      )
    ).toEqual({
      generalSettings: {
        stickyBarDefaultOpen: false,
        submitButtonText: 'Send',
      },
    });
  });

  it('drops a key the other save removed, unless the user changed it', () => {
    expect(rebaseDraft({ x: 1, y: 2 }, { x: 1, y: 1 }, {})).toEqual({ y: 2 });
  });

  it('then sends only the own change', () => {
    const draft = rebaseDraft({ ...base, itemsPerPage: 20 }, base, next);
    expect(changesToSave(draft, next, new Map())).toEqual({ itemsPerPage: 20 });
  });
});

describe('a field that corrects a stored value by itself (deleted tags)', () => {
  const saved = { onlyIncludeTagIds: '10,99', title: 'x' };

  it('is recorded only for a stored key the user did not change', () => {
    expect(collectRepair('onlyIncludeTagIds', '10', saved, saved)).toEqual({
      from: '10,99',
      to: '10',
    });
    expect(collectRepair('missing', 'a', {}, {})).toBeUndefined();
    expect(
      collectRepair(
        'onlyIncludeTagIds',
        '10',
        { onlyIncludeTagIds: '12' },
        saved
      )
    ).toBeUndefined();
    expect(collectRepair('title', 'x', saved, saved)).toBeUndefined();
  });

  it('goes along with the next save, but not over a later user change', () => {
    const repairs = new Map([
      ['onlyIncludeTagIds', { from: '10,99', to: '10' }],
    ]);
    const draft = { ...saved, title: 'y' };
    expect(
      changesToSave(withRepairs(draft, repairs), saved, new Map())
    ).toEqual({ onlyIncludeTagIds: '10', title: 'y' });
    const edited = { ...saved, onlyIncludeTagIds: '10,12' };
    expect(withRepairs(edited, repairs).onlyIncludeTagIds).toBe('10,12');
  });

  it('does not make the bar dirty by itself', () => {
    expect(
      looseEqual(
        withShownDefaults(saved, new Map()),
        withShownDefaults(saved, new Map())
      )
    ).toBe(true);
  });
});
