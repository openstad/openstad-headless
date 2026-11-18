const createError = require('http-errors');
const express = require('express');
const auth = require('../../middleware/sequelize-authorization-middleware');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const { readGlobalSettings } = require('../../services/global-settings');

const router = express.Router({ mergeParams: true });

const SECTIONS = ['branding', 'email'];

async function loadGlobalSettings(req, res, next) {
  try {
    req.results = await readGlobalSettings();
    return next();
  } catch (err) {
    return next(err);
  }
}

router
  .route('/')

  .get(auth.can('GlobalSettings', 'view'))
  .get(loadGlobalSettings)
  .get(function (req, res) {
    res.json(req.results.toJSON(req.user));
  })

  .put(auth.can('GlobalSettings', 'update'))
  .put(loadGlobalSettings)
  .put(rateLimiter(), async function (req, res, next) {
    const values = {};
    SECTIONS.forEach((section) => {
      if (req.body[section] !== undefined) values[section] = req.body[section];
    });
    if (!Object.keys(values).length) {
      return next(createError(400, 'Geen instellingen opgegeven'));
    }

    try {
      const globalSettings = await req.results.update(values);
      res.json(globalSettings.toJSON(req.user));
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
