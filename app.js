'use strict';
require('dotenv').config();

const bodyParser                  = require('body-parser');
//const client                      = require('./client');
const cookieParser                = require('cookie-parser');
const config                      = require('./config');
const db                          = require('./db');
const express                     = require('express');
const expressSession              = require('express-session');
const fs                          = require('fs');
const https                       = require('https');
const passport                    = require('passport');
const path                        = require('path');
const nunjucks                    = require('nunjucks');
const dateFilter                  = require('./nunjucks/dateFilter');
const currencyFilter              = require('./nunjucks/currency');
const limitTo                     = require('./nunjucks/limitTo');
const jsonFilter                  = require('./nunjucks/json');
const timestampFilter             = require('./nunjucks/timestamp');
const replaceIdeaVariablesFilter  = require('./nunjucks/replaceIdeaVariables');
const flash                       = require('express-flash');
const expressValidator            = require('express-validator');
const FileStore                   = require('session-file-store')(expressSession);


const MemoryStore = expressSession.MemoryStore;

// Express configuration
const app = express();
const nunjucksEnv = nunjucks.configure('views', { autoescape: true, express: app });
app.set('view engine', 'html');
app.set('port', process.env.PORT || 4000);
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use((req, res, next) => {
  req.nunjucksEnv = nunjucksEnv;
  next();
});

/*
app.use((req, res, next) => {
  console.log('=====> REQUEST: ', req.originalUrl);
  console.log('=====> query: ', req.query);
  next();
});
*/

const sessionConfig = {
  saveUninitialized : true,
  resave            : true,
  secret            : config.session.secret,
//  store             : new MemoryStore(),
  store             : new FileStore({
    ttl:    config.session.maxAge      //3600 * 24 * 31
  }),
  key               : 'authorization.sid',
  cookie            : {
    maxAge: config.session.maxAge,
    secure: process.env.COOKIE_SECURE_OFF ===  'yes' ? false : true,
    httpOnly: process.env.COOKIE_SECURE_OFF ===  'yes' ? false : true,
    sameSite: false, //process.env.COOKIE_SECURE_OFF ===  'yes' ? false : true
  },

};

//console.log('=>>> sessionConfig', sessionConfig):

// Session Configuration
app.use(expressSession(sessionConfig));

app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());


// Passport configuration
require('./auth');

// static resources for stylesheets, images, javascript files

require('./routes')(app);

/**
 * From time to time we need to clean up any expired tokens
 * in the database
 */
setInterval(() => {
    db
    .accessTokens
    .removeExpired()
    .catch(err => console.error('Error trying to remove expired tokens:', err.stack));
}, config.db.timeToCheckExpiredTokens * 1000);

// TODO: Change these for your own certificates.  This was generated through the commands:
// openssl genrsa -out privatekey.pem 2048
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
const options = {
  key  : fs.readFileSync(path.join(__dirname, 'certs/privatekey.pem')),
  cert : fs.readFileSync(path.join(__dirname, 'certs/certificate.pem')),
};

// Set the ip-address of your trusted reverse proxy server such as
// haproxy or Apache mod proxy or nginx configured as proxy or others.
// The proxy server should insert the ip address of the remote client
// through request header 'X-Forwarded-For' as
// 'X-Forwarded-For: some.client.ip.address'
// Insertion of the forward header is an option on most proxy software
app.set('trust proxy', '127.0.0.1');


// Create our HTTPS server listening on port 3000.
//https.createServer(options, app).listen(3000);

// for dev allow http
app.listen(app.get('port'), function() {
  console.log('OAuth 2.0 Authorization Server started on port ' +  app.get('port'));
  console.log('Express server listening on port ' + app.get('port'));
});
