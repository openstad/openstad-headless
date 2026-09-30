const express = require('express');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const {
  mergeEmailConfigSections,
  pickAllowedConfig,
  touchesSenderSections,
  validateEmailConfig,
} = require('../../util/global-settings-validation');

let router = express.Router({ mergeParams: true });

// Reading must not write, so an absent row yields an unsaved instance with the same
// shape. The row itself is seeded by migration 115.
async function readSiteConfig() {
  const siteConfig = await db.SiteConfig.findOne({ where: { id: 1 } });
  return (
    siteConfig || db.SiteConfig.build({ id: 1, config: {}, emailConfig: {} })
  );
}

async function getOrCreateSiteConfig() {
  let [siteConfig] = await db.SiteConfig.findOrCreate({
    where: { id: 1 },
    defaults: { id: 1, config: {}, emailConfig: {} },
  });
  return siteConfig;
}

async function loadSiteConfig(req, res, next) {
  try {
    req.results = await readSiteConfig();
    return next();
  } catch (err) {
    return next(err);
  }
}

function respondWithSiteConfig(req, res) {
  res.json(req.results);
}

router
  .route('/')

  // view global settings
  // ---------------------
  .get(auth.can('SiteConfig', 'view'))
  .get(loadSiteConfig)
  .get(auth.useReqUser)
  .get(respondWithSiteConfig)

  // update global settings
  // ------------------------
  .put(auth.can('SiteConfig', 'update'))
  .put(rateLimiter(), async function (req, res, next) {
    try {
      const siteConfig = await getOrCreateSiteConfig();
      const updateData = {};

      if (req.body.config) {
        const { allowed, errors } = pickAllowedConfig(req.body.config);
        if (errors.length) return res.status(400).json({ errors });
        updateData.config = allowed;
      }

      // Only validate when the request changes a sender section; the branding form posts
      // config only and the notification styling form posts emailConfig.styling. Neither
      // may be blocked by fields it cannot edit.
      if (req.body.emailConfig) {
        if (touchesSenderSections(req.body.emailConfig)) {
          const errors = validateEmailConfig(
            mergeEmailConfigSections(
              siteConfig.emailConfig,
              req.body.emailConfig
            )
          );
          if (errors.length) return res.status(400).json({ errors });
        }
        updateData.emailConfig = req.body.emailConfig;
      }

      req.results = await siteConfig.update(updateData);
      return next();
    } catch (err) {
      return next(err);
    }
  })
  .put(auth.useReqUser)
  .put(respondWithSiteConfig);

// Read-only variant, mounted under /project/:projectId so a project editor can see what
// their project inherits. No update route: a project admin passes an 'admin' role check
// and must not be able to change platform-wide settings.
let readOnlyRouter = express.Router({ mergeParams: true });

readOnlyRouter
  .route('/')
  .get(auth.can('SiteConfig', 'view'))
  .get(loadSiteConfig)
  .get(auth.useReqUser)
  .get(respondWithSiteConfig);

module.exports = { router, readOnlyRouter };
