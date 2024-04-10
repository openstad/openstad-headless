require('dotenv').config();

const apostrophe = require('apostrophe');
const express = require('express');
const app = express();
const _ = require('lodash');
const projectService = require('./services/projects');
const aposConfig = require('./lib/apos-config');
const { refresh } = require('less');
const REFRESH_PROJECTS_INTERVAL = 60000 * 5;
const Url = require('node:url');

let projects = {};
const apostropheServer = {};

let startUpIsBusy = false;
let startUpQueue = [];

async function loadProjects () {
  try {

    const allProjects = await projectService.fetchAll();
    projects = {};

    allProjects.forEach((project, i) => {
      if (!project.url) return;
      // We are no longer saving the protocol in the database, but we need a
      // protocol to be able to use `Url.parse` to get the host.
      if (!project.url.startsWith('http://') && !project.url.startsWith('https://')) {
        const protocol = process.env.FORCE_HTTP === 'yes' ? 'http://' : 'https://';
        project.url =  protocol + project.url;
      }
      let url = Url.parse(project.url);
      console.log('Project fetched: ' + url.host);

      // for convenience and speed we set the domain name as the key
      projects[url.host] = project;
    });

    cleanUpProjects();
    
  } catch(err) {
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

async function run(id, projectData, options, callback) {

  const project = {
    ...aposConfig,
    baseUrl: process.env.OVERWRITE_DOMAIN ? 'http://localhost:3000' : projectData.url,
    options: projectData,
    project: projectData,
    _id: id,
    shortName: 'openstad-' + projectData.id,
    mongo: {},
  };

  if (process.env.MONGODB_URI) {
    project.mongo.uri = process.env.MONGODB_URI.replace("{database}", project.shortName);
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

  const apos = apostrophe(
    projectConfig
  );

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
    console.log('No config for projects found');
    return res.status(500).json({ error: 'No projects found' });
  }

  // format domain to our specification
  let domain = req.headers['x-forwarded-host'] || req.get('host');
  domain = domain.replace([ 'http://', 'https://' ], [ '' ]);
  domain = domain.replace([ 'www' ], [ '' ]);

  req.openstadDomain = domain;

  next();
});

app.use('/config-reset', async function (req, res, next) {
  await loadProjects();
  next();
});

app.use('/login', function (req, res, next) {
  const domainAndPath = req.openstadDomain;
  const i = req.url.indexOf('?');
  const query = req.url.substr(i + 1);
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const url = protocol + '://' + domainAndPath + '/auth/login';

  return res.redirect(url && query ? url + '?' + query : url);
});

app.get('/auth/login', (req, res, next) => {
  // check in url if returnTo params is set for redirecting to page
  // req.session.returnTo = req.query.returnTo ? decodeURIComponent(req.query.returnTo) : null;
  let projectDomain = process.env.OVERWRITE_DOMAIN ? process.env.OVERWRITE_DOMAIN : req.openstadDomain;
  const project = (projects[projectDomain] ? projects[projectDomain] : false);
  //const project = projects[0];

  //    req.session.save(() => {
  const thisHost = req.headers['x-forwarded-host'] || req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  let returnUrl = protocol + '://' + thisHost;

  if (req.query.returnTo && typeof req.query.returnTo === 'string') {
    // only get the pathname to prevent external redirects
    let pathToReturnTo = Url.parse(req.query.returnTo, true);
    pathToReturnTo = pathToReturnTo.path;
    returnUrl = returnUrl + pathToReturnTo;
  }

  returnUrl = encodeURIComponent(returnUrl + '?openstadlogintoken=[[jwt]]');

  const apiUrl = process.env.API_URL;
  let url = `${apiUrl}/auth/project/${project.id}/login?redirectUri=${returnUrl}`;
  url = req.query.useOauth ? url + '&useOauth=' + req.query.useOauth : url;
  url = req.query.loginPriviliged ? url + '&loginPriviliged=1' : url + '&forceNewLogin=1'; // ;

  return res.redirect(url);
});

app.use(async function (req, res, next) {

  try {

    // format domain to our specification
    let domain = req.headers['x-forwarded-host'] || req.get('host');
    domain = domain.replace([ 'http://', 'https://' ], [ '' ]);
    domain = domain.replace([ 'www' ], [ '' ]);

    // for dev purposes allow overwrite domain name
    domain = process.env.OVERWRITE_DOMAIN ? process.env.OVERWRITE_DOMAIN : domain;

    if (!projects[domain]) {
      console.log('Project not found: ', domain);
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // use existing server
    if (apostropheServer[domain]) {
      return apostropheServer[domain].app(req , res);
    }

    // busy? add to queue
    if (startUpIsBusy) {
      return startUpQueue.push([domain, req, res]);
    } else {
      startUpIsBusy = true;
    }

    await doStartServer(domain, req, res)

    // handle queue
    while (startUpQueue.length) {
      let nextInQueue = startUpQueue.shift();
      let [ nextDomain, nextReq, nextRes ] = nextInQueue;
      if (apostropheServer[nextDomain]) {
        apostropheServer[nextDomain].app(nextReq, nextRes);
      } else {
        doStartServer(...nextInQueue);
      }
    }

    startUpIsBusy = false;

  } catch (e) {
    console.log('Error starting up project: ', domain, e);
    res.status(500).json({
      error: 'An error occured running project ',
      domain
    });
  }

});

setInterval(loadProjects, REFRESH_PROJECTS_INTERVAL);

app.listen(process.env.PORT || 3000);
