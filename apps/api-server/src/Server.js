var config       = require('config')
  , express      = require('express');

// Misc
var util         = require('./util');
var log          = require('debug')('app:http');
const morgan     = require('morgan')

module.exports  = {
	app: undefined,

	init: async function() {
      log('initializing...');

      // var Raven       = require('../config/raven');
      var compression = require('compression');
      // var cors        = require('cors');

      this.app = express();
      this.app.disable('x-powered-by');
      this.app.set('trust proxy', true);
      this.app.set('view engine', 'njk');
      this.app.set('env', process.env.NODE_APP_INSTANCE || 'development');

      if (process.env.REQUEST_LOGGING === 'ON') {
        this.app.use(morgan('dev'));
      }

      this.app.use(compression());

  //  this
      // this.app.use(cors());

      // Register statics first...
      this._initStatics();

      // ... then middleware everyone needs...
      this._initBasicMiddleware();
      this._initSessionMiddleware();

      var middleware = config.express.middleware;

      middleware.forEach(( entry ) => {
          if (typeof entry == 'object' ) {
              // nieuwe versie: use route
              this.app.use(entry.route, require(entry.router));
          } else {
              // oude versie: de file doet de app.use
              require(entry)(this.app);
          }
      });

      require('./middleware/error_handling')(this.app);
	},

	start: function( port ) {
		this.app.listen(port, function() {
		  log('listening on port %s', port);
		});
	},

	_initStatics: function() {

		var headerOptions = {
			setHeaders: function( res ) {
				res.set({
					'Cache-Control': 'private'
				});
			}
		};

	},
	_initBasicMiddleware: function() {
		var bodyParser         = require('body-parser');
		var methodOverride     = require('method-override');

		// Middleware to fill `req.project` with a `Project` instance.
		const reqProject = require('./middleware/project');
		this.app.use(reqProject);

		this.app.use(require('./middleware/security-headers'));

		this.app.use(bodyParser.json({limit: '10mb'}));
		this.app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
		this.app.use(methodOverride(function( req, res ) {
			var method;
			if( req.body && req.body instanceof Object && '_method' in req.body ) {
				method = req.body._method;
				delete req.body._method;
			} else {
				method = req.get('X-HTTP-Method') ||
				         req.get('X-HTTP-Method-Override') ||
				         req.get('X-Method-Override');
			}
			if( method ) {
				log('method override: '+method);
			}
			return method;
		}));
	},
  _initSessionMiddleware: function() {
    // Middleware to fill `req.user` with a `User` instance.
    const getUser = require('./middleware/user');
    this.app.use(getUser);
  },
};
