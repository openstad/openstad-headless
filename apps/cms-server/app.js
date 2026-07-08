require('dotenv').config();

const {
  createTelemetry,
  setupGracefulShutdown,
} = require('@openstad-headless/lib/telemetry');
const telemetryManager = createTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME || 'openstad-cms-server',
});
telemetryManager.initialize();
setupGracefulShutdown(telemetryManager);

const apostrophe = require('apostrophe');
const express = require('express');
const app = express();
const _ = require('lodash');
const projectService = require('./services/projects');
const aposConfig = require('./lib/apos-config');
const { refresh } = require('less');
const REFRESH_PROJECTS_INTERVAL = 60000 * 5;
const Url = require('node:url');
const messageStreaming = require('./services/message-streaming');

const compression = require('compression');
const path = require('node:path');
const crypto = require('node:crypto');

let projects = {};
let subscriptions = {};
const apostropheServer = {};

let startUpIsBusy = false;
let startUpQueue = [];

app.set('trust proxy', true);

if (
  !process.env?.DISABLE_RATE_LIMITER ||
  process.env?.DISABLE_RATE_LIMITER !== 'true'
) {
  const rateLimiter = require('@openstad-headless/lib/rateLimiter');
  app.use(rateLimiter());
}

app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use(
  '/widget-assets',
  express.static(path.join(__dirname, 'public', 'widget-assets'))
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/:sitePrefix?/config-reset', async function (req, res, next) {
  await loadProjects();
  next();
});

function createReturnUrl(req, res) {
  // check in url if returnTo params is set for redirecting to page
  // req.session.returnTo = req.query.returnTo ? decodeURIComponent(req.query.returnTo) : null;
  //const thisHost = req.headers['x-forwarded-host'] || req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  let returnUrl =
    protocol +
    '://' +
    req.openstadDomain +
    (req.sitePrefix ? '/' + req.sitePrefix : '');
  if (req.query.returnTo && typeof req.query.returnTo === 'string') {
    // only get the pathname to prevent external redirects
    let pathToReturnTo = Url.parse(req.query.returnTo, true);
    pathToReturnTo = pathToReturnTo.path;
    returnUrl = returnUrl + pathToReturnTo;
  }
  return returnUrl;
}

async function setupProject(project) {
  if (!project.url) return;
  // We are no longer saving the protocol in the database, but we need a
  // protocol to be able to use `Url.parse` to get the host.
  if (
    !project.url.startsWith('http://') &&
    !project.url.startsWith('https://')
  ) {
    const protocol = process.env.FORCE_HTTP === 'yes' ? 'http://' : 'https://';
    project.domain = project.url;
    project.url = protocol + project.url;
  }
  let url = Url.parse(project.url);

  const domain = url.host + (url.path && url.path != '/' ? url.path : '');

  // for convenience and speed we set the domain name as the key
  projects[domain] = project;

  // add event subscription
  if (!subscriptions[project.id]) {
    let subscriber = await messageStreaming.getSubscriber();
    if (subscriber) {
      subscriptions[project.id] = subscriber;
      await subscriptions[project.id].subscribe(
        `project-${project.id}-update`,
        (message) => {
          if (apostropheServer[project.domain]) {
            // restart the server with the new settings
            apostropheServer[project.domain].apos.destroy();
            delete apostropheServer[project.domain];
          }
          loadProject(project.id);
        }
      );
    } else {
      console.log('No subscriber found');
    }
  }
}

async function loadProject(projectId) {
  const project = await projectService.fetchOne(projectId);
  setupProject(project);
}

async function loadProjects() {
  try {
    const allProjects = await projectService.fetchAll();

    projects = {};
    allProjects.forEach(async (project) => {
      setupProject(project);
    });

    // add event subscription
    if (!subscriptions['all']) {
      let subscriber = await messageStreaming.getSubscriber();
      if (subscriber) {
        subscriptions['all'] = subscriber;
        await subscriptions['all'].subscribe(
          `project-urls-update`,
          (message) => {
            loadProjects();
          }
        );
        await subscriptions['all'].subscribe(`new-project`, (message) => {
          loadProjects();
        });
      } else {
        console.log('No subscriber found');
      }
    }

    cleanUpProjects();
  } catch (err) {
    console.log('Error fetching projects:', err);
  }
}

// run through all projects see if anyone is not active anymore and needs to be shut down
function cleanUpProjects() {
  const runningDomains = Object.keys(apostropheServer);

  if (runningDomains) {
    runningDomains.forEach((runningDomain) => {
      if (!projects[runningDomain]) {
        try {
          apostropheServer[runningDomain].apos.destroy();
        } catch (e) {
          console.log('Error stopping project', e);
        }

        delete apostropheServer[runningDomain];
      }
    });
  }
}

