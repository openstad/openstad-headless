import { describe, expect, it } from 'vitest';

const SwaggerParser = require('@apidevtools/swagger-parser');
const openapiSpec = require('./openapi');

function getSpec() {
  let captured;
  openapiSpec({}, { json: (body) => (captured = body) });
  return captured;
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

  it('declares the bearer security scheme', () => {
    const spec = getSpec();
    expect(spec.components.securitySchemes.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });
});
