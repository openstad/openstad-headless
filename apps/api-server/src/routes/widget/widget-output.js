const fs = require('fs');
const path = require('path');
const config = require('config');

const reactCheck = require('../../util/react-check');

const ALLOWED_WIDGET_FILE_EXT = ['.js', '.css'];

// Widget file names originate from static widgetDefinitions, but are treated as
// untrusted (the scanner sees them as DB-influenced). Only allow plain relative
// .js/.css paths so a crafted name can't traverse the filesystem.
function assertSafeWidgetFile(file) {
  if (
    typeof file !== 'string' ||
    file.includes('..') ||
    file.startsWith('/') ||
    !ALLOWED_WIDGET_FILE_EXT.some((ext) => file.endsWith(ext))
  ) {
    throw new Error(`Unsafe widget file path rejected: ${file}`);
  }
}

// Builds the IIFE javascript that is served for a widget. Kept free of any
// database dependencies so it can be unit tested in isolation.
function getWidgetJavascriptOutput(
  widgetSettings,
  widgetType,
  componentId,
  widgetConfig,
  allowedDomains,
  isPreview = false
) {
  // If we include remix icon in the components, we are sending a lot of data to the client
  // By using a CDN and loading it through a <link> tag, we reduce the size of the response and leverage browser cache

  let output = '';
  let widgetOutput = '';
  let css = '';

  const data = JSON.parse(widgetConfig);

  const apiUrl = process.env.URL ?? '';

  // TODO: Fix this, it's a hack to get the ChoiceGuide to work
  if (widgetSettings.componentName === 'ChoiceGuide') {
    widgetSettings.js.forEach((file) => {
      assertSafeWidgetFile(file);
      const filePath = path.resolve(
        __dirname,
        '../../../../../packages/choiceguide',
        file
      );
      if (!fs.existsSync(filePath)) {
        console.error(`JS file not found: ${filePath}`);
      } else {
        widgetOutput += fs.readFileSync(filePath, 'utf8');
      }
    });

    widgetSettings.css.forEach((file) => {
      assertSafeWidgetFile(file);
      const filePath = path.resolve(
        __dirname,
        '../../../../../packages/choiceguide',
        file
      );
      if (!fs.existsSync(filePath)) {
        console.error(`CSS file not found: ${filePath}`);
      } else {
        css += fs.readFileSync(filePath, 'utf8');
      }
    });
  } else if (widgetSettings.componentName === 'DistributionModule') {
    widgetSettings.js.forEach((file) => {
      assertSafeWidgetFile(file);
      const filePath = path.resolve(
        __dirname,
        '../../../../../packages/distribution-module',
        file
      );
      if (!fs.existsSync(filePath)) {
        console.error(`JS file not found: ${filePath}`);
      } else {
        widgetOutput += fs.readFileSync(filePath, 'utf8');
      }
    });

    widgetSettings.css.forEach((file) => {
      assertSafeWidgetFile(file);
      const filePath = path.resolve(
        __dirname,
        '../../../../../packages/distribution-module',
        file
      );
      if (!fs.existsSync(filePath)) {
        console.error(`CSS file not found: ${filePath}`);
      } else {
        css += fs.readFileSync(filePath, 'utf8');
      }
    });
  } else if (widgetSettings.componentName === 'MultiProjectResourceOverview') {
    widgetSettings.js.forEach((file) => {
      assertSafeWidgetFile(file);
      const filePath = path.resolve(
        __dirname,
        '../../../../../packages/multi-project-resource-overview',
        file
      );
      if (!fs.existsSync(filePath)) {
        console.error(`JS file not found: ${filePath}`);
      } else {
        widgetOutput += fs.readFileSync(filePath, 'utf8');
      }
    });

    widgetSettings.css.forEach((file) => {
      assertSafeWidgetFile(file);
      const filePath = path.resolve(
        __dirname,
        '../../../../../packages/multi-project-resource-overview',
        file
      );
      if (!fs.existsSync(filePath)) {
        console.error(`CSS file not found: ${filePath}`);
      } else {
        css += fs.readFileSync(filePath, 'utf8');
      }
    });
  } else {
    widgetSettings.js.forEach((file) => {
      assertSafeWidgetFile(file);
      widgetOutput += fs.readFileSync(
        require.resolve(`${widgetSettings.packageName}/${file}`),
        'utf8'
      );
    });

    widgetSettings.css.forEach((file) => {
      assertSafeWidgetFile(file);
      css += fs.readFileSync(
        require.resolve(`${widgetSettings.packageName}/${file}`),
        'utf8'
      );
    });
  }

  // End of to do

  // Rewrite the url to the images that we serve statically
  css = css.replaceAll(
    'url(../images/',
    `url(${config.url}/widget/${widgetType}-images/`
  );

  const widgetConfigWithCorrectEscapes = widgetConfig
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`');

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
          currentScript.insertAdjacentHTML('afterend', \`<div class="openstad" id="\${randomComponentId}"></div>\`);

          ${
            allowedDomains && allowedDomains.length > 0
              ? `
          const allowedHosts = ${JSON.stringify(allowedDomains)};
          const currentHostname = window.location.hostname;
          function stripWww(d) { return d && d.startsWith('www.') ? d.slice(4) : d; }
          var normalizedHost = stripWww(currentHostname);
          const domainAllowed = allowedHosts.some(function(host) {
            return normalizedHost === stripWww(host.split(':')[0]);
          });

          if (!domainAllowed) {
            try {
              fetch(currentScript.src.split('?')[0] + '/report-block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: currentHostname, referer: window.location.href }),
                credentials: 'omit',
              }).catch(function() {});
            } catch(e) {}
            var warningEl = document.getElementById(randomComponentId);
            if (warningEl) {
              warningEl.innerHTML = '<div style="border: 2px solid #f59e0b; background-color: #fffbeb; border-radius: 8px; padding: 16px 20px; font-family: sans-serif; color: #92400e; margin: 12px 0;">' +
                '<strong style="font-size: 16px;">OpenStad widget kan niet worden geladen</strong>' +
                '<p style="margin: 8px 0 0 0; font-size: 14px;">Deze website (<strong>' + currentHostname + '</strong>) staat niet in de lijst met toegestane websites voor dit project. ' +
                'Voeg dit domein toe in het OpenStad admin-panel onder Instellingen &gt; Toegestane websites.</p></div>';
            }
            console.error('OpenStad: widget kan niet laden op ' + currentHostname + ' (domein niet toegestaan)');
            currentScript.remove();
            return;
          }
          `
              : ''
          }

          ${
            isPreview
              ? ''
              : `
          try {
            var reportLoadUrl = currentScript.src.split('?')[0] + '/report-load';
            var reportLoadBody = JSON.stringify({ url: window.location.href });
            fetch(reportLoadUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reportLoadBody, credentials: 'omit', keepalive: true }).catch(function(){});
          } catch (e) {}
          `
          }

          const redirectUri = new URL(encodeURI(window.location.href));
          redirectUri.searchParams.delete('openstadlogout');
          redirectUri.searchParams.delete('openstadlogintoken');
          redirectUri.hash = '';

          const config = JSON.parse(\`${widgetConfigWithCorrectEscapes}\`.replaceAll("[[REDIRECT_URI]]", encodeURIComponent(redirectUri.toString())));

          function insertCssLinks(urls) {
            const head = document.querySelector('head');
            const body = document.querySelector('body');
            const firstScript = body ? body.querySelector('script') : null;

            urls.forEach(urlObj => {
              const url = urlObj?.url;
              const loadFirst = urlObj?.loadFirst;

              const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href);
              if (!existingLinks.includes(url)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;

                if (loadFirst === true && head) {
                  head.insertBefore(link, head.firstChild);
                } else if (head) {
                  head.appendChild(link);
                } else if (firstScript) {
                  firstScript.parentNode.insertBefore(link, firstScript);
                } else if (body) {
                  body.appendChild(link);
                }
              }
            });
          }

          function normalizeCssUrls(cssUrls) {
            if (!cssUrls) return [];

            if (typeof cssUrls === 'string') {
              return [{ 'url': cssUrls, 'loadFirst': false }];
            }

            if (Array.isArray(cssUrls)) {
              return cssUrls.map(url => ({
                'url': url,
                'loadFirst': false
              }));
            }

            if (typeof cssUrls === 'object') {
              return Object.values(cssUrls).map(url => ({
                'url': url,
                'loadFirst': false
              }));
            }

            return [];
          }

          let customCssUrls = normalizeCssUrls(config.project?.cssUrl);

          let customCss = '';
          if (config.project?.cssCustom) {
            const customCssUrl = '${apiUrl}/api/project/' + config.projectId + '/css/' + randomComponentId;
            customCssUrls.push({url: customCssUrl, loadFirst: false});
          }

          customCssUrls.push({url: "${apiUrl}/api/project/" + config.projectId + "/widget-css/${widgetType}", loadFirst: true});

          insertCssLinks(customCssUrls);

          function renderWidget () {

            // Check if widget has already been rendered
            if (renderedWidgets[randomComponentId]) {
              return;
            }

            renderedWidgets[randomComponentId] = true;

            const React = window.OpenStadReact;
            const ReactDOM = window.OpenStadReactDOM;

            ${widgetOutput}
            ${widgetSettings.functionName}.${widgetSettings.componentName}.loadWidget(randomComponentId, config);
          }

          ${reactCheck(apiUrl)}
          currentScript.remove();
      } catch(e) {
        console.error("Could not place widget", e);
      }
    })();
    `;
  return output;
}

module.exports = { getWidgetJavascriptOutput };
