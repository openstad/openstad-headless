import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const {
  getResourceFormExtraDataConfig,
  attachModeratorOnlyExtraDataKeys,
} = require('./resourceExtraData');

const origWidgetFindAll = db.Widget.findAll;

afterEach(() => {
  db.Widget.findAll = origWidgetFindAll;
});

describe('getResourceFormExtraDataConfig', () => {
  it('collects unique field keys and the moderator-only subset', () => {
    const config = {
      items: [
        { fieldKey: 'a' },
        { fieldKey: 'b', onlyForModerator: true },
        { fieldKey: 'a' }, // duplicate
        { notAFieldKey: true }, // ignored
      ],
    };
    const result = getResourceFormExtraDataConfig(config);
    expect(result.fieldKeys.sort()).toEqual(['a', 'b']);
    expect(result.moderatorOnlyFieldKeys).toEqual(['b']);
  });

  it('returns empty arrays for a config without items', () => {
    expect(getResourceFormExtraDataConfig({})).toEqual({
      fieldKeys: [],
      moderatorOnlyFieldKeys: [],
    });
  });
});

describe('attachModeratorOnlyExtraDataKeys', () => {
  it('flags resources without a widget as having no form config (no db call)', async () => {
    db.Widget.findAll = vi.fn();
    const resource = { projectId: 1, widgetId: null };
    await attachModeratorOnlyExtraDataKeys(resource);
    expect(resource.hasResourceFormConfig).toBe(false);
    expect(resource.resourceFormFieldKeys).toEqual([]);
    expect(resource.moderatorOnlyExtraDataKeys).toEqual([]);
    expect(db.Widget.findAll).not.toHaveBeenCalled();
  });

  it('attaches field keys from the matching resourceform widget', async () => {
    db.Widget.findAll = vi.fn().mockResolvedValue([
      {
        id: 7,
        projectId: 1,
        config: {
          items: [
            { fieldKey: 'naam' },
            { fieldKey: 'intern', onlyForModerator: true },
          ],
        },
      },
    ]);
    const resource = { projectId: 1, widgetId: 7 };
    await attachModeratorOnlyExtraDataKeys([resource]);
    expect(resource.hasResourceFormConfig).toBe(true);
    expect(resource.resourceFormFieldKeys.sort()).toEqual(['intern', 'naam']);
    expect(resource.moderatorOnlyExtraDataKeys).toEqual(['intern']);
  });

  it('flags a resource whose widget has no config when none matches', async () => {
    db.Widget.findAll = vi.fn().mockResolvedValue([]); // no resourceform widget found
    const resource = { projectId: 1, widgetId: 7 };
    await attachModeratorOnlyExtraDataKeys([resource]);
    expect(resource.hasResourceFormConfig).toBe(false);
    expect(resource.resourceFormFieldKeys).toEqual([]);
    expect(resource.moderatorOnlyExtraDataKeys).toEqual([]);
  });
});
