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

// Validate external certificates infrastructure on startup
const externalCertificates = require('./src/services/externalCertificates');
externalCertificates.validateInfrastructure().catch((err) => {
  console.error(
    '[external-certificates] Startup validation error:',
    err.message
  );
});

Server.start(config.get('express.port'));
