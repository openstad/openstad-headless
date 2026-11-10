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

describe('Project.willAnonymizeAllUsers', () => {
  it('rejects an active project with a 400 and the project-has-ended message', async () => {
    const project = db.Project.build({
      id: 1,
      name: 'A',
      config: { project: { projectHasEnded: false } },
    });

    await expect(project.willAnonymizeAllUsers()).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('project-has-ended parameter'),
    });
  });
});
