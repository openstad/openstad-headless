require('dotenv').config();
const config = require('config');

console.log(config.auth.adapter.openstad);


// Env variable used by npm's `debug` package.
process.env.DEBUG = config.logging;

// Order is relevant.
require('./config/promises');
require('./config/debug');

// Start HTTP server.
const Server     = require('./src/Server');
const Cron       = require('./src/cron-calendar');

Cron.start();

Server.init();
Server.start(config.get('express.port'));
