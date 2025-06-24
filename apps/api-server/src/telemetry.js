const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

class TelemetryManager {
  constructor(config = {}) {
    this.config = {
      enabled: process.env.OTEL_ENABLED !== 'false',
      serviceName: process.env.OTEL_SERVICE_NAME || 'openstad-api-server',
      serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces',
      ...config,
    };
    this.sdk = null;
  }

  initialize() {
    if (!this.config.enabled) {
      console.log('OpenTelemetry is disabled');
      return;
    }

    try {
      // Create the resource with service information
      const resource = new Resource({
        [ATTR_SERVICE_NAME]: this.config.serviceName,
        [ATTR_SERVICE_VERSION]: this.config.serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: this.config.environment,
      });

      // Create the OTLP exporter
      const traceExporter = new OTLPTraceExporter({
        url: this.config.otlpEndpoint,
        headers: this.config.otlpHeaders || {},
      });

      // Create the SDK
      this.sdk = new NodeSDK({
        resource,
        spanProcessor: new SimpleSpanProcessor(traceExporter),
        instrumentations: [
          getNodeAutoInstrumentations({
            // Configure specific instrumentations
            '@opentelemetry/instrumentation-http': {
              ignoreIncomingPaths: ['/health', '/metrics', '/favicon.ico'],
              enabled: true,
            },
            '@opentelemetry/instrumentation-express': {
              ignoreLayers: ['/health', '/metrics'],
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

      // Initialize the SDK
      this.sdk.start();
      console.log(`OpenTelemetry initialized for ${this.config.serviceName}`);
      console.log(`Sending traces to: ${this.config.otlpEndpoint}`);
    } catch (error) {
      console.error('Failed to initialize OpenTelemetry:', error);
    }
  }

  shutdown() {
    if (this.sdk) {
      return this.sdk.shutdown();
    }
    return Promise.resolve();
  }
}

// Create and export a singleton instance
const telemetryManager = new TelemetryManager();

// Graceful shutdown handler
const setupGracefulShutdown = () => {
  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down telemetry...`);
    try {
      await telemetryManager.shutdown();
      console.log('Telemetry shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during telemetry shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

module.exports = {
  TelemetryManager,
  telemetryManager,
  setupGracefulShutdown,
}; 