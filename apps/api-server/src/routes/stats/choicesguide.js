const express = require('express');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const { sequelize } = require('../../db');

const router = express.Router({ mergeParams: true });

// for all get requests
router.all('*', function (req, res, next) {
  return next();
});

router.route('/total').get(rateLimiter(), function (req, res, next) {
  const widgetId = req.query.widgetId || req.query.choicesGuideId;
  let query = `
        SELECT count(choices_guide_results.id) AS counted 
        FROM choices_guide_results
        WHERE choices_guide_results.deletedAt IS NULL 
        AND choices_guide_results.projectId=?
    `;
  const bindvars = [req.params.projectId];

  if (widgetId) {
    query += `AND choices_guide_results.widgetId=?`;
    bindvars.push(widgetId);
  }

  sequelize
    .query(query, {
      replacements: bindvars,
      type: sequelize.QueryTypes.SELECT,
    })
    .then(([rows]) => {
      let counted = (rows && rows[0] && rows[0].counted) || -1;
      res.json({ count: counted });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
