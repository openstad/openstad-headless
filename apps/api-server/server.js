require('dotenv').config();

// Initialize telemetry FIRST, before any other modules
const { telemetryManager, setupGracefulShutdown } = require('./src/telemetry');
telemetryManager.initialize();
setupGracefulShutdown();

const config = require('config');

// Env variable used by npm's `debug` package.
process.env.DEBUG = config.logging;

// Order is relevant.
require('./config/promises');
require('./config/moment');
require('./config/debug');

// Start HTTP server.
const Server = require('./src/Server');
const Cron = require('./src/cron-calendar');

Cron.start();

Server.init();
Server.start(config.get('express.port'));
