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
const {
  remapConfig,
  isIdKey,
  isClassifiedIdKey,
} = require('./widgetConfigReferences');

const GLOBAL_TAG_ID = 50;

const maps = {
  tagMap: { [GLOBAL_TAG_ID]: GLOBAL_TAG_ID },
  statusMap: {},
  markerSetMap: {},
  widgetMap: { 11: 211, 12: 212 },
  targetProjectId: 9,
};

function remap(config) {
  const copy = JSON.parse(JSON.stringify(config));
  const { clearedKeys } = remapConfig(copy, maps);
  return { config: copy, clearedKeys };
}

describe('remapConfig', () => {
  it('keeps global tag ids and removes the tag ids of the source project', () => {
    const { config, clearedKeys } = remap({
      onlyIncludeTagIds: ',1,50',
      commentsWidget: { defaultTags: '2' },
      relatedResources: { tagIds: '50' },
    });

    expect(config.onlyIncludeTagIds).toBe('50');
    expect(config.commentsWidget.defaultTags).toBe('');
    expect(config.relatedResources.tagIds).toBe('50');
    expect(clearedKeys).toEqual([
      'onlyIncludeTagIds',
      'commentsWidget.defaultTags',
    ]);
  });

  it('clears status ids', () => {
    const { config, clearedKeys } = remap({
      onlyIncludeStatusIds: '7,8',
      statusId: '7',
    });

    expect(config.onlyIncludeStatusIds).toBe('');
    expect(config.statusId).toBe('');
    expect(clearedKeys).toEqual(['onlyIncludeStatusIds', 'statusId']);
  });

  it('clears marker sets, also nested in a sub-widget', () => {
    const { config, clearedKeys } = remap({
      resourceOverviewMapWidget: { markerSets: [{ id: 3, name: 'A' }] },
    });

    expect(config.resourceOverviewMapWidget.markerSets).toEqual([]);
    expect(clearedKeys).toEqual(['resourceOverviewMapWidget.markerSets']);
  });

  it('points projectId at the target project but keeps the global marker', () => {
    const { config, clearedKeys } = remap({
      projectId: 2,
      tagGroups: [
        { type: 'kleur', projectId: '2' },
        { type: 'global', projectId: '0' },
      ],
    });

    expect(config.projectId).toBe(9);
    expect(config.tagGroups).toEqual([
      { type: 'kleur', projectId: '9' },
      { type: 'global', projectId: '0' },
    ]);
    expect(clearedKeys).toEqual([]);
  });

  it('maps a widget reference copied in the same batch and clears one that was not', () => {
    const { config, clearedKeys } = remap({
      choiceguideWidgetId: '11',
      widgetToFetchId: 40,
    });

    expect(config.choiceguideWidgetId).toBe('211');
    expect(config.widgetToFetchId).toBe(null);
    expect(clearedKeys).toEqual(['widgetToFetchId']);
  });

  it('clears a linked resource and an unknown id key', () => {
    const { config, clearedKeys } = remap({
      resourceId: 41,
      someFutureThingId: 5,
    });

    expect(config.resourceId).toBe(null);
    expect(config.someFutureThingId).toBe(null);
    expect(clearedKeys).toEqual(['resourceId', 'someFutureThingId']);
  });

  it('leaves switches, area ids, tag types and empty values alone', () => {
    const original = {
      includeOrExcludeTagIds: 'include',
      includeOrExcludeStatusIds: 'exclude',
      areaId: '3',
      resourceId: null,
      onlyIncludeTagIds: '',
      markerSets: [],
      tagTypeTag: 'stemtype',
      overviewTagGroups: ['kleur'],
      items: [{ tags: 'theme', routingSelectedAnswer: ['0'] }],
    };
    const { config, clearedKeys } = remap(original);

    expect(config).toEqual(original);
    expect(clearedKeys).toEqual([]);
  });
});

describe('isIdKey', () => {
  it('matches camelCase keys ending in Id or Ids only', () => {
    expect(isIdKey('resourceId')).toBe(true);
    expect(isIdKey('onlyIncludeTagIds')).toBe(true);
    ['valid', 'grid', 'items', 'defaultTags'].forEach((key) =>
      expect(isIdKey(key)).toBe(false)
    );
  });
});

describe('widget registry defaults', () => {
  it('has no id-shaped config key that is unclassified', () => {
    const getWidgetSettings = require('../routes/widget/widget-settings');

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
