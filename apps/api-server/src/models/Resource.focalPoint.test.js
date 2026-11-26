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

describe('Resource images focalPoint', () => {
  it('keeps the focalPoint when images are set again in the resident-form shape', () => {
    const resource = db.Resource.build({
      projectId: 1,
      title: 'Titel van de inzending',
      images: [{ url: 'https://a.jpg', focalPoint: { x: 25, y: 75 } }],
    });
    expect(resource.images[0].focalPoint).toEqual({ x: 25, y: 75 });

    resource.images = [
      { name: 'a.jpg', url: 'https://a.jpg', description: 'alt' },
    ];

    expect(resource.images).toEqual([
      {
        url: 'https://a.jpg',
        name: 'a.jpg',
        description: 'alt',
        focalPoint: { x: 25, y: 75 },
      },
    ]);
  });
});
