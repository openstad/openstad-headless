import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');

const descriptionErrors = async (attributes) => {
  const resource = db.Resource.build({
    projectId: 1,
    title: 'Titel van de inzending',
    startDate: new Date(),
    ...attributes,
  });
  try {
    await resource.validate({ hooks: false });
    return [];
  } catch (err) {
    return (err.errors || [])
      .filter((error) => error.path === 'description')
      .map((error) => error.message);
  }
};

describe('Resource description validation', () => {
  it('accepts a resource without a description', async () => {
    expect(await descriptionErrors({ publishDate: new Date() })).toEqual([]);
  });

  it('still rejects a published resource with a too short description', async () => {
    const errors = await descriptionErrors({
      publishDate: new Date(),
      description: 'kort',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^Beschrijving moet tussen/);
  });
});
