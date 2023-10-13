const express = require('express');
const router = express.Router({mergeParams: true});
const auth        = require('../../middleware/sequelize-authorization-middleware');
const db          = require('../../db');


router.all('*', function(req, res, next) {
    req.scope = [];
    return next();
});

// list widgets
// --------------
router.route('/')
    .all(function(req, res, next) {
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
    
    // list
    .get(auth.useReqUser)
    .get(function(req, res, next) {
        return res.json(req.results);
    })

    // Create widget
    .post(auth.useReqUser)
    .post(async function(req, res, next) {
        const widget = req.body;
        const projectId = req.params.projectId;
        
        const createdWidget = await db.Widget.create({
            projectId,
            description: widget.description,
            type: widget.type,
            config: {}
        });

        return res.json(createdWidget);
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
	})
    
module.exports = router;
