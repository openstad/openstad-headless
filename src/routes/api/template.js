const fetch = require('node-fetch');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchResults = require('../../middleware/search-results-static');

const router = require('express-promise-router')({ mergeParams: true });

// backwards compatibility
router.route('/$')
  .get(function(req, res, next) {
    res.redirect('/api/template/project');
  })

router.route('/project')
  .get(pagination.init)
  .get(function(req, res, next) {

    if (config.templateSource === 'DB' || config.templateSource === 'DATABASE') {

      req.results = {'Too soon': 'Not yet implemented'};
      next();

    } else {

      return fetch(config.templateSource, {
	      headers: { "Content-type": "application/json" },
      })
	      .then((response) => {
		      if (!response.ok) throw Error(response)
		      return response.json();
	      })
	      .then(json => {
          req.results = json;
          return next();
	      })
	      .catch((err) => {
		      console.log('Fetch templates: niet goed');
		      next({'message': 'Error fetching templates'});
	      });

    }
  })
  .get(searchResults)
  .get(pagination.paginateResults)
  .get(function(req, res, next) {
    res.json(req.results);
  })

module.exports = router;
