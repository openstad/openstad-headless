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
  const loginUrlAnonymous = `${config.url}/auth/project/${project.id}/login?useAuth=anonymous&forceNewLogin=1&redirectUri=[[REDIRECT_URI]]`;
  const logoutUrl = `${config.url}/auth/project/${project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

  let url = process.env.IMAGE_APP_URL;

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
    imageUrl: protocol + url,
  };

  if (widgetType == 'resourcedetailmap' || widgetType ==  'resourcesmap' || widgetType ==  'editormap' || widgetType ==  'resourceform') {
    result.area = project.area?.polygon
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
  widgetId
) {
  
  // Move general settings to the root to ensure we have the correct config
  if (widgetConfig.hasOwnProperty('general')) {
    widgetConfig = {...widgetConfig, ...widgetConfig.general};
  }
  
  let config = merge.recursive(
    {},
    widgetSettings.Config,
    defaultConfig,
    projectConfig,
    widgetConfig,
    { widgetId }
  );

  config = JSON.stringify(config)

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

  const extraCssFile = data.project?.cssUrl ? `<link href="${data.project.cssUrl}" rel="stylesheet">` : '';
  const apiUrl = process.env.URL ?? '';






  // TODO: Fix this, it's a hack to get the ChoiceGuide to work
  if ( widgetSettings.componentName === 'ChoiceGuide' ) {

    widgetSettings.js.forEach((file) => {
      const filePath = path.resolve(__dirname, '../../../../../packages/choiceguide', file);
      if (!fs.existsSync(filePath)) {
        console.error(`JS file not found: ${filePath}`);
      } else {
        widgetOutput += fs.readFileSync(filePath, 'utf8');
      }
    });

    widgetSettings.css.forEach((file) => {
      const filePath = path.resolve(__dirname, '../../../../../packages/choiceguide', file);
      if (!fs.existsSync(filePath)) {
        console.error(`CSS file not found: ${filePath}`);
      } else {
        css += fs.readFileSync(filePath, 'utf8');
      }
    });

  } else {
    widgetSettings.js.forEach((file) => {
      console.log(`${widgetSettings.packageName}/${file}`);
      console.log(require.resolve(`${widgetSettings.packageName}/${file}`));
      widgetOutput += fs.readFileSync(require.resolve(`${widgetSettings.packageName}/${file}`), 'utf8');
    });

    widgetSettings.css.forEach((file) => {
      css += fs.readFileSync(require.resolve(`${widgetSettings.packageName}/${file}`), 'utf8');
    });
  }

  // End of to do





  // Rewrite the url to the images that we serve statically
  css = css.replaceAll(
    'url(../images/',
    `url(${config.url}/widget/${widgetType}-images/`
  );

  const widgetConfigWithCorrectEscapes = widgetConfig.replaceAll('\\', '\\\\').replaceAll('`', '\\`');
  
  // Create function to render component
  // The process.env.NODE_ENV is set to production, otherwise some React dependencies will not work correctly
  // @todo: find a way around this so we don't have to provide the `process` variable
  output += `
    (function () {
      try {
        let process = { env: { NODE_ENV: 'production' } };
        
        const randomComponentId = '${componentId}-' + Math.floor(Math.random() * 1000000);
        const renderedWidgets = {};
        
        const currentScript = document.currentScript;
          currentScript.insertAdjacentHTML('afterend', \`<div id="\${randomComponentId}"></div>\`);

          const redirectUri = encodeURI(window.location.href);
          
          const config = JSON.parse(\`${widgetConfigWithCorrectEscapes}\`.replaceAll("[[REDIRECT_URI]]", redirectUri));
          let customCss = '';
          
          if (config.project.cssCustom) {
            const customCssUrl = '${apiUrl}/api/project/' + config.projectId + '/css/' + randomComponentId;
            customCss = \`<link href ="\${customCssUrl}" rel ="stylesheet">\`;
          }
          
          document.querySelector('head').innerHTML += \`
            <link href="${remixIconCss}" rel="stylesheet">
            <link href="${apiUrl}/api/project/\${config.projectId}/widget-css/${widgetType}" rel="stylesheet">
            ${extraCssFile}
            \${customCss}
          \`;
          
          function renderWidget () {
            
            // Check if widget has already been rendered
            if (renderedWidgets[randomComponentId]) {
              return;
            }
            
            renderedWidgets[randomComponentId] = true;
            
            ${widgetOutput}
            ${widgetSettings.functionName}.${widgetSettings.componentName}.loadWidget(randomComponentId, config);
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
