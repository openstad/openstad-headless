import path from 'path';
import { describe, expect, it, vi } from 'vitest';

// Redirect the package import to the local worktree file so tests can run
// before npm install has updated the shared node_modules.
vi.mock('@openstad-headless/lib/report-data-scope', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(
    path.resolve(__dirname, '../../../../packages/lib/report-data-scope')
  );
});

const apiTokenScopeGuard = require('./api-token-scope-guard');

function makeReq({ apiTokenScope, method, path, projectDataScope } = {}) {
  return {
    apiTokenScope,
    method: method || 'GET',
    path: path || '/project/1/resource',
    project: {
      config: {
        dataScope: projectDataScope,
      },
    },
  };
}

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

describe('apiTokenScopeGuard', () => {
  describe('non-reporting requests pass through', () => {
    it('calls next for requests without apiTokenScope', () => {
      const req = makeReq({ apiTokenScope: undefined });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res._status).toBeNull();
    });

    it('calls next for non-reporting scope', () => {
      const req = makeReq({ apiTokenScope: 'other' });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe('reporting token — method enforcement', () => {
    it('blocks POST with 403', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'POST',
        path: '/project/1/resource',
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('blocks PUT with 403', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'PUT',
        path: '/project/1/resource',
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
    });
  });

  describe('reporting token — mutating GET paths are blocked', () => {
    it('blocks /vote/:id/toggle', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/vote/42/toggle',
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('blocks /like endpoint', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/resource/5/like',
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
    });
  });

  describe('reporting token — component disabled → 403', () => {
    it('returns 403 when dataScope has no config', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/resource',
        projectDataScope: undefined,
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 403 when component is enabled:false', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/resource',
        projectDataScope: { resources: { enabled: false, personalFields: [] } },
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
    });
  });

  describe('reporting token — component enabled → pass through', () => {
    it('calls next and sets req.reportingScope when component is enabled', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/resource/total',
        projectDataScope: {
          resources: { enabled: true, personalFields: ['title'] },
        },
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.reportingScope).toMatchObject({
        componentKey: 'resources',
        enabledPersonalFields: ['title'],
      });
    });
  });

  describe('reporting token — allowlisted non-component path', () => {
    it('allows /overview without component config check', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/overview',
        projectDataScope: undefined,
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.reportingScope).toMatchObject({ componentKey: null });
    });
  });

  describe('reporting token — non-allowlisted non-component path → 403', () => {
    it('blocks /user (PII endpoint)', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/user',
        projectDataScope: undefined,
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('blocks /audit-log', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/audit-log',
        projectDataScope: undefined,
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('reporting token — anchored component matching', () => {
    it('matches singular /choicesguide (main-API spelling)', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/choicesguide',
        projectDataScope: {
          choiceguides: { enabled: true, personalFields: ['result'] },
        },
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.reportingScope).toMatchObject({
        componentKey: 'choiceguides',
        enabledPersonalFields: ['result'],
      });
    });

    it('attributes nested /resource/:id/comment to comments, not resources', () => {
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/resource/5/comment',
        projectDataScope: {
          comments: { enabled: true, personalFields: [] },
          resources: { enabled: false, personalFields: [] },
        },
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.reportingScope).toMatchObject({ componentKey: 'comments' });
    });
  });

  describe('guard does not treat similar prefixes as component matches', () => {
    it('/resources-evil does not match resources component and is blocked', () => {
      // Anchored segment matching: 'resources-evil' is not a known component
      // segment, so matchComponent returns null and the fail-closed
      // non-component branch blocks it (no allowlisted segment present).
      const req = makeReq({
        apiTokenScope: 'reports',
        method: 'GET',
        path: '/project/1/resources-evil',
        projectDataScope: { resources: { enabled: false, personalFields: [] } },
      });
      const res = makeRes();
      const next = vi.fn();

      apiTokenScopeGuard(req, res, next);

      expect(res._status).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
