import config from 'config';
import { describe, expect, it } from 'vitest';

const getUser = require('./user');
const { isApiTokenAuthorizedForProject } = getUser;

const ADMIN_PROJECT_ID = config.get('admin.projectId');
// Two ordinary (non-admin) project ids, distinct from ADMIN_PROJECT_ID and
// from each other, regardless of what ADMIN_PROJECT_ID happens to be.
const PROJECT_A = ADMIN_PROJECT_ID + 100;
const PROJECT_B = ADMIN_PROJECT_ID + 200;

// Cross-project reporting token isolation (PR #54 review c4): a reporting
// token bound to project A must never be honoured on a request scoped to
// project B. This is the actual enforcement point behind handleApiToken's
// project-binding check in this file — api-token-scope-guard.js only runs
// once req.apiTokenScope is already 'reports', which handleApiToken only
// sets after this check passes.
describe('isApiTokenAuthorizedForProject (cross-project token isolation)', () => {
  it('denies a token bound to project A on a request scoped to project B', () => {
    const owner = { projectId: PROJECT_A, role: 'admin' }; // project-A admin, not a superuser
    const apiToken = { projectId: PROJECT_A }; // token issued for project A
    expect(
      isApiTokenAuthorizedForProject({
        owner,
        apiToken,
        reqProjectId: PROJECT_B,
      })
    ).toBe(false);
  });

  it('allows a token on a request scoped to the same project it was issued for', () => {
    const owner = { projectId: PROJECT_A, role: 'editor' };
    const apiToken = { projectId: PROJECT_A };
    expect(
      isApiTokenAuthorizedForProject({
        owner,
        apiToken,
        reqProjectId: PROJECT_A,
      })
    ).toBe(true);
  });

  it('denies when the request has no resolved project at all', () => {
    const owner = { projectId: PROJECT_A, role: 'editor' };
    const apiToken = { projectId: PROJECT_A };
    expect(
      isApiTokenAuthorizedForProject({
        owner,
        apiToken,
        reqProjectId: undefined,
      })
    ).toBe(false);
  });

  it('a superuser (admin on the admin project) may cross project boundaries', () => {
    const owner = { projectId: ADMIN_PROJECT_ID, role: 'admin' };
    const apiToken = { projectId: PROJECT_A };
    expect(
      isApiTokenAuthorizedForProject({
        owner,
        apiToken,
        reqProjectId: PROJECT_B,
      })
    ).toBe(true);
  });

  it('an admin who is NOT on the admin project is not treated as a superuser', () => {
    const owner = { projectId: PROJECT_A, role: 'admin' }; // admin of project A, not the admin project
    const apiToken = { projectId: PROJECT_A };
    expect(
      isApiTokenAuthorizedForProject({
        owner,
        apiToken,
        reqProjectId: PROJECT_B,
      })
    ).toBe(false);
  });
});
