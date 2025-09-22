var config       = require('config')
  , express      = require('express');

// Misc
var util         = require('./util');
var log          = require('debug')('app:http');
const morgan     = require('morgan');
const db 		 = require('./db');
const cookieParser = require('cookie-parser');

const https = require('https');
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
      this.app.use(cookieParser());

  //  this
      // this.app.use(cors());

	  this.app.get('/health', (req, res) => {
		res.status(200).json({
		  status: 'UP',
		  message: 'Server is healthy',
		  timestamp: new Date().toISOString(),
		});
	  });

	  this.app.get('/db-health', async (req, res) => {
		try {
			await db.sequelize.authenticate();
			res.status(200).json({
				status: 'UP',
				message: 'Database connection has been established successfully.',
				timestamp: new Date().toISOString(),
			  });
		} catch (error) {
			console.error('Unable to connect to the database:', error);
			res.status(500).json({
				status: 'DB_CONNECTION_ERROR',
				message: 'Unable to connect to the database. See the logs for details.',
				timestamp: new Date().toISOString(),
			});
		}
	  });

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
		
		const cts = {
    cert: `-----BEGIN CERTIFICATE-----
MIID8jCCAtqgAwIBAgIUbFhth27evorLFYm1nQK/y+ErF0QwDQYJKoZIhvcNAQEL
BQAwczELMAkGA1UEBhMCTkwxEzARBgNVBAgMCkdlbGRlcmxhbmQxEDAOBgNVBAcM
B05pamtlcmsxDjAMBgNVBAoMBURyYWFkMREwDwYDVQQLDAhPcGVuc3RhZDEaMBgG
A1UEAwwRd3d3LmxvY2FsaG9zdC5jb20wHhcNMjUwMzAzMDg0NzM4WhcNMjYwMzAz
MDg0NzM4WjBzMQswCQYDVQQGEwJOTDETMBEGA1UECAwKR2VsZGVybGFuZDEQMA4G
A1UEBwwHTmlqa2VyazEOMAwGA1UECgwFRHJhYWQxETAPBgNVBAsMCE9wZW5zdGFk
MRowGAYDVQQDDBF3d3cubG9jYWxob3N0LmNvbTCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBALULFCLvCFmZPGEt+JcK9o3Oh/dsd2r/duhBqBE2iQWtjRLc
mESDo2SNKP1riicr/zbmMhmzs2kmTT+LQb+wIclPuFFJ+NWz3Hk0T68GhlP65kNt
7HPXNjdpknozWgUZJnqi6YNRv0Vs/9lScf7/fYMgN4US16t41T1mKKcSv5cSz1P1
R68ncuDjA7lG/zrEgZG5HGX8yyHgAycgxuub8ia16LRA2t79wZvNWR+VkhGJSuqn
OpYaWu48NyvuuJwRdimUjB6XsEedk0SK95CIHlgdAgsv3lFDdpFau2WrGv/TUf0v
mgBB+zGx+Fy7XX6oGMAwJY66T6vaAY7eI3BUE8ECAwEAAaN+MHwwDgYDVR0PAQH/
BAQDAgOIMBMGA1UdJQQMMAoGCCsGAQUFBwMBMDYGA1UdEQQvMC2CEXd3dy5sb2Nh
bGhvc3QuY29tgg1sb2NhbGhvc3QuY29tgglsb2NhbGhvc3QwHQYDVR0OBBYEFApe
rZqDvJgYkGTW+JdVn5Nh9ERDMA0GCSqGSIb3DQEBCwUAA4IBAQA/WgkwGGFyiiHM
hKkOAaeyz/p7XzaZX3KetW4sDW48izotkWo9J7iojuLoK9LxBM4ohk1gMpAdStCV
sVWd/0pFLbKSz/biBlh5Sz64Np8Xj/qMwtbD8tdsZa9V37dWbafydF3p0fxPUxj6
irjXdCdpOd/9wofMZtMsxL/lDqMSHH9REO0Rhq9uAoymABNAnKF+F6LRLqsnLGkz
Or7MTLS7BA+7w6DCKWmB+fMUQ30desnTTjfx/NXZhaaZAmFT93McMKjKpa05UTLL
9Ro9N3RyUhRTS0hL1jHSeMeKVdvoLF4g7CP1/dGsQ6mfSsatYVcuz0ER3n1DOyoL
Wj/K5g4L
-----END CERTIFICATE-----
`,
    key: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC1CxQi7whZmTxh
LfiXCvaNzof3bHdq/3boQagRNokFrY0S3JhEg6NkjSj9a4onK/825jIZs7NpJk0/
i0G/sCHJT7hRSfjVs9x5NE+vBoZT+uZDbexz1zY3aZJ6M1oFGSZ6oumDUb9FbP/Z
UnH+/32DIDeFEtereNU9ZiinEr+XEs9T9UevJ3Lg4wO5Rv86xIGRuRxl/Msh4AMn
IMbrm/Imtei0QNre/cGbzVkflZIRiUrqpzqWGlruPDcr7ricEXYplIwel7BHnZNE
iveQiB5YHQILL95RQ3aRWrtlqxr/01H9L5oAQfsxsfhcu11+qBjAMCWOuk+r2gGO
3iNwVBPBAgMBAAECggEAAMnTQ+t91i0saudbPFoF2r5Tk7f8r1QU3xYku5wU08QE
qdRxHz6iEbCyvRNmo2jv31/wV8HXVxbNoChKsk1jqQanXK8ia8iw7gQgkQRpna5Z
cgGRtZueO86iXqzkOmKcmwz0OKYwp65ZyQ8YngTMBbv8Wmh7jPqXhgEgtgkrGXLr
m5/4CluCN0n0pMW4X20G54BJZn9eWnsbbzWG3CbtDNUgM2YNAumLB2hh6DtAYUbC
5n+QtIxmWdelfGYwaH0l2m9QO1rIvibJa0hGOPaP2kq4ASFi4lHwWzrTABMlMaG4
BhSp6N/EPMf9uJcJakZnacbYAdlbGTQVwM92XkiLgQKBgQD61Z+0rOWl9SmAf+gu
jWPAk+a++CUgtH0cRUNjZp3UbsxRWSk+fiY0upAVA66dMD7I8xCotGcalYvpxtw7
qUrdZAeS6+WehCW4wqNQQpCgpoGbOAUbGjGU2lwSDeRryZM7HQOAMbxwHz1ZtFSb
CGCA3fg/M24Hg500ApzTqY4fgQKBgQC4xYWnklotpM33WfQJxeXG1sU1U7MpcrSl
/ENyTMx8mShzWuwvsLKZ433D1OVF1rjyyUvoKNWqnzDeq6dB2hmAjFQaBtNW/Vdb
hIVFkbBJj0nCe9yx9WyTCFXJvXT0gp336YVZOQKpO8P9WK+jOKVb37ByrccxMCHR
uGhzrMgUQQKBgQClftzocEr0vFStm7atQExYezz7Mu4MLgl95ZUYuFPaHWBhK9qy
iLjcgVsfAlbrDzHdk8GiDaUZPSIbFEGqe4ARojX9EfdmJvpcdM8b3U9fL3zD1KpJ
v3aHJ6snnlLfaxfhILt2kVoq//GShhBsWZKSc+GekWg/PO8zqaWfYXeMAQKBgQCR
/og/wrT8UbbolavsuPB4ryR9oVf0DQ1OBcgpHSOJ496BXzs153EHhSfPP321NBdI
xuLyWqmROl1747exoan612ZwdioxFtYamthPAvF+/ffy8rmL53bVqoVWdRtfQ4Gb
7GkP+arvmyieGqAU4OJPeKzLwCGe7QAb3JCzrbcdwQKBgQC11dDFEo5DfqpFKfDb
etH1hbSVqGR3GaQVOuBITCRzfptA64JwbBjfgYmRUS+2TIBI481PEKxUgMtktKc8
BeRmSiRZCtDHgEw1X5ZpuP2ekqMRFvEnqrfN0gTkigRn3Z8J2/Ljeeb3Zl5ciL40
ZcWsZqyui9/+6hczT3KupoH0mQ==
-----END PRIVATE KEY-----
`
}

		https.createServer(cts, this.app).listen(31410);
		
		this.app.listen(31499, function() {
		  log('listening on port %s', 31499);
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
