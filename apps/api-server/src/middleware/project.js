const db = require('../db');
const createError = require('http-errors');

const getProjectId = (path) => {
  const match = path.match(/\/project\/(\d+)?\/?/);
  if (match) {
      return parseInt(match[1]);
  }

  return null;
}

module.exports = function( req, res, next ) {

  // deze paden mogen dit overslaan
  if (req.path.match('^(/api/repo|/api/template|/api/area|/api/datalayer|/api/widget|/api/image|/api/document|/api/widget-type|/widget|/$)')) return next();
  if (req.path.match('^(/api/lock(/[^/]*)?)$')) return next();
  if ((req.path.match('^(/api/user)') && ( req.method == 'GET' ))) return next();

  let projectId = getProjectId(req.path);
  if (req.path.match('^(/api/project(/issues)?/?)$')) projectId = 1; // list projects only on admin site

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