async function doStartServer(domain, req, res) {
  if (!apostropheServer[domain]) {
    console.log('Starting up project: ', domain);
    apostropheServer[domain] = await run(domain, projects[domain], {});
    apostropheServer[domain].app.set('trust proxy', true);
    apostropheServer[domain].app(req, res);
    return Promise.resolve();
  }
}

// Generate a session secret based on project details and environment variables
// This ensures the session secret is the same for each restart of this server,
// but different for each project and version of the cms server
async function getSessionSecret(projectUrl, projectId) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;
  const data =
    (process.env.APOS_RELEASE_ID || '') + apiUrl + projectUrl + projectId;
  hash.update(data);

  return hash.digest('hex');
}

async function run(id, projectData, options, callback) {
  // Get host from projectData url
  const url = Url.parse(projectData.url);
  const protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
  projectData.fullUrl = projectData.url;
  projectData.url = protocol + url.hostname + (url.port ? ':' + url.port : '');

  const sessionSecret = await getSessionSecret(projectData.url, projectData.id);

  const project = {
    baseUrl:
      /*process.env.OVERWRITE_DOMAIN ? process.env.OVERWRITE_DOMAIN : */ projectData.url,
    options: projectData,
    project: projectData,
    _id: id,
    shortName: 'openstad-' + projectData.id,
    mongo: {},
    prefix: projectData.sitePrefix ? '/' + projectData.sitePrefix : false,
    modules: {
      ...aposConfig.modules,
      '@apostrophecms/express': {
        options: {
          session: {
            secret: sessionSecret,
          },
        },
      },
    },
  };

  if (process.env.MONGODB_URI) {
    // Apply the MongoDB prefix (if given) to the database name,
    // and ensure we don't exceed the MongoDB database name length limit
    const dbPrefix = process.env.MONGODB_PREFIX
      ? process.env.MONGODB_PREFIX +
        (!process.env.MONGODB_PREFIX.endsWith('_') ? '_' : '')
      : '';
    const dbName = (dbPrefix + project.shortName).substring(0, 63);

    project.mongo.uri = process.env.MONGODB_URI.replace('{database}', dbName);
  }

  const config = project;

  let assetsIdentifier;

  // for dev projects grab the assetsIdentifier from the first project in order to share assets

  if (Object.keys(apostropheServer).length > 0) {
    const firstProject = apostropheServer[Object.keys(apostropheServer)[0]];
    // assetsIdentifier = firstProject.assets.generation;
  }

  const projectConfig = config;

  projectConfig.afterListen = function () {
    apos._id = project._id;
    if (callback) {
      return callback(null, apos);
    }
  };

  const apos = await apostrophe(projectConfig);

  return apos;
}

app.use(async function (req, res, next) {
  /**
   * Stop server if Project Api Key is not set.
   */
  if (!process.env.API_KEY) {
    console.error('Project api key is not set!');
    if (res) {
      res.status(500).json({ error: 'Project api key is not set!' });
    }
    return;
  }

  const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;

  /**
   * Stop server if no API URL is set
   */
  if (!apiUrl) {
    console.error('API url is not set!');
    if (res) {
      res.status(500).json({ error: 'Api URL is not set!' });
    }
    return;
  }

  /**
   * If projects are not loaded fetch from API
   *
   * All we be loaded in memory and refreshed every few minutes
   */
  if (Object.keys(projects).length === 0) {
    console.log('Fetching config for all projects');

    try {
      await loadProjects();
    } catch (err) {
      next(err);
    }
  }

  if (Object.keys(projects).length === 0) {
    // fallback to generic 404
    return res.status(404).send(`Error: No projects found`);
  }

  next();
});

app.use(async function (req, res, next) {
  // format domain to our specification
  let domain = req.headers['x-forwarded-host'] || req.get('host');
  domain = domain.replace(['http://', 'https://'], ['']);
  domain = domain.replace(['www'], ['']);

  // for dev purposes allow overwrite domain name

  req.openstadDomain = domain;
  next();
});

