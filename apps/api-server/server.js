require('dotenv').config();

const {
  createTelemetry,
  setupGracefulShutdown,
} = require('@openstad-headless/lib/telemetry');
const telemetryManager = createTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME || 'openstad-api-server',
});
telemetryManager.initialize();
setupGracefulShutdown(telemetryManager);

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

// Refuse to start when a project overrides the global jwtSecret
const projectAuthConfig = require('./src/services/validateProjectAuthConfig');
projectAuthConfig
  .findProjectsWithJwtSecretOverride(require('./src/db'))
  .then((offendingProjectIds) => {
    if (offendingProjectIds.length === 0) return;
    console.error(
      `[auth-settings] Startup validation failed: project(s) ${offendingProjectIds.join(', ')} override config.auth.jwtSecret. Tokens are verified with the global secret, so per-project overrides break login. Remove the jwtSecret from these project configs before starting the server.`
    );
    process.exit(1);
  })
  .catch((err) => {
    console.error('[auth-settings] Startup validation error:', err.message);
  });

Server.start(config.get('express.port'));
