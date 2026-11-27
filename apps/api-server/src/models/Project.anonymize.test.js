import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const originalFindAll = db.User.findAll;

describe('Project.willAnonymizeAllUsers', () => {
  afterEach(() => {
    db.User.findAll = originalFindAll;
  });

  it('rejects an active project with a 400 and the project-has-ended message', async () => {
    // Suppress console.log output during the test
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const project = db.Project.build({
        id: 1,
        name: 'A',
        config: { project: { projectHasEnded: false } },
      });

      await expect(project.willAnonymizeAllUsers()).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('project-has-ended parameter'),
      });
    } finally {
      logSpy.mockRestore();
    }
  });

  it('allows anonymization when projectHasEnded is true', async () => {
    db.User.findAll = vi.fn().mockResolvedValue([]);
    const project = db.Project.build({
      id: 1,
      name: 'A',
      config: { project: { projectHasEnded: true } },
    });

    await expect(project.willAnonymizeAllUsers()).resolves.toMatchObject({
      admins: [],
      users: [],
      externalUserIds: [],
    });
  });

  it('allows anonymization when endDate has passed even if projectHasEnded is false', async () => {
    db.User.findAll = vi.fn().mockResolvedValue([]);
    const project = db.Project.build({
      id: 1,
      name: 'A',
      config: {
        project: {
          projectHasEnded: false,
          endDate: '2020-01-01T00:00:00.000Z',
        },
      },
    });

    await expect(project.willAnonymizeAllUsers()).resolves.toMatchObject({
      admins: [],
      users: [],
      externalUserIds: [],
    });
  });
});
