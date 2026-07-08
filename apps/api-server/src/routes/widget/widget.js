const express = require('express');
const merge = require('merge');
const bruteForce = require('../../middleware/brute-force');
const db = require('../../db');
const config = require('config');
const path = require('path');
const createError = require('http-errors');

const getWidgetSettings = require('./widget-settings');
const widgetDefinitions = getWidgetSettings();

const { getWidgetJavascriptOutput } = require('./widget-output');
const prefillAllowedDomains = require('../../services/prefillAllowedDomains');
const {
  normalizeWidgetUrl,
  hashWidgetUrl,
  recordWidgetLoad,
} = require('../../services/normalize-widget-url');

let router = express.Router({ mergeParams: true });

// brute force
router.use(bruteForce.globalMiddleware);

// Configured route allows us to send a widget config through the `Widget-Config` header
// This route is used to show a preview of a widget in the admin
// The `Widget-Config` header must include a `widgetType` key, matching a widget type in the `widgetDefinitions` object
// All keys except for `widgetType` will be passed to the widget as config
router
  .route('/preview')
  .post(async (req, res, next) => {
    req.widgetConfig = req.body;
    return next();
  })
  .all((req, res, next) => {
    if (!req.widgetConfig) {
      return next(createError(401, 'No widget config provided'));
    }

    if (!req.widgetConfig.widgetType) {
      return next(createError(401, 'No widget type provided'));
    }

    return next();
  })
  .post(async (req, res, next) => {
    const projectId = req.query.projectId;
    const widgetId =
      req.widgetConfig.widgetId || Math.floor(Math.random() * 1000000);
    const randomId = Math.floor(Math.random() * 1000000);
    const componentId = `osc-component-${widgetId}-${randomId}`;
    const widgetType = req.widgetConfig.widgetType;

    const widgetDefinitions = getWidgetSettings();
    let widgetSettings = widgetDefinitions[widgetType];

    if (!widgetSettings) {
      return next(
        createError(400, 'Invalid widget type given for fetching settings')
      );
    }

    // Remove widgetType from config, but pass all other keys to the widget
    delete req.widgetConfig.widgetType;
    let projectConfig = {};
    let defaultConfig = {};

    if (projectId) {
      try {
        const project = await db.Project.scope('includeAreas').findOne({
          where: {
            id: projectId,
          },
        });

        if (project) {
          projectConfig = project.safeConfig;
        } else {
          createError(404, 'Could not find the project belonging to given id');
        }
        defaultConfig = getDefaultConfig(project, widgetType);
      } catch (e) {
        console.log(e);
        return next(createError(500, 'Could not fetch the project'));
      }
    }

    try {
      const output = setConfigsToOutput(
        widgetType,
        componentId,
        widgetSettings,
        defaultConfig,
        projectConfig,
        req.widgetConfig,
        widgetId,
        null,
        true // isPreview: never report widget loads from the admin preview
      );

      res.header('Content-Type', 'application/javascript');
      res.send(output);
    } catch (e) {
      // Temp log for use in k9s
      console.error({ widgetBuildError: e });
      return next(
        createError(
          500,
          'Something went wrong when trying to create the widget script '
        )
      );
    }
  });

router
  .route('/:widgetId([a-zA-Z0-9]+)')
  .all((req, res, next) => {
    if (!req.params?.widgetId) {
      return next(createError(401, 'No widget id provided'));
    }

    db.Widget.findOne({
      where: { id: req.params.widgetId },
      include: [db.Project.scope('includeAreas')],
    })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'Widget not found'));
        }
        req.widget = found;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const widgetId = req.params.widgetId;
    const randomId = Math.floor(Math.random() * 1000000);
    const componentId = `osc-component-${widgetId}-${randomId}`;
    const widget = req.widget;
    const widgetDefinitions = getWidgetSettings();
    const widgetSettings = widgetDefinitions[widget.type];

    if (!widgetSettings) {
      return next(
        createError(400, 'Invalid widget type given for fetching settings')
      );
    }

    const projectDomains = widget.project.config.allowedDomains || [];
    const hasProjectDomains = projectDomains.length > 0 || !!widget.project.url;

    const allowedDomains = hasProjectDomains
      ? prefillAllowedDomains(projectDomains, widget.project.url)
      : null;

    const defaultConfig = getDefaultConfig(widget.project, widget.type);

    try {
      const output = setConfigsToOutput(
        widget.type,
        componentId,
        widgetSettings,
        defaultConfig,
        widget.project.safeConfig,
        widget.config,
        widgetId,
        allowedDomains
      );

      res.header('Content-Type', 'application/javascript');
      res.send(output);
    } catch (e) {
      console.log(e);
      return next(
        createError(
          500,
          'Something went wrong when trying to create the widget script'
        )
      );
    }
  });

// Add a static route for the images used in the CSS in each of the widgets
Object.keys(widgetDefinitions).forEach((widget) => {
  if (!widgetDefinitions[widget].css) return;

  try {
    router.use(
      `/${widget}-images`,
      express.static(
        path.resolve(
          require.resolve(
            `${widgetDefinitions[widget].packageName}/package.json`
          ),
          '../../images/'
        )
      )
    );
  } catch (e) {
    console.log(
      `Could not find package.json [${widgetDefinitions[widget].packageName}/package.json] for widget [${widget}].`
    );
  }
});

