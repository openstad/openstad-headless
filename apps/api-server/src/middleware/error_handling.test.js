import { describe, expect, test, vi } from 'vitest';

const registerErrorHandling = require('./error_handling');

function createHarness() {
  const handlers = [];
  const app = {
    use(handler) {
      handlers.push(handler);
    },
    get(key) {
      if (key === 'env') return 'production';
      return undefined;
    },
  };

  registerErrorHandling(app);

  return {
    notFoundHandler: handlers[0],
    errorHandler: handlers[1],
  };
}

function createReq(method, originalUrl) {
  return {
    method,
    originalUrl,
    url: originalUrl,
    params: { projectId: '1' },
    user: { id: 99, role: 'member' },
  };
}

function createRes() {
  return {
    status: vi.fn(),
    json: vi.fn(),
  };
}

describe('error handling submit-failure logging', () => {
  test.each([
    ['POST', '/api/project/1/resource'],
    ['PUT', '/api/project/1/resource/2'],
    ['DELETE', '/api/project/1/resource/2'],
    ['POST', '/api/project/1/resource/2/comment'],
    ['PUT', '/api/project/1/resource/2/comment/3'],
    ['DELETE', '/api/project/1/resource/2/comment/3'],
    ['POST', '/api/project/1/resource/2/comment/3/vote/yes'],
    ['POST', '/api/project/1/submission'],
    ['POST', '/api/project/1/choicesguide'],
    ['POST', '/api/project/1/vote'],
    ['POST', '/api/project/1/vote/anything'],
    ['POST', '/api/project/1/resource?nomail=1'],
    ['DELETE', '/api/project/1/widget/4'],
  ])('logs failed submit for %s %s', (method, url) => {
    const { errorHandler } = createHarness();
    const req = createReq(method, url);
    const res = createRes();
    const err = { status: 422, message: 'Validation failed' };
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    errorHandler(err, req, res, vi.fn());

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(payload.type).toBe('submit_failure');
    expect(payload.method).toBe(method);
    expect(payload.path).toBe(url);
    expect(payload.status).toBe(422);
    expect(payload.projectId).toBe('1');
    expect(payload.userId).toBe(99);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 422 })
    );
  });

  test.each([
    ['GET', '/api/project/1/resource/2'],
    ['POST', '/auth/project/1/login'],
    ['DELETE', '/health'],
  ])('does not log for excluded endpoint %s %s', (method, url) => {
    const { errorHandler } = createHarness();
    const req = createReq(method, url);
    const res = createRes();
    const err = { status: 500, message: 'Unexpected' };
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    errorHandler(err, req, res, vi.fn());

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500 })
    );
  });
});
