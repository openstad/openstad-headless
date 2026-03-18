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

  // count resources
  // -----------
  .get(rateLimiter(), function (req, res, next) {
    let query =
      'SELECT count(resources.id) AS counted FROM resources WHERE resources.publishDate < NOW() AND resources.deletedAt IS NULL AND resources.projectId=?';
    let bindvars = [req.params.projectId];

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