function getDefaultConfig(project, widgetType) {
  const loginUrl = `${config.url}/auth/project/${project.id}/login?useAuth=default&forceNewLogin=1&redirectUri=[[REDIRECT_URI]]`;
  const loginUrlAnonymous = `${config.url}/auth/project/${project.id}/login?useAuth=anonymous&forceNewLogin=1&redirectUri=[[REDIRECT_URI]]`;
  const logoutUrl = `${config.url}/auth/project/${project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

  let url = process.env.IMAGE_APP_URL;
  let zipCodeAutofillApiUrl = process.env.ZIPCODE_AUTOFILL_API_URL;
  let zipCodeApiUrl = process.env.ZIPCODE_API_URL;

  let protocol = '';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
  }

  let result = {
    api: {
      url: config.url,
    },
    login: {
      url: loginUrl,
      anonymous: {
        url: loginUrlAnonymous,
      },
    },
    logout: {
      url: logoutUrl,
    },
    projectId: project.id,
    imageUrl: config.url + `/api/project/${project.id}/upload`,
    zipCodeApiUrl: zipCodeApiUrl || '',
    zipCodeAutofillApiUrl: zipCodeAutofillApiUrl || '',
    serverTime: new Date().toISOString(),
    randomSortRotationMs: Number(process.env.RANDOM_SORT_ROTATION_MS) || 0,
  };

  if (
    widgetType == 'resourcedetailmap' ||
    widgetType == 'resourcesmap' ||
    widgetType == 'editormap' ||
    widgetType == 'resourceform'
  ) {
    result.area = project.area?.polygon;
  }

  return result;
}

function setConfigsToOutput(
  widgetType,
  componentId,
  widgetSettings,
  defaultConfig,
  projectConfig,
  widgetConfig,
  widgetId,
  allowedDomains,
  isPreview = false
) {
  // Move general settings to the root to ensure we have the correct config
  if (widgetConfig.hasOwnProperty('general')) {
    widgetConfig = { ...widgetConfig, ...widgetConfig.general };
  }

  let config = merge.recursive(
    true,
    {},
    widgetSettings.defaultConfig || {},
    defaultConfig,
    projectConfig,
    widgetConfig,
    { widgetId }
  );

  config = JSON.stringify(config);

  return getWidgetJavascriptOutput(
    widgetSettings,
    widgetType,
    componentId,
    config,
    allowedDomains,
    isPreview
  );
}

const reportBlockCooldowns = new Map();
const REPORT_BLOCK_COOLDOWN_MS = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of reportBlockCooldowns) {
    if (now - timestamp > REPORT_BLOCK_COOLDOWN_MS) {
      reportBlockCooldowns.delete(key);
    }
  }
}, 60 * 1000);

router.post('/:widgetId([a-zA-Z0-9]+)/report-block', async (req, res) => {
  const { widgetId } = req.params;
  const { domain, referer } = req.body || {};

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Missing domain' });
  }

  const cooldownKey = `${widgetId}:${domain}`;
  const lastReport = reportBlockCooldowns.get(cooldownKey);
  if (lastReport && Date.now() - lastReport < REPORT_BLOCK_COOLDOWN_MS) {
    return res.status(200).json({ ok: true });
  }
  reportBlockCooldowns.set(cooldownKey, Date.now());

  try {
    const widget = await db.Widget.findOne({
      where: { id: widgetId },
      include: [db.Project],
    });

    if (!widget || !widget.project) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const record = await db.DomainBlock.findOne({
      where: {
        projectId: widget.project.id,
        widgetId: parseInt(widgetId),
        domain: domain.substring(0, 255),
      },
    });

    if (record) {
      await record.update({
        count: record.count + 1,
        lastSeen: new Date(),
        referer: referer ? String(referer).substring(0, 2048) : record.referer,
      });
    } else {
      await db.DomainBlock.create({
        projectId: widget.project.id,
        widgetId: parseInt(widgetId),
        domain: domain.substring(0, 255),
        referer: referer ? String(referer).substring(0, 2048) : '',
      });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.log('[widget] Could not save domain block:', e.message);
    res.status(500).json({ error: 'Could not save domain block' });
  }
});

const reportLoadCooldowns = new Map();
const REPORT_LOAD_COOLDOWN_MS = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of reportLoadCooldowns) {
    if (now - timestamp > REPORT_LOAD_COOLDOWN_MS) {
      reportLoadCooldowns.delete(key);
    }
  }
}, 60 * 1000);

router.post('/:widgetId([a-zA-Z0-9]+)/report-load', async (req, res) => {
  const { widgetId } = req.params;
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url' });
  }

  const normalizedUrl = normalizeWidgetUrl(url);
  if (!normalizedUrl) {
    return res.status(400).json({ error: 'Invalid url' });
  }

  const cooldownKey = `${widgetId}:${hashWidgetUrl(normalizedUrl)}`;
  const lastReport = reportLoadCooldowns.get(cooldownKey);
  if (lastReport && Date.now() - lastReport < REPORT_LOAD_COOLDOWN_MS) {
    return res.status(200).json({ ok: true });
  }
  reportLoadCooldowns.set(cooldownKey, Date.now());

  try {
    const result = await recordWidgetLoad(db, { widgetId, rawUrl: url });

    if (result.status === 'not-found') {
      return res.status(404).json({ error: 'Widget not found' });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.log('[widget] Could not save widget load:', e.message);
    res.status(500).json({ error: 'Could not save widget load' });
  }
});

module.exports = router;
