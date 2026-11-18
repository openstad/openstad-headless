import { describe, expect, it, vi } from 'vitest';

const {
  buildProblem,
  fromFilterError,
  fromFilterErrors,
  fromPlainError,
  fromAppError,
  sendProblem,
  problemJsonWrapper,
} = require('./problem-json');
const { ReportingFilterError } = require('./filters');

function makeRes(initialStatus = 200) {
  const res = {
    statusCode: initialStatus,
    _body: null,
    _headers: {},
    set(key, value) {
      this._headers[key] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

describe('buildProblem', () => {
  it('builds an RFC 9457 body with a default type derived from status', () => {
    const body = buildProblem(400, { title: 'Bad request' });
    expect(body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/400',
      title: 'Bad request',
      status: 400,
    });
  });

  it('includes detail only when provided', () => {
    expect(buildProblem(404, { title: 'Not found' })).not.toHaveProperty(
      'detail'
    );
    expect(
      buildProblem(404, { title: 'Not found', detail: 'no such thing' })
    ).toHaveProperty('detail', 'no such thing');
  });

  it('passes through extension fields', () => {
    const body = buildProblem(400, {
      title: 'x',
      code: 'invalid_date',
      param: 'dateFrom',
    });
    expect(body.code).toBe('invalid_date');
    expect(body.param).toBe('dateFrom');
  });
});

describe('fromFilterError', () => {
  it('maps a ReportingFilterError onto the problem body, reusing its fields', () => {
    const err = new ReportingFilterError(
      'invalid_date',
      "'dateFrom' is not a valid date: 'nope'",
      'dateFrom',
      'Use YYYY-MM-DD or ISO-8601 UTC'
    );
    const body = fromFilterError(err);
    expect(body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/400',
      title: "'dateFrom' is not a valid date: 'nope'",
      status: 400,
      detail: 'Use YYYY-MM-DD or ISO-8601 UTC',
      code: 'invalid_date',
      param: 'dateFrom',
    });
  });
});

describe('fromFilterErrors', () => {
  it('maps multiple ReportingFilterErrors onto one problem body with an errors array', () => {
    const errs = [
      new ReportingFilterError(
        'invalid_date',
        "'dateFrom' is not a valid date: 'nope'",
        'dateFrom',
        'Use YYYY-MM-DD or ISO-8601 UTC'
      ),
      new ReportingFilterError(
        'unsupported_status_filter',
        "The 'votes' report has no status field to filter on",
        'status',
        'Remove the status parameter for this endpoint'
      ),
    ];
    const body = fromFilterErrors(errs);
    expect(body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/400',
      title: 'Multiple validation errors',
      status: 400,
      errors: [
        {
          code: 'invalid_date',
          title: "'dateFrom' is not a valid date: 'nope'",
          param: 'dateFrom',
          detail: 'Use YYYY-MM-DD or ISO-8601 UTC',
        },
        {
          code: 'unsupported_status_filter',
          title: "The 'votes' report has no status field to filter on",
          param: 'status',
          detail: 'Remove the status parameter for this endpoint',
        },
      ],
    });
  });
});

describe('fromPlainError', () => {
  it('maps a plain { error: string } shape (401/403) onto the problem body', () => {
    expect(
      fromPlainError(401, 'A valid reporting API token is required')
    ).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/401',
      title: 'A valid reporting API token is required',
      status: 401,
    });
  });
});

describe('fromAppError', () => {
  it('maps the app-wide error_handling.js shape onto the problem body', () => {
    const body = fromAppError({
      status: 500,
      friendlyStatus: 'Internal Server Error',
      message: 'Something broke',
      errorStack: '',
    });
    expect(body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/500',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Something broke',
    });
  });

  it('includes errorStack only when non-empty (dev/admin debug mode)', () => {
    const body = fromAppError({
      status: 500,
      friendlyStatus: 'Internal Server Error',
      message: 'Something broke',
      errorStack: 'Error: boom\n  at x',
    });
    expect(body.errorStack).toBe('Error: boom\n  at x');
  });

  it('falls back to message as the title when friendlyStatus is absent (confirmed live: statuses[status] resolves to undefined in this repo)', () => {
    const body = fromAppError({
      status: 500,
      message: 'Something broke',
      errorStack: '',
    });
    expect(body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/500',
      title: 'Something broke',
      status: 500,
    });
  });
});

describe('sendProblem', () => {
  it('sets status, content-type, and sends the body', () => {
    const res = makeRes();
    sendProblem(res, 400, { title: 'x', status: 400 });
    expect(res.statusCode).toBe(400);
    expect(res._headers['Content-Type']).toBe('application/problem+json');
    expect(res._body).toEqual({ title: 'x', status: 400 });
  });
});

describe('problemJsonWrapper', () => {
  it('reshapes an error_handling.js-shaped 500 response into problem+json', () => {
    const req = {};
    const res = makeRes(500);
    const next = vi.fn();

    problemJsonWrapper(req, res, next);
    expect(next).toHaveBeenCalledOnce();

    res.json({
      status: 500,
      friendlyStatus: 'Internal Server Error',
      message: 'Something broke',
      errorStack: '',
    });

    expect(res._headers['Content-Type']).toBe('application/problem+json');
    expect(res._body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/500',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Something broke',
    });
  });

  it('reshapes the REAL runtime shape (no friendlyStatus — see fromAppError) into problem+json', () => {
    const req = {};
    const res = makeRes(500);
    const next = vi.fn();

    problemJsonWrapper(req, res, next);
    res.json({
      status: 500,
      message: 'Something broke',
      errorStack: '',
    });

    expect(res._headers['Content-Type']).toBe('application/problem+json');
    expect(res._body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/500',
      title: 'Something broke',
      status: 500,
    });
  });

  it('leaves an already-shaped problem+json body untouched (sent via sendProblem upstream)', () => {
    const req = {};
    const res = makeRes(400);
    const next = vi.fn();

    problemJsonWrapper(req, res, next);
    const problemBody = {
      type: 'https://developer.overheid.nl/api-design-rules/problem/400',
      title: 'x',
      status: 400,
    };
    res.json(problemBody);

    expect(res._body).toBe(problemBody);
  });

  it('leaves a normal 2xx payload untouched', () => {
    const req = {};
    const res = makeRes(200);
    const next = vi.fn();

    problemJsonWrapper(req, res, next);
    res.json({ data: [], nextLink: null });

    expect(res._body).toEqual({ data: [], nextLink: null });
    expect(res._headers['Content-Type']).toBeUndefined();
  });
});
