import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const projectTemplate = require('./projectTemplate');

const orig = {
  userFindAll: db.User.findAll,
  projectScope: db.Project.scope,
  resourceScope: db.Resource.scope,
  widgetFindAll: db.Widget.findAll,
  tagFindAll: db.Tag.findAll,
  statusFindAll: db.Status.findAll,
  notificationTemplateFindAll: db.NotificationTemplate.findAll,
};

const instance = (obj) => ({ get: () => ({ ...obj }) });

afterEach(() => {
  db.User.findAll = orig.userFindAll;
  db.Project.scope = orig.projectScope;
  db.Resource.scope = orig.resourceScope;
  db.Widget.findAll = orig.widgetFindAll;
  db.Tag.findAll = orig.tagFindAll;
  db.Status.findAll = orig.statusFindAll;
  db.NotificationTemplate.findAll = orig.notificationTemplateFindAll;
  vi.clearAllMocks();
});

describe('anonymizeResourceOwners', () => {
  it('keeps the userId for admin/editor owners', async () => {
    db.User.findAll = vi.fn().mockResolvedValue([{ id: 7, role: 'editor' }]);
    const resources = [{ userId: 7, user: { id: 7 } }];

    await projectTemplate.anonymizeResourceOwners(resources);

    expect(resources[0].userId).toBe(7);
    expect(resources[0].user).toBeUndefined();
    expect(db.User.findAll).toHaveBeenCalledTimes(1);
  });

  it('anonymizes the userId for non-admin owners without touching extraData', async () => {
    db.User.findAll = vi.fn().mockResolvedValue([{ id: 9, role: 'member' }]);
    const resources = [
      { userId: 9, user: { id: 9 }, extraData: { title: 'x' } },
    ];

    await projectTemplate.anonymizeResourceOwners(resources);

    expect(resources[0].userId).toBe('anonymous');
    expect(resources[0].user).toBeUndefined();
    expect(resources[0].extraData).toEqual({ title: 'x' });
  });

  it('anonymizes owners that no longer exist', async () => {
    db.User.findAll = vi.fn().mockResolvedValue([]);
    const resources = [{ userId: 123 }];

    await projectTemplate.anonymizeResourceOwners(resources);

    expect(resources[0].userId).toBe('anonymous');
  });
});

describe('keepPublicExtraData', () => {
  it('keeps public choice fields and drops moderator-only, denylisted-type and unknown keys', () => {
    const resources = [
      {
        resourceFormFieldKeys: ['pub', 'secret', 'note', 'est'],
        moderatorOnlyExtraDataKeys: ['secret'],
        resourceFormFieldTypes: {
          pub: 'select',
          secret: 'select',
          note: 'text',
          est: 'estimate',
        },
        extraData: {
          pub: 'keep',
          secret: 'drop',
          note: 'drop',
          est: 'drop',
          unknown: 'drop',
        },
      },
    ];

    projectTemplate.keepPublicExtraData(resources);

    expect(resources[0].extraData).toEqual({ pub: 'keep' });
  });

  it('drops all non-always-public keys when there is no form config', () => {
    const resources = [
      {
        resourceFormFieldKeys: [],
        moderatorOnlyExtraDataKeys: [],
        extraData: { phone: '06', ranking: 3 },
      },
    ];

    projectTemplate.keepPublicExtraData(resources);

    expect(resources[0].extraData).toEqual({ ranking: 3 });
  });
});

