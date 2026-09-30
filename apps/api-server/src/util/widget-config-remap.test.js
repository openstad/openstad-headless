import { describe, expect, it } from 'vitest';

import {
  isClassifiedIdKey,
  isIdKey,
  remapWidgetConfigForProject,
} from './widget-config-remap.js';

const noMaps = {
  widgetMap: {},
  resourceMap: {},
  tagMap: {},
  statusMap: {},
  markerSetMap: {},
};

function remap(config, maps = {}) {
  const result = JSON.parse(JSON.stringify(config));
  const { clearedKeys } = remapWidgetConfigForProject(result, {
    ...noMaps,
    ...maps,
    projectId: 7,
  });
  // Round-trip through JSON, because that is what the JSON column stores.
  return { config: JSON.parse(JSON.stringify(result)), clearedKeys };
}

const remapped = (config, maps) => remap(config, maps).config;

describe('remapWidgetConfigForProject', () => {
  it('rewrites projectId, including nested inside objects and arrays', () => {
    expect(
      remapped({
        projectId: 2,
        tagGroups: [{ type: 'theme', projectId: 2 }],
        resourceOverviewMapWidget: { projectId: 2 },
      })
    ).toEqual({
      projectId: 7,
      tagGroups: [{ type: 'theme', projectId: 7 }],
      resourceOverviewMapWidget: { projectId: 7 },
    });
  });

  it('keeps a projectId that a tag group stores as a string, as a string', () => {
    // The tag filter compares with `typeof value === 'string'`, so handing it a
    // number breaks the comparison as surely as a wrong id would.
    expect(
      remapped({ tagGroups: [{ type: 'theme', projectId: '2' }] })
    ).toEqual({ tagGroups: [{ type: 'theme', projectId: '7' }] });
  });

  it('leaves the global-tag marker projectId 0 alone', () => {
    // A tag group with projectId '0' reads the global tag list, not the source
    // project's. Rewriting it to the target id would point it at tags that may
    // not exist there.
    expect(
      remapped({
        tagGroups: [
          { type: 'theme', projectId: '0' },
          { type: 'area', projectId: 0 },
        ],
      })
    ).toEqual({
      tagGroups: [
        { type: 'theme', projectId: '0' },
        { type: 'area', projectId: 0 },
      ],
    });
  });

  it('maps tag ids that exist in the target project and drops the ones that do not', () => {
    expect(
      remapped(
        { onlyIncludeTagIds: '10,11,12' },
        { tagMap: { 10: 30, 12: 32 } }
      )
    ).toEqual({ onlyIncludeTagIds: '30,32' });
  });

  it('nulls a tag list when nothing survives, instead of leaving an empty string', () => {
    expect(remapped({ onlyIncludeTagIds: '10,11' })).toEqual({
      onlyIncludeTagIds: null,
    });
  });

  it('maps status ids the same way', () => {
    expect(
      remapped({ onlyIncludeStatusIds: '5,6' }, { statusMap: { 6: 60 } })
    ).toEqual({ onlyIncludeStatusIds: '60' });
  });

  it('maps a single status id, not only a list', () => {
    // The document-map stores one status per link in `statusId`. Before this
    // key was classified it fell through to the "clear it" branch, so a copy
    // lost the status link even when the target project had an equivalent.
    expect(remapped({ statusId: '12' }, { statusMap: { 12: 8 } })).toEqual({
      statusId: '8',
    });
  });

  it('maps a tag id list whose key does not end in Ids', () => {
    // The resource-form stores the tags it adds to a new resource in
    // `defaultAddedTags`. It does not match ID_KEY_PATTERN, so without being
    // listed it would carry the source project's tag ids into the target and
    // every new resource there would get a foreign tag.
    expect(
      remapped(
        { submit: { defaultAddedTags: '50,51' } },
        { tagMap: { 50: 80 } }
      )
    ).toEqual({ submit: { defaultAddedTags: '80' } });
  });

  it('matches marker sets by name and drops the ones with no equivalent', () => {
    // A marker set belongs to a project. The reference is stored as
    // `markerSets: [{ id, name }]`, whose key is a bare `id` -- deliberately not
    // id-shaped, because selectedProjects[].id must survive untouched.
    expect(
      remapped(
        {
          markerSets: [
            { id: 55, name: 'Stembureaus' },
            { id: 56, name: 'Alleen hier' },
          ],
        },
        { markerSetMap: { 55: 90 } }
      )
    ).toEqual({ markerSets: [{ id: 90, name: 'Stembureaus' }] });
  });

  it('keeps a multi-project overview pointing at the projects it selected', () => {
    // selectedProjects is a deliberate list of OTHER projects to aggregate, not a
    // reference that should follow the copy. Rewriting it would turn the widget
    // into an overview of the target project alone.
    const config = {
      projectId: 2,
      selectedProjects: [
        { id: 10, name: 'Begroten' },
        { id: 11, name: 'Plannen' },
      ],
    };
    expect(remapped(config)).toEqual({ ...config, projectId: 7 });
  });

  // Regression: a substring rule (`key.includes('tag')`) also fired on these
  // keys, which mention tags/statuses but hold a mode or a tag *type*, never an
  // id. Clearing them inverted the status filter.
  it('leaves tag/status-adjacent keys that do not hold ids untouched', () => {
    const config = {
      includeOrExcludeTagIds: 'include',
      includeOrExcludeStatusIds: 'exclude',
      includeOrExclude: 'include',
      tagTypeSelector: 'tag',
      tagTypeTag: 'theme',
      displayStatusLabel: true,
      items: [{ type: 'text', tags: 'theme' }],
    };
    expect(remapped(config)).toEqual(config);
  });

  it('leaves references to globally scoped rows untouched', () => {
    // An Area is not owned by a project, so its id is valid in the target
    // project as it is.
    const config = { areaId: 4 };
    expect(remapped(config)).toEqual(config);
  });

  it('drops an id field of an unexpected shape instead of passing it through', () => {
    // The admin API stores config without a server-side schema, so these fields
    // can hold an array or object. Nothing can be mapped, and keeping the value
    // would carry source-project ids into the target -- so it is cleared.
    expect(
      remapped({
        onlyIncludeTagIds: ['10', '12'],
        onlyIncludeStatusIds: { a: 1 },
      })
    ).toEqual({ onlyIncludeTagIds: null, onlyIncludeStatusIds: null });
  });

  it('clears resourceId to null so the key survives JSON serialization', () => {
    // undefined would be dropped by JSON.stringify, silently handing the key
    // back to the widget registry default instead of storing "not set".
    expect(remapped({ resourceId: 41 })).toEqual({ resourceId: null });
  });

  it('remaps widget references to their copies within the same batch', () => {
    expect(
      remapped(
        { choiceguideWidgetId: 88, widgetToFetchId: 99 },
        { widgetMap: { 88: 188, 99: 199 } }
      )
    ).toEqual({ choiceguideWidgetId: 188, widgetToFetchId: 199 });
  });

  it('nulls a widget reference that was not part of the batch', () => {
    expect(remapped({ choiceguideWidgetId: 88 })).toEqual({
      choiceguideWidgetId: null,
    });
  });

  it('rewrites the self-referencing widgetId to the copy', () => {
    // config.widgetId holds the widget's OWN id. Left alone, every copy would
    // claim the source widget's id.
    expect(remapped({ widgetId: '49' }, { widgetMap: { 49: 50 } })).toEqual({
      widgetId: 50,
    });
  });

  // The reviewer's concern on PR #64: the allowlists are correct today, but a
  // widget that gains a new id field later must not silently carry a
  // source-project id into the copy.
  it('clears an id-shaped key that no rule knows about', () => {
    const { config, clearedKeys } = remap({
      someFutureThingId: 123,
      anotherFutureThingIds: '4,5',
    });
    expect(config).toEqual({
      someFutureThingId: null,
      anotherFutureThingIds: null,
    });
    expect(clearedKeys).toEqual(['someFutureThingId', 'anotherFutureThingIds']);
  });

  it('reports the path of every cleared key so the copy is not silent', () => {
    const { clearedKeys } = remap({
      resourceId: 41,
      nested: { onlyIncludeTagIds: '10' },
    });
    expect(clearedKeys).toEqual(['resourceId', 'nested.onlyIncludeTagIds']);
  });

  it('does not report keys that were mapped or left alone', () => {
    const { clearedKeys } = remap(
      { projectId: 2, resourceId: 41, includeOrExcludeTagIds: 'include' },
      { resourceMap: { 41: 77 } }
    );
    expect(clearedKeys).toEqual([]);
  });
});

describe('isIdKey', () => {
  it('matches camelCase keys ending in Id or Ids', () => {
    expect(isIdKey('resourceId')).toBe(true);
    expect(isIdKey('onlyIncludeTagIds')).toBe(true);
    expect(isIdKey('someFutureThingId')).toBe(true);
  });

  it('does not match words that merely end in "id"', () => {
    ['valid', 'invalid', 'grid', 'hybrid', 'items', 'title'].forEach((key) =>
      expect(isIdKey(key)).toBe(false)
    );
  });
});

// Guard: a widget that ships a new id-shaped config default must be classified
// here on purpose. Without this, a new field would silently fall through to the
// "clear it" branch and lose a setting nobody meant to lose.
describe('widget registry defaults', () => {
  it('has no id-shaped config key that is unclassified', async () => {
    const getWidgetSettings = (
      await import('../routes/widget/widget-settings.js')
    ).default;

    const unclassified = new Set();
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      for (const key of Object.keys(node)) {
        if (isIdKey(key) && !isClassifiedIdKey(key)) unclassified.add(key);
        walk(node[key]);
      }
    };
    Object.values(getWidgetSettings()).forEach((definition) =>
      walk(definition.defaultConfig)
    );

    expect([...unclassified]).toEqual([]);
  });
});
