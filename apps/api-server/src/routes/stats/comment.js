const express = require('express');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const { sequelize } = require('../../db');

let router = express.Router({ mergeParams: true });

// for all get requests
router.all('*', function (req, res, next) {
  return next();
});

router
  .route('/total')

  // count comments
  // ---------------
  .get(rateLimiter(), function (req, res, next) {
    let resourceId = req.query.resourceId;
    let sentiment = req.query.sentiment;

    let query = `SELECT count(comments.id) AS counted FROM resources LEFT JOIN comments ON comments.resourceId = resources.id `;
    let bindvars = [];
    if (sentiment) {
      query += `AND comments.sentiment = ? `;
      bindvars.push(sentiment);
    }
    query += 'WHERE resources.deletedAt IS NULL AND resources.projectId = ? ';
    bindvars.push(req.params.projectId);
    if (resourceId) {
      query += 'AND resources.id = ? ';
      bindvars.push(resourceId);
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
