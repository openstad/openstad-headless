import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const { copyWidgetsBetweenProjects } = require('./widgetCopy');

const TARGET = 9;
const GLOBAL_TAG_ID = 77;

let updatedConfigs;
let createSpies;

beforeEach(() => {
  updatedConfigs = {};

  vi.spyOn(db.sequelize, 'transaction').mockImplementation(async (fn) =>
    fn({})
  );
  vi.spyOn(db.Tag, 'findAll').mockResolvedValue([{ id: GLOBAL_TAG_ID }]);
  createSpies = [
    vi.spyOn(db.Tag, 'create'),
    vi.spyOn(db.Status, 'create'),
    vi.spyOn(db.Markers, 'create'),
  ];

  let nextWidgetId = 300;
  vi.spyOn(db.Widget, 'create').mockImplementation(async (values) => {
    const id = nextWidgetId++;
    return {
      ...values,
      id,
      update: async ({ config }) => {
        updatedConfigs[id] = config;
      },
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function widget(id, config, description = `Widget ${id}`) {
  return { id, type: 'resourceoverview', description, config };
}

function copy(sourceWidgets) {
  return copyWidgetsBetweenProjects({
    sourceWidgets,
    targetProjectId: TARGET,
  });
}

describe('copyWidgetsBetweenProjects', () => {
  it('copies the widgets into the target project without creating tags, statuses or marker sets', async () => {
    const result = await copy([
      widget(10, {
        onlyIncludeTagIds: `1,${GLOBAL_TAG_ID}`,
        onlyIncludeStatusIds: '7',
        resourceOverviewMapWidget: { markerSets: [{ id: 3, name: 'A' }] },
      }),
    ]);

    createSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect(db.Widget.create.mock.calls[0][0].projectId).toBe(TARGET);
    expect(updatedConfigs[300]).toEqual({
      onlyIncludeTagIds: String(GLOBAL_TAG_ID),
      onlyIncludeStatusIds: '',
      resourceOverviewMapWidget: { markerSets: [] },
      projectId: TARGET,
    });
    expect(result.cleared).toEqual([
      {
        id: 300,
        description: 'Widget 10',
        keys: [
          'onlyIncludeTagIds',
          'onlyIncludeStatusIds',
          'resourceOverviewMapWidget.markerSets',
        ],
      },
    ]);
  });

  it('only looks up global tags', async () => {
    await copy([widget(10, {})]);

    expect(db.Tag.findAll.mock.calls[0][0].where).toEqual({ projectId: 0 });
  });

  it('maps a widget reference within the batch and reports a cleared resource', async () => {
    const result = await copy([
      widget(10, { resourceId: 41 }, 'Detail'),
      widget(11, { choiceguideWidgetId: '10' }, 'Resultaat'),
    ]);

    expect(updatedConfigs[300]).toEqual({
      resourceId: null,
      projectId: TARGET,
    });
    expect(updatedConfigs[301].choiceguideWidgetId).toBe('300');
    expect(result.cleared).toEqual([
      { id: 300, description: 'Detail', keys: ['resourceId'] },
    ]);
  });

  it('returns the copies and an empty cleared list when nothing had to be cleared', async () => {
    const result = await copy([widget(10, { displayTitle: true })]);

    expect(result.widgets.map((w) => w.id)).toEqual([300]);
    expect(result.cleared).toEqual([]);
  });
});
