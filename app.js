require('dotenv').config();

const apostrophe = require('apostrophe');
const express = require('express');
const app = express();
const _ = require('lodash');
const apiUrl = process.env.API_URL || 'http://localhost:8111';
const siteService = require('./services/sites');
const aposConfig = require('./lib/apos-config');
const { refresh } = require('less');
const REFRESH_SITES_INTERVAL = 60000 * 5;

let sites = {};
const apostropheServer = {};
const aposStartingUp = {};

async function loadSites () { 
  const allSites = await siteService.fetchAll();
  sites = {};

  allSites.forEach((site, i) => {
    console.log('Site fetched: ' + site.domain);

    // for convenience and speed we set the domain name as the key
    sites[site.domain] = site;
  });

  cleanUpSites();
}

// run through all sites see if anyone is not active anymore and needs to be shut down
function cleanUpSites() {
  const runningDomains = Object.keys(apostropheServer);

  if (runningDomains) {
    runningDomains.forEach((runningDomain) => {
      if (!sites[runningDomain]) {
        try {
          apostropheServer[runningDomain].apos.destroy();
        } catch (e) {
          console.log('Error stopping site', e);
        }

        delete apostropheServer[runningDomain];

      }
    });
  }
}

async function run(id, siteData, options, callback) {
  const siteConfig = {
    ...aposConfig,
    baseUrl: process.env.OVERWRITE_DOMAIN ? 'http://localhost:3000' : siteData.config.cms.url,
    options: siteData,
    site: siteData,
    _id: id,
    shortName: siteData.config.cms.dbName,
  };

  siteConfig.afterListen = function () {
    apos._id = site._id;
    if (callback) {
      return callback(null, apos);
    }
  };

  const apos = apostrophe(
    siteConfig
  );

  return apos;
}

app.use(async function (req, res, next) {
  /**
   * Stop server if Site Api Key is not set.
   */
  if (!process.env.SITE_API_KEY) {
    console.error('Site api key is not set!');
    if (res) {
      res.status(500).json({ error: 'Site api key is not set!' });
    }
    return;
  }

  const apiUrl = process.env.INTERNAL_API_URL ? process.env.INTERNAL_API_URL : process.env.API_URL;

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
   * If sites are not loaded fetch from API
   *
   * All we be loaded in memory and refreshed every few minutes
   */
  if (Object.keys(sites).length === 0) {
    console.log('Fetching config for all sites');

    try {
      await loadSites();
    } catch (err) {
      next(err);
    }
  }

  if (Object.keys(sites).length === 0) {
    console.log('No config for sites found');
    return res.status(500).json({ error: 'No sites found' });
  }

  // format domain to our specification
  let domain = req.headers['x-forwarded-host'] || req.get('host');
  domain = domain.replace([ 'http://', 'https://' ], [ '' ]);
  domain = domain.replace([ 'www' ], [ '' ]);

  req.openstadDomain = domain;

  next();
});

app.use('/config-reset', async function (req, res, next) {
  await loadSites();
  next();
});

app.use('/login', function (req, res, next) {
  const domainAndPath = req.openstadDomain;
  const i = req.url.indexOf('?');
  const query = req.url.substr(i + 1);
  const url = req.protocol + '://' + domainAndPath + '/oauth/login';

  return res.redirect(url && query ? url + '?' + query : url);
});

app.get('/oauth/login', (req, res, next) => {
  // check in url if returnTo params is set for redirecting to page
  // req.session.returnTo = req.query.returnTo ? decodeURIComponent(req.query.returnTo) : null;
  let siteDomain = process.env.OVERWRITE_DOMAIN ? process.env.OVERWRITE_DOMAIN : req.openstadDomain;
  const site = (sites[siteDomain] ? sites[siteDomain] : false);
  //const site = sites[0];

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

  let url = `${apiUrl}/oauth/site/${site.id}/login?redirectUrl=${returnUrl}`;
  url = req.query.useOauth ? url + '&useOauth=' + req.query.useOauth : url;
  url = req.query.loginPriviliged ? url + '&loginPriviliged=1' : url + '&forceNewLogin=1'; // ;

  return res.redirect(url);
});

app.use(async function (req, res, next) {
  // format domain to our specification
  let domain = req.headers['x-forwarded-host'] || req.get('host');
  domain = domain.replace([ 'http://', 'https://' ], [ '' ]);
  domain = domain.replace([ 'www' ], [ '' ]);

  // for dev purposes allow overwrite domain name
  domain = process.env.OVERWRITE_DOMAIN ? process.env.OVERWRITE_DOMAIN : domain;

  if (!sites[domain]) {
    console.log('Site not found: ', domain);
    res.status(404).json({ error: 'Site not found' });
    return;
  }

  if (!apostropheServer[domain]) {
    console.log('Starting up site: ', domain);
    apostropheServer[domain] = await run(domain, sites[domain], {});
  }

  try {
    aposStartingUp[domain] = false;
    apostropheServer[domain].app.set('trust proxy', true);
    apostropheServer[domain].app(req, res);
  } catch (e) {
    console.log('Error starting up site: ', domain, e);

    res.status(500).json({
      error: 'An error occured running site ',
      domain
    });
  }
});

setInterval(loadSites, REFRESH_SITES_INTERVAL);

app.listen(process.env.PORT || 3000);
