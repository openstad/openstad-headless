const express = require('express');
const merge = require('merge');
const bruteForce = require('../../middleware/brute-force');
const db = require('../../db');
const fs = require('fs');
const config = require('config');
const path = require('path');
const createError = require('http-errors');

const getWidgetSettings = require('./widget-settings');
const widgetDefinitions = getWidgetSettings();

const reactCheck = require('../../util/react-check');

let router = express.Router({ mergeParams: true });

// brute force
router.use(bruteForce.globalMiddleware);

// Configured route allows us to send a widget config through the `Widget-Config` header
// This route is used to show a preview of a widget in the admin
// The `Widget-Config` header must include a `widgetType` key, matching a widget type in the `widgetDefinitions` object
// All keys except for `widgetType` will be passed to the widget as config
router
  .route('/preview')
  .all((req, res, next) => {
    const config = req.header('Widget-Config');
    if (!config) {
      return next(createError(401, 'No widget config provided'));
    }

    try {
      req.widgetConfig = JSON.parse(config);
    } catch (e) {
      return next(createError(401, 'Invalid widget config provided'));
    }

    if (!req.widgetConfig.widgetType) {
      return next(createError(401, 'No widget type provided'));
    }

    return next();
  })
  .get(async (req, res, next) => {
    const projectId = req.query.projectId;
    const widgetId = Math.floor(Math.random() * 1000000);
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
        req.widgetConfig
      );

      res.header('Content-Type', 'application/javascript');
      res.send(output);
    } catch (e) {
      
      // Temp log for use in k9s
      console.error({widgetBuildError: e});
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
        if (!found) throw new Error('Widget not found');
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

    const defaultConfig = getDefaultConfig(widget.project, widget.type);

    try {
      const output = setConfigsToOutput(
        widget.type,
        componentId,
        widgetSettings,
        defaultConfig,
        widget.project.safeConfig,
        widget.config,
        widgetId
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
          require.resolve(`${widgetDefinitions[widget].packageName}/package.json`),
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
  const logoutUrl = `${config.url}/auth/project/${project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

  let result = {
    api: {
      url: config.url,
    },
    login: {
      url: loginUrl,
    },
    logout: {
      url: logoutUrl,
    },
    projectId: project.id,
  };

  if (widgetType == 'resourcedetailmap' || widgetType ==  'resourcesmap' || widgetType ==  'editormap') {
    result.area = project.area?.polygon
  }

  console.log('==========');
  console.log(widgetType);
  console.log(project);

  return result;

}

function setConfigsToOutput(
  widgetType,
  componentId,
  widgetSettings,
  defaultConfig,
  projectConfig,
  widgetConfig,
  widgetId
) {
  let config = merge.recursive(
    {},
    widgetSettings.Config,
    defaultConfig,
    projectConfig,
    widgetConfig,
    { widgetId }
  );

  config = JSON.stringify(config)
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`');

  return getWidgetJavascriptOutput(
    widgetSettings,
    widgetType,
    componentId,
    config
  );
}

function getWidgetJavascriptOutput(
  widgetSettings,
  widgetType,
  componentId,
  widgetConfig
) {
  // If we include remix icon in the components, we are sending a lot of data to the client
  // By using a CDN and loading it through a <link> tag, we reduce the size of the response and leverage browser cache
  const remixIconCss =
    process.env.REMIX_ICON_CDN ||
    'https://unpkg.com/remixicon@3.5.0/fonts/remixicon.css';

  let output = '';
  let widgetOutput = '';
  let css = '';

  const data = JSON.parse(widgetConfig)
  const extraCss = data.project?.cssUrl ? `<link href="${data.project.cssUrl}" rel="stylesheet">` : '';
  
  widgetSettings.js.forEach((file) => {
    widgetOutput += fs.readFileSync(require.resolve(`${widgetSettings.packageName}/${file}`), 'utf8');
  });

  widgetSettings.css.forEach((file) => {
    css += fs.readFileSync(require.resolve(`${widgetSettings.packageName}/${file}`), 'utf8');
  });

  // Rewrite the url to the images that we serve statically
  css = css.replaceAll(
    'url(../images/',
    `url(${config.url}/widget/${widgetType}-images/`
  );

  // Create function to render component
  // The process.env.NODE_ENV is set to production, otherwise some React dependencies will not work correctly
  // @todo: find a way around this so we don't have to provide the `process` variable
  output += `
    (function () {
      try {
        let process = { env: { NODE_ENV: 'production' } };

        const currentScript = document.currentScript;
          currentScript.insertAdjacentHTML('afterend', \`<div id="${componentId}" style="width: 100%; height: 100%;"></div>\`);

          const redirectUri = encodeURI(window.location.href);
          const config = JSON.parse(\`${widgetConfig}\`.replaceAll("[[REDIRECT_URI]]", redirectUri));
          
          document.querySelector('head').innerHTML += \`
            <style>${css}</style>
            <link href="${remixIconCss}" rel="stylesheet">
            ${extraCss}
          \`;
          
          function renderWidget () {
            ${widgetOutput}
            ${widgetSettings.functionName}.${widgetSettings.componentName}.loadWidget('${componentId}', config);
          }
          
          ${reactCheck}
          currentScript.remove();
      } catch(e) {
        console.error("Could not place widget", e);
      }
    })();
    `;
  return output;
}

module.exports = router;
