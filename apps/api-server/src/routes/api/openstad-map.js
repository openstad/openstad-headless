const express = require('express');
const db      = require('../../db');
const auth    = require('../../middleware/sequelize-authorization-middleware');
const config  = require('config');

const router = express.Router({mergeParams: true});

// scopes: for all get requests
router
	.all('*', function(req, res, next) {
		req.scope = ['api'];
		req.scope.push('mapMarkers');
		req.scope.push('selectRunning');
		req.scope.push({ method: ['sort', 'createdate_desc']});
		next();
	})

router.route('/resource-marker')

// list resources as map markers
// -------------------------
	.get(auth.can('Resource', 'list'))
	.get(function(req, res, next) {

		db.Resource
			.scope(...req.scope)
			.findAll({ where: { projectId: req.params.projectId } })
			.then( found => {
				let maxMarkers = ( req.project && req.project.config.openStadMap && req.project.config.openStadMap.maxMarkers ) || 20;
				if (found.length > maxMarkers) found = found.slice(0, maxMarkers)
				return found.map( entry => createMarker(entry) );
			})
			.then(function( found ) {
				res.json(found);
			})
			.catch(next);
	})

// one resource as map marker
// ----------------------
router.route('/resource-marker/:resourceId(\\d+)')

	.all(function(req, res, next) {
		const resourceId = parseInt(req.params.resourceId) || 1;

		db.Resource
			.scope(...req.scope)
			.findOne({
				where: { id: resourceId, projectId: req.params.projectId }
			})
			.then(found => {
				if ( !found ) throw new Error('Resource not found');
				req.resource = found;
				next();
			})
			.catch(next);
	})

// view resource
// ---------
	.get(auth.can('Resource', 'view'))
	.get(function(req, res, next) {
		res.json(createMarker(req.resource));
	})

// polygon

router.route('/polygon')

// the polygon as defined for this project
// ------------------------------------
	.get(auth.can('Resource', 'list'))
	.get(function(req, res, next) {

		// use from project config
		let polygon = req.project && req.project.config.openStadMap && req.project.config.openStadMap.polygon;

		res.json(polygon || null);

	})


// helper functions
// ----------------

function createMarker(resource) {
	return {
		id: resource.id,
		location: resource.location,
		icon     : {
			url    : resource.status == 'DONE' || resource.status == 'ACCEPTED' || resource.status == 'BUSY' ? '/img/resource/flag-blue.svg' : ( resource.status == 'CLOSED' || resource.status == 'DENIED' ? '/img/resource/flag-gray.svg' : '/img/resource/flag-red.svg' ),
			size   : [22, 24],
			anchor : [ 4, 21],
		},
		href: `/plan/${resource.id}`,
		status: resource.status,
	}

}

module.exports = router;
