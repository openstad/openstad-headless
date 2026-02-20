const express = require('express');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const { sequelize } = require('../../db');

const router = express.Router({ mergeParams: true });

// for all get requests
router.all('*', function (req, res, next) {
  return next();
});

router.route('/total').get(rateLimiter(), function (req, res, next) {
  let query = `
        SELECT count(choicesGuideResults.id) AS counted 
        FROM choicesGuideResults
        INNER JOIN choicesGuides ON choicesGuides.id = choicesGuideResults.choicesGuideId
        WHERE choicesGuideResults.deletedAt IS NULL 
        AND choicesGuides.projectId=?    
        AND choicesGuides.deletedAt IS NULL
    `;
  const bindvars = [req.params.projectId];

  if (req.query.choicesGuideId) {
    query += `AND choicesGuideResults.choicesGuideId=?`;
    bindvars.push(req.query.choicesGuideId);
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
