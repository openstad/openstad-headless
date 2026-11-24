import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const widgetRouter = require('./widget');
const getWidgetSettings = require('../widget/widget-settings');

const PROJECT_ID = 1;
let created = null;

db.Project.scope = () => ({
  findOne: async () => ({ id: PROJECT_ID }),
});
db.Widget.scope = () => ({
  findAndCountAll: async () => ({ rows: [], count: 0 }),
});
db.Widget.create = async (values) => {
  created = values;
  return values;
};

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { role: 'editor', id: 10 };
    req.project = { id: PROJECT_ID, config: {} };
    req.dbQuery = {};
    next();
  });
  app.use('/project/:projectId(\\d+)/widgets', widgetRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

function createWidget(type) {
  return request(createApp())
    .post(`/project/${PROJECT_ID}/widgets`)
    .send({ type, description: 'Nieuw' });
}

describe('config of a new widget', () => {
  beforeEach(() => {
    created = null;
  });

  it('stores the initial config on top of the default config', async () => {
    const res = await createWidget('likes');

    expect(res.status).toBe(200);
    expect(created.config).toMatchObject({
      projectId: String(PROJECT_ID),
      variant: 'medium',
      yesLabel: 'Voor',
      noLabel: 'Tegen',
    });
  });

  it('stores only the default config for a type without initial config', async () => {
    await createWidget('agenda');

    expect(created.config).toEqual({
      resourceId: null,
      projectId: String(PROJECT_ID),
    });
  });

  const likeSettings = {
    title: 'Wat vind jij?',
    yesLabel: 'Voor',
    noLabel: 'Tegen',
    displayDislike: true,
    showProgressBar: false,
  };
  const commentSettings = {
    itemsPerPage: 30,
    defaultSorting: 'createdAt_desc',
  };

  it.each([
    ['likes', likeSettings],
    ['comments', commentSettings],
    [
      'resourceoverview',
      {
        displayTitle: true,
        displaySummary: true,
        displayStatusLabel: true,
        displayVote: true,
        titleMaxLength: 50,
        summaryMaxLength: 140,
        descriptionMaxLength: 140,
        displayVariant: 'default',
        bannerText: 'Inzendingen',
        autoApply: true,
        filterBehavior: 'and',
        defaultSorting: 'createdAt_desc',
        likeWidget: likeSettings,
      },
    ],
    [
      'multiprojectresourceoverview',
      {
        defaultSorting: 'createdAt_desc',
        resourceOverviewMapWidget: likeSettings,
      },
    ],
    ['resourcewithmap', { defaultSorting: 'createdAt_desc' }],
    [
      'resourcedetail',
      {
        documentsTitle: 'Downloads',
        documentsDesc:
          'Hieronder vind je downloads die de indiener heeft geüpload bij deze inzending.',
        commentsWidget: commentSettings,
        likeWidget: likeSettings,
      },
    ],
    ['resourcedetailwithmap', { likeWidget: likeSettings }],
    [
      'documentmap',
      {
        ...commentSettings,
        onlyAllowClickOnImage: true,
        largeDoc: true,
        minZoom: -3,
        maxZoom: 3,
        infoPopupButtonText: 'Hoe werkt het?',
        likeWidget: likeSettings,
      },
    ],
    ['distributionmodule', { showProgress: true }],
    [
      'account',
      {
        allowUserEdit: true,
        showLogoutButton: true,
        overview_title: 'Mijn account',
        overview_description:
          'Op deze pagina kun je je gegevens inzien die aan je account gekoppeld zijn, en deze wijzigen.',
        info_title: 'Persoonlijke gegevens',
        info_description:
          "Hieronder vind je de persoonsgegevens die aan je account zijn toegevoegd. Klik op 'Gegevens bewerken' om deze gegevens aan te passen.",
      },
    ],
    [
      'begrootmodule',
      {
        showInfoMenu: true,
        scrollWhenMaxReached: true,
        voteAfterLoggingIn: true,
        displayModBreak: true,
        panelTitle: 'Stem info',
        defaultSorting: 'createdAt_desc',
      },
    ],
    [
      'choiceguide',
      {
        choiceOption: {
          choiceOptions: [{ id: 1, title: 'Optie 1', description: '' }],
        },
      },
    ],
  ])('gives a new %s widget the default settings', async (type, expected) => {
    await createWidget(type);

    expect(created.config).toMatchObject(expected);
  });

  it('gives a new resource form the title, summary and description fields', async () => {
    await createWidget('resourceform');

    const items = created.config.items;
    expect(items.map((item) => item.type)).toEqual([
      'title',
      'summary',
      'description',
    ]);
    expect(items.map((item) => item.trigger)).toEqual(['1', '2', '3']);
    expect(new Set(items.map((item) => item.id)).size).toBe(3);
    items.forEach((item) => {
      expect(item.fieldRequired).toBe(true);
      expect(item.fieldKey).toBe(item.type);
    });
  });

  it('does not change the shared widget definition', async () => {
    await createWidget('likes');
    created.config.yesLabel = 'Gewijzigd';

    const { likes } = getWidgetSettings();
    expect(likes.defaultConfig.yesLabel).toBe('Ja');
    expect(likes.initialConfig.yesLabel).toBe('Voor');
  });
});
