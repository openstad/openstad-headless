import { describe, expect, it } from 'vitest';

const guard = require('./api-token-scope-guard');

function run(req) {
  let error;
  guard(req, {}, (err) => {
    error = err;
  });
  return error;
}

function reqFor(over) {
  return Object.assign(
    {
      method: 'GET',
      apiTokenScope: 'reports',
      project: { config: { dataScope: {} } },
    },
    over
  );
}

describe('api-token-scope-guard', () => {
  it('passes through requests without a reporting token', () => {
    const error = run(
      reqFor({ apiTokenScope: undefined, path: '/api/project/2/vote' })
    );
    expect(error).toBeUndefined();
  });

  it('always allows the aggregated /stats endpoints', () => {
    expect(run(reqFor({ path: '/stats' }))).toBeUndefined();
    expect(
      run(reqFor({ path: '/stats/project/2/vote/total' }))
    ).toBeUndefined();
  });

  it('blocks a raw component route when the component is disabled', () => {
    const error = run(reqFor({ path: '/api/project/2/vote' }));
    expect(error).toBeDefined();
    expect(error.status).toBe(403);
  });

  it('allows a raw component route when the project enabled it', () => {
    const error = run(
      reqFor({
        path: '/api/project/2/vote',
        project: { config: { dataScope: { votes: { enabled: true } } } },
      })
    );
    expect(error).toBeUndefined();
  });

  it('rejects write methods even when the component is enabled (read-only)', () => {
    const error = run(
      reqFor({
        path: '/api/project/2/vote',
        method: 'POST',
        project: { config: { dataScope: { votes: { enabled: true } } } },
      })
    );
    expect(error.status).toBe(403);
  });

  it('blocks unknown routes for reporting tokens', () => {
    const error = run(reqFor({ path: '/api/project/2/widgets' }));
    expect(error.status).toBe(403);
  });

  it('rejects mutating GET action routes even on an enabled component', () => {
    const error = run(
      reqFor({
        path: '/api/project/2/vote/5/toggle',
        method: 'GET',
        project: { config: { dataScope: { votes: { enabled: true } } } },
      })
    );
    expect(error.status).toBe(403);
  });
});
