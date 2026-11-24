import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const ctrl = require('./projectController');

let created = null;

db.Project.create = async (values) => {
  created = values;
  throw new Error('stop after create');
};

function createProject(body, isDuplicationPayload = false) {
  return new Promise((resolve) => {
    ctrl.createProjectRecord(
      { body, isDuplicationPayload, skipDefaultStatuses: false },
      {},
      resolve
    );
  });
}

describe('config of a new project', () => {
  beforeEach(() => {
    created = null;
  });

  it('turns on anonymous voting and sets the resource and map limits', async () => {
    await createProject({ name: 'Nieuw project' });

    expect(created.config).toMatchObject({
      votes: {
        isViewable: true,
        isActive: true,
        requiredUserRole: 'anonymous',
      },
      resources: {
        titleMinLength: 5,
        titleMaxLength: 50,
        summaryMinLength: 20,
        summaryMaxLength: 250,
        descriptionMinLength: 50,
        descriptionMaxLength: 1000,
        minimumYesVotes: 25,
      },
      map: {
        minZoom: '11',
        maxZoom: '20',
      },
    });
  });

  it('keeps config that is sent along', async () => {
    await createProject({
      name: 'Nieuw project',
      config: { votes: { requiredUserRole: 'member' }, project: { x: 1 } },
    });

    expect(created.config.votes.requiredUserRole).toBe('member');
    expect(created.config.votes.isActive).toBe(true);
    expect(created.config.project).toEqual({ x: 1 });
  });

  it('leaves the config of a duplicated or template project as it is', async () => {
    const config = { votes: { isActive: false } };

    await createProject({ name: 'Kopie', config }, true);

    expect(created.config).toEqual({ votes: { isActive: false } });
  });
});