describe('buildProjectTemplateSnapshot', () => {
  function stubProject(project) {
    db.Project.scope = vi.fn().mockReturnValue({
      findByPk: vi.fn().mockResolvedValue(project),
    });
  }

  function stubResources(rows) {
    db.Resource.scope = vi
      .fn()
      .mockReturnValue({ findAll: vi.fn().mockResolvedValue(rows) });
  }

  it('builds a snapshot with stripped ids and originalId', async () => {
    stubProject({
      areaId: 3,
      config: { uniqueId: 'abc', resources: {} },
      emailConfig: { from: 'x@y.nl' },
      hostStatus: { ip: true },
      title: 'Bron',
    });
    db.Widget.findAll = vi
      .fn()
      .mockResolvedValue([instance({ id: 10, projectId: 2, type: 'likes' })]);
    db.Tag.findAll = vi.fn().mockResolvedValue([]);
    db.Status.findAll = vi.fn().mockResolvedValue([]);
    stubResources([instance({ id: 55, projectId: 2, title: 'R', userId: 9 })]);
    db.NotificationTemplate.findAll = vi.fn().mockResolvedValue([]);

    const snapshot = await projectTemplate.buildProjectTemplateSnapshot(2);

    expect(snapshot.title).toBe('Bron');
    expect(snapshot.emailConfig).toEqual({ from: 'x@y.nl' });
    expect(snapshot.config.uniqueId).toBeUndefined();
    expect(snapshot.widgets[0]).toMatchObject({
      originalId: 10,
      type: 'likes',
    });
    expect(snapshot.widgets[0].id).toBeUndefined();
    expect(snapshot.resources[0]).toMatchObject({ originalId: 55 });
    expect(snapshot.resources[0].id).toBeUndefined();
    expect(snapshot.config.resources.canAddNewResources).toBe(true);
    expect(snapshot.skipDefaultStatuses).toBe(true);
  });

  it('keeps only publicly visible choice fields on resources', async () => {
    stubProject({ config: {}, title: 'Bron' });
    db.Widget.findAll = vi.fn().mockImplementation((query) => {
      if (query?.where?.type === 'resourceform') {
        return Promise.resolve([
          {
            id: 20,
            projectId: 2,
            config: {
              items: [
                { fieldKey: 'pub', onlyForModerator: false, type: 'select' },
                { fieldKey: 'secret', onlyForModerator: true, type: 'select' },
                { fieldKey: 'note', onlyForModerator: false, type: 'text' },
                { fieldKey: 'ph', onlyForModerator: false, type: 'phone' },
              ],
            },
          },
        ]);
      }
      return Promise.resolve([]);
    });
    db.Tag.findAll = vi.fn().mockResolvedValue([]);
    db.Status.findAll = vi.fn().mockResolvedValue([]);
    stubResources([
      instance({
        id: 55,
        projectId: 2,
        widgetId: 20,
        extraData: {
          pub: 'keep',
          secret: 'drop',
          note: 'drop',
          ph: 'drop',
          unknown: 'drop',
        },
      }),
    ]);
    db.NotificationTemplate.findAll = vi.fn().mockResolvedValue([]);

    const snapshot = await projectTemplate.buildProjectTemplateSnapshot(2);

    expect(snapshot.resources[0].extraData).toEqual({ pub: 'keep' });
    expect(snapshot.resources[0].resourceFormFieldKeys).toBeUndefined();
    expect(snapshot.resources[0].moderatorOnlyExtraDataKeys).toBeUndefined();
    expect(snapshot.resources[0].resourceFormFieldTypes).toBeUndefined();
  });

  it('drops soft-deleted resources from the snapshot', async () => {
    stubProject({ config: {}, title: 'Bron' });
    db.Widget.findAll = vi.fn().mockResolvedValue([]);
    db.Tag.findAll = vi.fn().mockResolvedValue([]);
    db.Status.findAll = vi.fn().mockResolvedValue([]);
    stubResources([
      instance({ id: 1, projectId: 2, deletedAt: '2026-01-01' }),
      instance({ id: 2, projectId: 2 }),
    ]);
    db.NotificationTemplate.findAll = vi.fn().mockResolvedValue([]);

    const snapshot = await projectTemplate.buildProjectTemplateSnapshot(2);

    expect(snapshot.resources).toHaveLength(1);
    expect(snapshot.resources[0].originalId).toBe(2);
  });
});
