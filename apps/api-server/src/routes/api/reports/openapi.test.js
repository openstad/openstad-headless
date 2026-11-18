import { describe, expect, it } from 'vitest';

const SwaggerParser = require('@apidevtools/swagger-parser');
const openapiSpec = require('./openapi');

// Returns both the emitted spec and the request object the handler mutated, so
// tests can assert on either side of the call.
function callHandler() {
  const req = {};
  let captured;
  openapiSpec(req, { json: (body) => (captured = body) });
  return { req, spec: captured };
}

function getSpec() {
  return callHandler().spec;
}

describe('GET /openapi.json', () => {
  it('is a valid OpenAPI 3.x document', async () => {
    const spec = getSpec();
    await expect(
      SwaggerParser.validate(JSON.parse(JSON.stringify(spec)))
    ).resolves.toBeDefined();
  });

  it('documents all 12 reporting endpoints', () => {
    const spec = getSpec();
    expect(Object.keys(spec.paths)).toHaveLength(12);
    expect(spec.paths).toHaveProperty('/resources');
    expect(spec.paths).toHaveProperty('/submissions/fields');
    expect(spec.paths).toHaveProperty('/users/anonymized');
    expect(spec.paths).toHaveProperty('/users/aggregates');
  });

  it('marks the response as a schema response, without which report-field-filter blocks the spec for any request carrying a reporting token', () => {
    // Same flag submissions-fields.js:205 sets, read by the single consumer
    // report-field-filter.js:126. Without it the filter falls into its
    // aggregate branch (componentKey is null for /openapi.json) and
    // isSafeAggregate rejects the deeply nested `paths` object, replacing the
    // spec with a "Response blocked" body — silently, and only for
    // token-carrying clients, which is every real integrator.
    expect(callHandler().req.reportSchemaResponse).toBe(true);
  });

  it('declares the bearer security scheme', () => {
    const spec = getSpec();
    expect(spec.components.securitySchemes.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });
});
