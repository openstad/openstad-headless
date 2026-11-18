'use strict';

/**
 * Shared OpenAPI 3.x components for the reporting API (`@openapi` JSDoc blocks
 * in routes/api/reports/*.js reference these via $ref, instead of repeating
 * the same envelope/error/parameter shapes 12 times).
 *
 * swagger-jsdoc merges this `definition` object with the per-file `@openapi`
 * annotations discovered via the `apis` glob (see ../../../routes/api/reports/openapi.js).
 */
const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Openstad reporting API',
    version: '1.0.0',
    description:
      'Read-only reporting endpoints for participation data, scoped per project and filtered by the enabled reporting data-scope.',
    contact: {
      name: 'Openstad',
      url: 'https://openstad.org',
      email: 'contact@openstad.org',
    },
  },
  servers: [{ url: '/api/project/{projectId}/reports/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'osr_...',
        description:
          'Reporting API token (osr_ prefix), scoped to a single project and to read-only reporting access.',
      },
    },
    parameters: {
      dateFrom: {
        name: 'dateFrom',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date' },
        description:
          "Half-open range start (inclusive) on createdAt, UTC. 'YYYY-MM-DD' or full ISO-8601.",
      },
      dateTo: {
        name: 'dateTo',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date' },
        description:
          "Half-open range end (exclusive) on createdAt, UTC. 'YYYY-MM-DD' or full ISO-8601.",
      },
      status: {
        name: 'status',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description:
          'Filters by status, only for components that have a status column.',
      },
      page: {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      pageSize: {
        name: 'pageSize',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
      },
    },
    schemas: {
      ReportEnvelope: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' } },
          nextLink: {
            type: 'string',
            nullable: true,
            description:
              'Relative path to the next page, or null on the last page.',
          },
        },
      },
      Problem: {
        type: 'object',
        description: 'RFC 9457 problem details (NLgov API Design Rules).',
        properties: {
          type: { type: 'string', format: 'uri' },
          title: { type: 'string' },
          status: { type: 'integer' },
          detail: { type: 'string' },
          errors: {
            type: 'array',
            description:
              'Present when multiple independent validation errors were found on the same request; each entry has the same shape as a single problem (code/title/param/detail).',
            items: { type: 'object' },
          },
        },
        required: ['type', 'title', 'status'],
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid filter parameter.',
        content: {
          'application/problem+json': {
            schema: { $ref: '#/components/schemas/Problem' },
          },
        },
      },
      Unauthorized: {
        description: 'Missing or invalid reporting API token.',
        content: {
          'application/problem+json': {
            schema: { $ref: '#/components/schemas/Problem' },
          },
        },
      },
      Forbidden: {
        description:
          "Valid token, but this component/path is not enabled for the project's reporting scope.",
        content: {
          'application/problem+json': {
            schema: { $ref: '#/components/schemas/Problem' },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

module.exports = { definition };
