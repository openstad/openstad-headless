const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const db = require('../../db');
const fs = require('fs');
const config = require('config');
const path = require('path');
const createError = require('http-errors');

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
    const widget = req.widget;

    // @todo: add all widgets
    const widgetSettingsMapping = {
      arguments: {
        js: ['comments.js'],
        css: ['css/comments.css'],
        name: 'Comments',
        defaultConfig: {
          ideaId: null,
          title: '[[nr]] reacties voor',
          isClosed: widget.project?.config?.arguments?.isClosed || true,
          closedText: 'Het inzenden van reacties is niet langer mogelijk',
          isVotingEnabled: false,
          isReplyingEnabled: false,
          descriptionMinLength:
            widget.project?.config?.arguments?.descriptionMinLength || '2',
          descriptionMaxLength:
            widget.project?.config?.arguments?.descriptionMaxLength || '1000',
          placeholder: 'Voer hier uw reactie in',
          formIntro: '',
        },
      },
    };

    const widgetSettings = widgetSettingsMapping[widget.type];

    let output = '';
    let widgetOutput = '';
    let css = '';

    [widgetSettings.js].forEach((file) => {
      widgetOutput += fs.readFileSync(
        require.resolve(`@openstad/components/dist/${file}`),
        'utf8'
      );
    });

    [widgetSettings.css].forEach((file) => {
      css += fs.readFileSync(
        require.resolve(`@openstad/components/dist/${file}`),
        'utf8'
      );
    });

    css = css.replaceAll('url(../images/', `url(${config.url}/widget/images/`);

    const componentId = `osc-component-${widgetId}-${randomId}`;

    const loginUrl = `${config.url}/auth/project/${widget.project.id}/login?useAuth=default&redirectUri=[[REDIRECT_URI]]`;
    const logoutUrl = `${config.url}/auth/project/${widget.project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

    const defaultConfig = {
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
      ...widget.config.general,
      ...widget.config.list,
      ...widget.config.form,
    });

    const reactCheck = require('../../util/react-check');

    // Create function to render component
    output += `
    (function () {
      const currentScript = document.currentScript;
      window.addEventListener('load', function (e) {
        currentScript.insertAdjacentHTML('afterend', \`<div id="${componentId}"></div>\`);
        
        document.querySelector('head').innerHTML += \`<style>${css}</style>\`;
        
        const redirectUri = encodeURI(window.location.href);
        const config = JSON.parse('${widgetConfig}'.replaceAll("[[REDIRECT_URI]]", redirectUri));
        
        function renderWidget () {
          ${widgetOutput}
          OS20['${widgetSettings.name}'].loadWidget('${componentId}', { config });
        }
        
        ${reactCheck}
        
        currentScript.remove();
      });
    })();
    `;

    res.header('Content-Type', 'application/javascript');

    res.send(output);
  });

// @todo: this path resolve w/ require resolve feels really hacky, get the path in a better way
router.use(
  '/images',
  express.static(
    path.resolve(
      require.resolve(`@openstad/components/dist/index.js`),
      '../images/'
    )
  )
);

module.exports = router;
