/**
 * Preload script: run with node -r ./telemetry-preload.js ...
 * Ensures OpenTelemetry is initialized before Next.js loads, so traces reach the collector.
 */
const {
  createTelemetry,
  setupGracefulShutdown,
} = require('@openstad-headless/lib/telemetry');

const telemetryManager = createTelemetry({
  serviceName: 'openstad-admin-server',
});

telemetryManager.initialize();
setupGracefulShutdown(telemetryManager);
