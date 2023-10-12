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

// one widget routes: get widget
// -------------------------
router.route('/:id') //(\\d+)
    .all(function(req, res, next) {
        const id = req.params.id;
        let query = { where: { id } }

        db.Widget
            .scope(...req.scope)            
            .findOne(query)
            .then(found => {
                if ( !found ) throw new Error('Widget not found');
                req.results = found;
                req.widget = req.results; // middleware expects this to exist
                next();
            })
        .catch(next);
    })

    .get(auth.useReqUser)
	.get(function(req, res, next) {
        const widget = req.widget;
        res.json(widget);
	})
    
    // Update widget
    .put(auth.useReqUser)
	.put(async function(req, res, next) {
		const widget = req.widget;
        const config = {...widget.config, ...(req.body?.config || {})}; 

        if(config) {
            widget.update({config}).then(result => res.json(result))
        }
	});
    
module.exports = router;
