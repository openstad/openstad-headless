const express = require('express');
const db          = require('../../db');
const router = express.Router({mergeParams: true});
const auth        = require('../../middleware/sequelize-authorization-middleware');

router.route('/')

    // list widget types
    // --------------
	.get(auth.useReqUser)
    .get(function(req, res, next) {
        let { dbQuery } = req;
        
        db.WidgetType
        //   .scope(...req.scope)
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
