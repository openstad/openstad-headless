const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const db = require('../../db');
const fs = require('fs');
const config = require('config');
const path = require('path');
const createError = require('http-errors');
const flattenObject = require('../../util/flatten-object');
const widgetSettingsMapping = require('./widget-settings');
const reactCheck = require('../../util/react-check');

let router = express.Router({ mergeParams: true });

// brute force
router.use(bruteForce.globalMiddleware);

router
  .route('/:widgetId([a-zA-Z0-9]+)')
  .all((req, res, next) => {
    if (!req.params?.widgetId) {
      return next(createError(401, 'No widget id provided'));
    }

    db.Widget.findOne({
      where: { id: req.params.widgetId },
      include: ['project'],
    })
      .then((found) => {
        if (!found) throw new Error('Widget not found');
        req.widget = found;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    const widgetId = req.params.widgetId;
    const randomId = Math.floor(Math.random() * 1000000);
    const componentId = `osc-component-${widgetId}-${randomId}`;
    const widget = req.widget;
    const widgetSettings = widgetSettingsMapping[widget.type];
    
    // If we include remix icon in the components, we are sending a lot of data to the client
    // By using a CDN and loading it through a <link> tag, we reduce the size of the response and leverage browser cache
    const remixIconCss = process.env.REMIX_ICON_CDN || "https://unpkg.com/remixicon@3.5.0/fonts/remixicon.css"

    let output = '';
    let widgetOutput = '';
    let css = '';

    widgetSettings.js.forEach((file) => {
      widgetOutput += fs.readFileSync(
        require.resolve(file),
        'utf8'
      );
    });

    widgetSettings.css.forEach((file) => {
      css += fs.readFileSync(
        require.resolve(file),
        'utf8'
      );
    });

    // Rewrite the url to the images that we serve statically
    css = css.replaceAll('url(../images/', `url(${config.url}/widget/${widget.type}-images/`);

    const loginUrl = `${config.url}/auth/project/${widget.project.id}/login?useAuth=default&redirectUri=[[REDIRECT_URI]]`;
    const logoutUrl = `${config.url}/auth/project/${widget.project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

    const defaultConfig = {
      ...widget.project.config,
      api: {
        url: config.url,
      },
      login: {
        url: loginUrl,
      },
      logout: {
        url: logoutUrl,
      },
      projectId: widget.project.id,
      ...widgetSettings.defaultConfig,
    };
    
    const widgetConfig = JSON.stringify({
      ...defaultConfig,
      ...flattenObject(widget.config)
    });

    // Create function to render component
    // The process.env.NODE_ENV is set to production, otherwise some React dependencies will not work correctly
    // @todo: find a way around this so we don't have to provide the `process` variable
    output += `
    let process = { env: { NODE_ENV: 'production' } };
    (function () {
      const currentScript = document.currentScript;
      window.addEventListener('load', function (e) {
        currentScript.insertAdjacentHTML('afterend', \`<div id="${componentId}"></div>\`);
        
        document.querySelector('head').innerHTML += \`
          <style>${css}</style>
          <link href="${remixIconCss}" rel="stylesheet">
        \`;
        
        const redirectUri = encodeURI(window.location.href);
        const config = JSON.parse(\`${widgetConfig}\`.replaceAll("[[REDIRECT_URI]]", redirectUri));
        
        function renderWidget () {
          ${widgetOutput}
          
          ${widgetSettings.functionName}.${widgetSettings.componentName}.loadWidget('${componentId}', { config });
        }
        
        ${reactCheck}
        
        currentScript.remove();
      });
    })();
    `;

    res.header('Content-Type', 'application/javascript');
    res.send(output);
  });

// Add a static route for the images used in the CSS of the widgets
Object.keys(widgetSettingsMapping).forEach((widget) => {
  
  if (!widgetSettingsMapping[widget].css) return;
  
  router.use(
    `/${widget}-images`,
    express.static(
      path.resolve(
        require.resolve(widgetSettingsMapping[widget].css[0]),
        '../../images/'
      )
    )
  );
  
});

module.exports = router;
