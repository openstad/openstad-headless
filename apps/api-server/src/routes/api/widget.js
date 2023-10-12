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
  })
  .all(function(req, res, next) {
    if(!req.params.projectId) return res.status(400).send("projectId is required")
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
    .post(function(req, res, next) {
        const widget = req.body;
        if(!widget.type) return res.status(400).send("Widget type is required");
        if(!widget.description) return res.status(400).send("Widget description is required");
        next();
    })
.post(async function(req, res, next) {
    const widget = req.body;
    const projectId = req.params.projectId;
    const query = {where:{id: widget.type}}

    const result = await db.WidgetType.findOne(query);
    if(!result) {
        return res.status(404).send("The given widget type does not exist");
    }
    
    const createdWidget = await db.Widget.create({
        projectId,
        description: widget.description,
        widgetTypeId: widget.type,
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
    // delete widget
    .delete(auth.useReqUser)
    .put(async function(req, res, next) {
		const widget = req.widget;
        const config = {...widget.config, ...(req.body?.config || {})}; 
    })
    .delete(async function(req, res, next) {
        const widget = req.widget;
            
        if(config) {
            widget.update({config}).then(result => res.json(result))
        }
    });
    
module.exports = router;