async function serveSite(req, res, siteConfig, forceRestart) {
  const dbName =
    siteConfig.config && siteConfig.config.cms && siteConfig.config.cms.dbName
      ? siteConfig.config.cms.dbName
      : '';
  const domain = siteConfig.domain;

  try {
    // check if this site needs to redirect. We can then skip the rest.
    let redirectURI =
      siteConfig.config &&
      siteConfig.config.cms &&
      siteConfig.config.cms.redirectURI;
    if (redirectURI) {
      return res.redirect(redirectURI);
    }

    if (!projects[domain]) {
      console.log('Project not found: ', domain, req.originalUrl);
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // use existing server
    if (apostropheServer[domain] && !forceRestart) {
      return apostropheServer[domain].app(req, res);
    }

    // busy? add to queue
    if (startUpIsBusy) {
      return startUpQueue.push([domain, req, res]);
    } else {
      startUpIsBusy = true;
    }

    await doStartServer(domain, req, res);

    // handle queue
    while (startUpQueue.length) {
      let nextInQueue = startUpQueue.shift();
      let [nextDomain, nextReq, nextRes] = nextInQueue;
      if (apostropheServer[nextDomain]) {
        apostropheServer[nextDomain].app(nextReq, nextRes);
      } else {
        doStartServer(...nextInQueue);
      }
    }

    startUpIsBusy = false;
  } catch (e) {
    console.log('Error starting up project: ', domain, e);
    return res.status(500).json({
      error: 'An error occured running project ',
      domain,
    });
  }
}

app.use(function (req, res, next) {
  // Remove redirects from URL
  const url = req.url;

  if (req.url.indexOf('//') > -1 || req.url.indexOf('%5C') > -1) {
    req.url = req.url.replace(/\/{2,}/g, '/');
    req.url = req.url.replace(/%5c/gi, '');

    // Reinitialize route parameters, so the next middleware will see the correct parameters
    req.app._router.handle(req, res, next);
  } else {
    next();
  }
});

/**
 * Check if a site is running under the first path
 *
 * So for instance, following should work:
 *  openstad.org/site2
 *  openstad.org/site3
 *
 * If not existing openstad.org will handle the above examples as pages,
 * if openstad.org exists of course.
 */
app.use('/:sitePrefix', function (req, res, next) {
  const domainAndPath = req.openstadDomain + '/' + req.params.sitePrefix;

  const site = projects[domainAndPath] ? projects[domainAndPath] : false;

  if (site) {
    site.sitePrefix = req.params.sitePrefix;
    req.sitePrefix = req.params.sitePrefix;
    req.site = site;

    // Remove the prefix from the URL
    req.url = req.url.replace(`/${req.params.sitePrefix}`, '');

    // Reinitialize route parameters, so the next middleware will see the correct parameters
    req.app._router.handle(req, res, next);
  } else {
    next();
  }
});

// Add site to request object if we don't have a prefix
// This fixes a bug where basicAuth would only apply to subdirectories
app.use((req, res, next) => {
  if (!req.site) {
    if (projects[req.openstadDomain]) {
      req.site = projects[req.openstadDomain];
    }
  }
  next();
});

const SITE_ACCESS_COOKIE = 'openstadSiteAccess';
const SITE_ACCESS_PATH = '/openstad-site-access';
const SITE_ACCESS_MAX_AGE = 1000 * 60 * 60 * 24;
const parseSiteAccessBody = express.urlencoded({ extended: false });

function siteAccessToken(site) {
  return crypto
    .createHmac('sha256', String(site.config.basicAuth.password))
    .update(`${SITE_ACCESS_COOKIE}:${site.id}`)
    .digest('hex');
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    if (!key) return;
    const raw = part.slice(index + 1).trim();
    try {
      cookies[key] = decodeURIComponent(raw);
    } catch {
      cookies[key] = raw;
    }
  });
  return cookies;
}

