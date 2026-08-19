import { describe, expect, it, vi } from 'vitest';

const requireReportingToken = require('./require-reporting-token');

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    _headers: {},
    set(key, value) {
      this._headers[key] = value;
      return this;
    },
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

describe('requireReportingToken', () => {
  it('401s a request with no apiTokenScope (missing/invalid token) and returns no data', () => {
    const req = {};
    const res = makeRes();
    const next = vi.fn();

    requireReportingToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(401);
    expect(res._headers['Content-Type']).toBe('application/problem+json');
    expect(res._body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/401',
      title: 'A valid reporting API token is required',
      status: 401,
    });
    expect(res._headers['WWW-Authenticate']).toBe('Bearer');
  });

  it('401s a request with a non-reporting scope', () => {
    const req = { apiTokenScope: 'other' };
    const res = makeRes();
    const next = vi.fn();

    requireReportingToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(401);
    expect(res._body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/401',
      title: 'A valid reporting API token is required',
      status: 401,
    });
  });

  it('calls next (no status) for a valid reporting token', () => {
    const req = { apiTokenScope: 'reports' };
    const res = makeRes();
    const next = vi.fn();

    requireReportingToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res._status).toBeNull();
    expect(res._body).toBeNull();
  });
});
