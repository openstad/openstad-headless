'use strict';
require('dotenv').config();

const bodyParser                  = require('body-parser');
//const client                      = require('./client');
const cookieParser                = require('cookie-parser');
const config                      = require('./config');
const express                     = require('express');
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
const replaceResourceVariablesFilter  = require('./nunjucks/replaceResourceVariables');
const flash                       = require('express-flash');
const expressSession              = require('express-session');
// const MemoryStore = expressSession.MemoryStore;
const getDbPassword               = require('./utils/getDbPassword');
const mysql                       = require('mysql2/promise');
const MySQLStore                  = require('express-mysql-session')(expressSession);

const initializeApp = async () => {
  try {
    // Express configuration
    const app = express();
    const nunjucksEnv = nunjucks.configure('views', { autoescape: true, express: app });
    app.set('view engine', 'html');
    app.set('port', process.env.PORT || 4000);
    app.use(express.static(path.join(__dirname, 'public')));
    
    require('./routes/healthRoute')(app)
    
    app.use(cookieParser());
    
    app.use((req, res, next) => {
      req.nunjucksEnv = nunjucksEnv;
      next();
    });
    
    const ssl = {
      rejectUnauthorized: false
    }
    
    if (process.env.MYSQL_CA_CERT) {
      ssl.ca = process.env.MYSQL_CA_CERT
      ssl.rejectUnauthorized = true
    }
    
    if (process.env.DB_REQUIRE_SSL) {
      ssl.require = true
      ssl.rejectUnauthorized = true
    }
    
    const mysqlConnectionPool = mysql.createPool({
      port:             process.env.DB_PORT || 3306,
      host:             process.env.DB_HOST,
      database:         process.env.DB_NAME || process.env.DB_SESSIONS,
      user:             process.env.DB_USER,
      password:         await getDbPassword(),
      connectionLimit:  parseInt(process.env.DB_MAX_POOL_SIZE || process.env.maxPoolSize) || 5,
      ssl
    })
    
    const sessionStore = new MySQLStore({}, mysqlConnectionPool);
    
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
    
    // Passport configuration
    require('./auth');
    
    // static resources for stylesheets, images, javascript files
    
    require('./routes/routes')(app);

    return app;
  } catch (error) {
    console.error('Failed to initialize the app:', error);
    throw error;
  }
}


module.exports = initializeApp;