function safeEqual(a, b) {
  const bufferA = Buffer.from(String(a));
  const bufferB = Buffer.from(String(b));
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function isSafeReturnPath(value) {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

function renderSiteAccessForm(action, returnTo, hasError) {
  const errorBlock = hasError
    ? `<p class="error" role="alert">Onjuist wachtwoord.</p>`
    : '';
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Toegang</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f4f5f7; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
  form { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.15); width: 100%; max-width: 320px; }
  h1 { font-size: 1.25rem; margin: 0 0 1rem; }
  label { display: block; font-size: .875rem; margin: .75rem 0 .25rem; }
  input { width: 100%; padding: .5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
  button { margin-top: 1.25rem; width: 100%; padding: .6rem; border: 0; border-radius: 4px; background: #1f2937; color: #fff; font-size: 1rem; cursor: pointer; }
  .error { color: #b91c1c; font-size: .875rem; margin: 0 0 .5rem; }
</style>
</head>
<body>
<form method="post" action="${escapeHtml(action)}">
  <h1>Deze site is afgeschermd</h1>
  ${errorBlock}
  <input type="hidden" name="returnTo" value="${escapeHtml(returnTo)}">
  <label for="site-access-password">Wachtwoord</label>
  <input id="site-access-password" name="password" type="password" autocomplete="current-password" autofocus required>
  <button type="submit">Doorgaan</button>
</form>
</body>
</html>`;
}

app.use((req, res, next) => {
  const basicAuth = req.site?.config?.basicAuth;
  const prefix = req.sitePrefix ? '/' + req.sitePrefix : '';

  if (!req.site || !basicAuth?.active || !basicAuth?.password?.trim()) {
    if (req.site && parseCookies(req.headers.cookie)[SITE_ACCESS_COOKIE]) {
      res.clearCookie(SITE_ACCESS_COOKIE, { path: prefix || '/' });
    }
    return next();
  }

  const formAction = prefix + SITE_ACCESS_PATH;
  const expectedToken = siteAccessToken(req.site);
  const presentedToken = parseCookies(req.headers.cookie)[SITE_ACCESS_COOKIE];

  if (presentedToken && safeEqual(presentedToken, expectedToken)) {
    return next();
  }

  if (req.method === 'POST' && req.path === SITE_ACCESS_PATH) {
    return parseSiteAccessBody(req, res, () => {
      const returnTo = isSafeReturnPath(req.body?.returnTo)
        ? req.body.returnTo
        : prefix + '/';
      const validPassword = safeEqual(
        req.body?.password || '',
        basicAuth.password
      );
      if (validPassword) {
        const secure =
          (req.headers['x-forwarded-proto'] || req.protocol) === 'https';
        res.cookie(SITE_ACCESS_COOKIE, expectedToken, {
          httpOnly: true,
          secure,
          sameSite: 'lax',
          path: prefix || '/',
          maxAge: SITE_ACCESS_MAX_AGE,
        });
        return res.redirect(returnTo);
      }
      return res
        .status(401)
        .send(renderSiteAccessForm(formAction, returnTo, true));
    });
  }

  const returnTo = isSafeReturnPath(req.originalUrl)
    ? req.originalUrl
    : prefix + '/';
  return res
    .status(401)
    .send(renderSiteAccessForm(formAction, returnTo, false));
});

app.use('/:privileged(admin)?/login', function (req, res, next) {
  const domainAndPath =
    req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const i = req.url.indexOf('?');
  let query = req.url.substr(i + 1);
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const url = protocol + '://' + domainAndPath + '/auth/login';
  if (req.params.privileged) {
    query += `${query ? '&' : ''}loginPriviliged=1`;
  }
  return res.redirect(url && query ? url + '?' + query : url);
});

app.get('/auth/login', (req, res, next) => {
  let returnUrl = createReturnUrl(req, res);
  returnUrl = encodeURIComponent(returnUrl + '?openstadlogintoken=[[jwt]]');

  const domainAndPath =
    req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const project = projects[domainAndPath] ? projects[domainAndPath] : false;

  const apiUrl = process.env.API_URL;
  let url = `${apiUrl}/auth/project/${project.id}/login?redirectUri=${returnUrl}`;
  url = req.query.loginPriviliged
    ? url + '&loginPriviliged=1'
    : url + '&forceNewLogin=1';

  console.log(
    `[${new Date().toISOString()}][cms-auth] login redirect: projectId=${project?.id} returnUrl=${decodeURIComponent(returnUrl)?.substring(0, 100)}`
  );
  return res.redirect(url);
});

app.use('/logout', function (req, res, next) {
  const domainAndPath =
    req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const i = req.url.indexOf('?');
  let query = req.url.substr(i + 1);
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const url = protocol + '://' + domainAndPath + '/auth/logout';
  return res.redirect(url && query ? url + '?' + query : url);
});

app.get('/auth/logout', (req, res, next) => {
  let returnUrl = createReturnUrl(req, res);

  const projectDomain = process.env.OVERWRITE_DOMAIN
    ? process.env.OVERWRITE_DOMAIN
    : req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const project = projects[projectDomain] ? projects[projectDomain] : false;

  const apiUrl = process.env.API_URL;
  let url = `${apiUrl}/auth/project/${project.id}/logout?redirectUri=${returnUrl}`;
  url = req.query.loginPriviliged
    ? url + '&loginPriviliged=1'
    : url + '&forceNewLogin=1';

  console.log(
    `[${new Date().toISOString()}][cms-auth] logout redirect: projectId=${project?.id}`
  );
  return res.redirect(url);
});

app.use(async function (req, res, next) {
  const completeDomain =
    req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  if (projects[completeDomain]) {
    return await serveSite(
      req,
      res,
      projects[completeDomain],
      req.forceRestart
    );
  }

  // fallback to generic 404
  res
    .status(404)
    .send(
      `Error: No project found for given URL ${escapeHtml(
        req.openstadDomain
      )}${escapeHtml(req.url)}`
    );
});

setInterval(loadProjects, REFRESH_PROJECTS_INTERVAL);

app.listen(process.env.PORT || 3000);
