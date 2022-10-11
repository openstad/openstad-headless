'use strict';
require('dotenv').config();

const bodyParser                  = require('body-parser');
//const client                      = require('./client');
const cookieParser                = require('cookie-parser');
const config                      = require('./config');
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
const MongoStore                 = require('connect-mongo')(expressSession);

//const MemoryStore = expressSession.MemoryStore;

/*const MySQLStore                  = require('express-mysql-session')(expressSession);
var options = ;

const sessionStore = new MySQLStore({
    port:     3306,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SESSIONS,
});

*/


function getMongoDbConnectionString () {
  // Allow the connection string builder to be overridden by an environment variable
  if (process.env.MONGO_DB_CONNECTION_STRING) {
    return process.env.MONGO_DB_CONNECTION_STRING.replace("{database}", 'sessions');
  }
  
  const host = process.env.MONGO_DB_HOST || 'localhost';
  const port = process.env.MONGO_DB_PORT || 27017;
  const user = process.env.MONGO_DB_USER || '';
  const password = process.env.MONGO_DB_PASSWORD || '';
  const authSource = process.env.MONGO_DB_AUTHSOURCE || '';
  
  const useAuth = user && password;
  
  return `mongodb://${useAuth ? `${user}:${password}@` : ''}${host}:${port}/sessions${authSource ? `?authSource=${authSource}` : ''}`;
}

const url = getMongoDbConnectionString();

const sessionStore =  new MongoStore({
    url: url,
    ttl: 700 * 24 * 60 * 60 // = 700 days. Default
})


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



let sessionCookieConfig;


// add complete config for debug purposes
if (process.env.SESSION_COOKIES_CONFIG) {
  sessionCookieConfig = JSON.parse(process.env.SESSION_COOKIES_CONFIG);
} else {
   sessionCookieConfig = {
    maxAge: config.session.maxAge,
  //  domain: 'localhost',
    secure: process.env.COOKIE_SECURE_OFF ===  'yes' ? false : true,
    httpOnly:  process.env.COOKIE_SECURE_OFF ===  'yes' ? false : true,
  }
}

const sessionConfig = {
  saveUninitialized : true,
  resave            : true,
  secret            : config.session.secret,
  store             : sessionStore,
  key               : 'openstad-authorization.sid',
  cookie            : sessionCookieConfig,
};


// Session Configuration
app.use(expressSession(sessionConfig));

app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());

/*
app.use((req, res, next) => {
  console.log('=====> REQUEST: ', req.originalUrl);
  console.log('=====> query: ', req.query);
  console.log('=====> body: ', req.body);
  console.log('=====> session: ', req.session);
  next();
});
*/

// Passport configuration
require('./auth');

// static resources for stylesheets, images, javascript files

require('./routes/routes')(app);

// /**
//  * From time to time we need to clean up any expired tokens
//  * in the database
//  */
// setInterval(() => {
//     db
//     .accessTokens
//     .removeExpired()
//     .catch(err => console.error('Error trying to remove expired tokens:', err.stack));
// }, config.db.timeToCheckExpiredTokens * 1000);
//
// // Set the ip-address of your trusted reverse proxy server such as
// // haproxy or Apache mod proxy or nginx configured as proxy or others.
// // The proxy server should insert the ip address of the remote client
// // through request header 'X-Forwarded-For' as
// // 'X-Forwarded-For: some.client.ip.address'
// // Insertion of the forward header is an option on most proxy software
//
// app.set('trust proxy', '127.0.0.1');

module.exports = app;
