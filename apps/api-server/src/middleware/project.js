const db = require('../db');
const createError = require('http-errors');

const getProjectId = (path) => {
  const match = path.match(/\/project\/(\d+)?\//);
  if (match) {
      return parseInt(match[1]);
  }

  return null;
}

module.exports = function( req, res, next ) {

  // @todo: inverse this middleware; Only apply it on routes that need it, instead of applying this middleware to every route and then creating exceptions for routes that don't need it
  // deze paden mogen dit overslaan
  if (req.path.match('^(/doc|/api/repo|/api/template|/api/area|/api/widget|/api/widget-type|/widget|/$)')) return next();
  if (req.path.match('^(/api/lock(/[^/]*)?)$')) return next();
  if (req.path.match('^(/api/project(/[^/]*)?)$')) return next();

  const projectId = getProjectId(req.path);
  if (!projectId || typeof projectId !== 'number') return next(new createError(400, 'Project niet gevonden for path: ' + req.path));

  const where = { id: projectId }

  return db.Project
  	.findOne({ where })
  	.then(function( found ) {
      if (!found) {
        console.log('Project not found for projectId query: ', where);
        return next(new createError(404, 'Project niet gevonden for projectId: '+ projectId));
      }
  		req.project = found;
  		next();
      return null;
  	})
  	.catch( err => {
  		next(err)
      return null;
  	});
}
