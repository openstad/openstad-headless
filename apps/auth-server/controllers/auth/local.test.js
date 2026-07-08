import { createRequire } from 'module';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// NOTE: the controller is a CommonJS module whose `require` calls are NOT
// intercepted by vi.mock under Vite SSR externalization. Instead we require the
// SAME singleton modules the controller uses (shared require cache) and replace
// their methods/exports directly. This makes the controller call our fakes.
const require = createRequire(import.meta.url);

const passport = require('passport');
const db = require('../../db');
const clientAuth = require('../../utils/clientAuth');
const auditLog = require('../../middleware/auditLog');

// passport.authenticate(strategy, cb) -> middleware(req,res,next) running cb.
let passportResult = { err: null, user: null };
const authSpy = vi
  .spyOn(passport, 'authenticate')
  .mockImplementation(
    (strategy, cb) => (req, res, next) =>
      cb(passportResult.err, passportResult.user, null)
  );

const userCreate = vi.fn();
const origUser = db.User;
db.User = () => ({ create: userCreate });

const initSpy = vi
  .spyOn(clientAuth, 'initializeClientAuth')
  .mockResolvedValue(undefined);
const saveSpy = vi
  .spyOn(clientAuth, 'saveSession')
  .mockResolvedValue(undefined);
const logSpy = vi.spyOn(auditLog, 'logAuthEvent').mockImplementation(() => {});

const local = require('./local');

afterAll(() => {
  authSpy.mockRestore();
  initSpy.mockRestore();
  saveSpy.mockRestore();
  logSpy.mockRestore();
  db.User = origUser;
});

const makeRes = () => ({ redirect: vi.fn(), render: vi.fn() });
const makeReq = (overrides = {}) => ({
  client: {
    clientId: 'client-123',
    redirectUrl: 'https://default.example.com',
    config: {},
  },
  query: {},
  params: {},
  body: {},
  flash: vi.fn(),
  brute: { resetKey: vi.fn() },
  bruteKey: 'bk',
  session: {},
  logIn: (user, cb) => cb(null),
  ...overrides,
});

beforeEach(() => {
  passportResult = { err: null, user: null };
  userCreate.mockReset();
  authSpy.mockClear();
  initSpy.mockClear();
  saveSpy.mockClear();
  logSpy.mockClear();
});

describe('local.postLogin - invalid credentials', () => {
  it('redirects back to login with clientId and an error flash when no user', () => {
    const req = makeReq({
      query: { redirect_uri: 'https://app.example.com/cb' },
    });
    const res = makeRes();

    local.postLogin(req, res, vi.fn());

    expect(req.flash).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ msg: expect.any(String) })
    );
    expect(logSpy).toHaveBeenCalledWith(req, 'login_failed', expect.anything());
    const target = res.redirect.mock.calls[0][0];
    expect(target).toContain('clientId=client-123');
    expect(target).toContain(encodeURIComponent('https://app.example.com/cb'));
  });

  it('uses the /admin login url on a privileged route failure', () => {
    const req = makeReq({ params: { priviligedRoute: 'admin' } });
    const res = makeRes();

    local.postLogin(req, res, vi.fn());

    expect(res.redirect.mock.calls[0][0]).toContain('/admin');
  });

  it('falls back to client.redirectUrl when no redirect_uri query is given', () => {
    const req = makeReq();
    const res = makeRes();

    local.postLogin(req, res, vi.fn());

    expect(res.redirect.mock.calls[0][0]).toContain(
      'redirect_uri=https://default.example.com'
    );
  });
});

describe('local.postLogin - passport error', () => {
  it('forwards passport errors to next()', () => {
    passportResult = { err: new Error('strategy boom'), user: null };
    const next = vi.fn();

    local.postLogin(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'strategy boom' })
    );
  });
});

describe('local.postLogin - success', () => {
  it('initializes client auth and redirects to the authorize dialog', async () => {
    const user = { id: 7, email: 'a@b.com' };
    passportResult = { err: null, user };
    const req = makeReq({
      query: { redirect_uri: 'https://app.example.com/cb' },
    });
    const res = makeRes();

    local.postLogin(req, res, vi.fn());
    await vi.waitFor(() => expect(res.redirect).toHaveBeenCalled());

    expect(initSpy).toHaveBeenCalledWith(
      req.session,
      req.client,
      user,
      expect.objectContaining({ authType: 'Local', twoFactorValid: false })
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(req.brute.resetKey).toHaveBeenCalledWith('bk');
    expect(logSpy).toHaveBeenCalledWith(req, 'login', expect.anything());
    const target = res.redirect.mock.calls[0][0];
    expect(target).toContain('/dialog/authorize');
    expect(target).toContain('response_type=code');
    expect(target).toContain('client_id=client-123');
  });

  it('errors when there is no redirect_uri and no default redirectUrl', async () => {
    passportResult = { err: null, user: { id: 7 } };
    const req = makeReq({
      client: { clientId: 'c', redirectUrl: null, config: {} },
    });
    const res = makeRes();
    const next = vi.fn();

    local.postLogin(req, res, next);
    await vi.waitFor(() => expect(next).toHaveBeenCalled());

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});

describe('local.postRegister', () => {
  it('creates the user, logs the event and redirects to login', async () => {
    userCreate.mockResolvedValue({ id: 42 });
    const req = makeReq({
      body: { name: 'Jane', email: 'j@x.com', password: 'secret' },
    });
    const res = makeRes();

    local.postRegister(req, res, vi.fn());
    await vi.waitFor(() => expect(res.redirect).toHaveBeenCalled());

    expect(userCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane', email: 'j@x.com' })
    );
    // password must be hashed, not stored in clear text
    expect(userCreate.mock.calls[0][0].password).not.toBe('secret');
    expect(logSpy).toHaveBeenCalledWith(
      req,
      'register',
      expect.objectContaining({ userId: 42 })
    );
    expect(res.redirect.mock.calls[0][0]).toContain('clientId=client-123');
  });

  it('forwards create errors to next()', async () => {
    const boom = new Error('db down');
    userCreate.mockRejectedValue(boom);
    const next = vi.fn();
    const req = makeReq({ body: { name: 'x', email: 'e', password: 'p' } });

    local.postRegister(req, makeRes(), next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(boom));
  });
});

describe('local.index', () => {
  it('redirects logged-in users to /account', () => {
    const res = makeRes();
    local.index({ user: { id: 1 } }, res);
    expect(res.redirect).toHaveBeenCalledWith('/account');
  });

  it('redirects anonymous users to /login', () => {
    const res = makeRes();
    local.index({}, res);
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });
});
