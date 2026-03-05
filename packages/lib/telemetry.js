const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
// Use standard OTel resource attribute names (semantic-conventions exports can vary by version)
const SERVICE_NAME = 'service.name';
const SERVICE_VERSION = 'service.version';
const DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const defaultConfig = {
  enabled: process.env.OTEL_ENABLED !== 'false',
  serviceName: process.env.OTEL_SERVICE_NAME || 'openstad-service',
  serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  otlpEndpoint:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    'http://openstad-otel-collector:4318/v1/traces',
};

function mergeConfig(config = {}) {
  return {
    ...defaultConfig,
    ...config,
  };
}

function createTelemetry(config = {}) {
  const merged = mergeConfig(config);
  let sdk = null;

  function initialize() {
    if (!merged.enabled) {
      console.log('OpenTelemetry is disabled');
      return;
    }

    try {
      const resource = new Resource({
        [SERVICE_NAME]: merged.serviceName,
        [SERVICE_VERSION]: merged.serviceVersion,
        [DEPLOYMENT_ENVIRONMENT]: merged.environment,
      });

      const traceExporter = new OTLPTraceExporter({
        url: merged.otlpEndpoint,
        headers: merged.otlpHeaders || {},
      });

      sdk = new NodeSDK({
        resource,
        spanProcessor: new SimpleSpanProcessor(traceExporter),
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-http': {
              ignoreIncomingPaths: ['/health', '/metrics', '/favicon.ico'],
              enabled: true,
            },
            '@opentelemetry/instrumentation-express': {
              ignoreLayers: ['/health', '/metrics'],
            },
            '@opentelemetry/instrumentation-fs': {
              enabled: false,
            },
            '@opentelemetry/instrumentation-mysql2': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-redis': {
              enabled: true,
            },
          }),
        ],
      });

      sdk.start();
      console.log(`OpenTelemetry initialized for ${merged.serviceName}`);
      console.log(`Sending traces to: ${merged.otlpEndpoint}`);
    } catch (error) {
      console.error('Failed to initialize OpenTelemetry:', error);
    }
  }

  function shutdown() {
    if (sdk) {
      return sdk.shutdown();
    }
    return Promise.resolve();
  }

  return { initialize, shutdown };
}

function setupGracefulShutdown(telemetry) {
  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down telemetry...`);
    try {
      await telemetry.shutdown();
      console.log('Telemetry shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during telemetry shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = {
  createTelemetry,
  setupGracefulShutdown,
};
