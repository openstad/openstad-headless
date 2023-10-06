const express = require('express');
const router = express.Router({mergeParams: true});
const auth        = require('../../middleware/sequelize-authorization-middleware');
const db          = require('../../db');




router.all('*', function(req, res, next) {
    req.scope = [];

    if (req.query.includeType) {
      req.scope.push('includeType');
    }
    return next();
  });

    // list widgets
    // --------------
    router.route('/')
	.get(auth.useReqUser)

    .get(function(req, res, next) {

        let { dbQuery } = req;
        dbQuery.where = {
          projectId: req.params.projectId,
          ...req.queryConditions,
        }

        db.Widget
        .scope(...req.scope)
        .findAndCountAll(dbQuery)
          .then(function(result) {
            const { rows } = result;
            req.results = rows;    
            return next();
          })
          .catch(next);
      })
      .get(function(req, res, next) {
        res.json(req.results);
      });
    
module.exports = router;
