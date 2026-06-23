import { createRequire } from 'module';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// The controller is CommonJS and its `require` calls are not intercepted by
// vi.mock under Vite SSR. We require the same singleton modules it uses and
// replace their methods/exports directly so the controller calls our fakes.
const require = createRequire(import.meta.url);

const passport = require('passport');
const db = require('../../db');
const verificationService = require('../../services/verificationService');
const authService = require('../../services/authService');
const tokenUrl = require('../../services/tokenUrl');
const clientAuth = require('../../utils/clientAuth');
const auditLog = require('../../middleware/auditLog');

let passportResult = { err: null, user: null };
const authSpy = vi
  .spyOn(passport, 'authenticate')
  .mockImplementation(
    (strategy, opts, cb) => (req, res, next) =>
      cb(passportResult.err, passportResult.user, null)
  );

const sendVerification = vi
  .spyOn(verificationService, 'sendVerification')
  .mockResolvedValue(undefined);
const validatePrivilegeUser = vi
  .spyOn(authService, 'validatePrivilegeUser')
  .mockResolvedValue(undefined);
const logSuccessFullLogin = vi
  .spyOn(authService, 'logSuccessFullLogin')
  .mockResolvedValue(undefined);
const getUrlSpy = vi
  .spyOn(tokenUrl, 'getUrl')
  .mockReturnValue('https://app/auth/url/authenticate?token=tok');
const initSpy = vi
  .spyOn(clientAuth, 'initializeClientAuth')
  .mockResolvedValue(undefined);
const saveSpy = vi
  .spyOn(clientAuth, 'saveSession')
  .mockResolvedValue(undefined);
const logSpy = vi.spyOn(auditLog, 'logAuthEvent').mockImplementation(() => {});

const userFindOne = vi.fn();
const userCreate = vi.fn();
const userRoleFindOne = vi.fn();
const origUser = db.User;
const origUserRole = db.UserRole;
db.User = { findOne: userFindOne, create: userCreate };
db.UserRole = { findOne: userRoleFindOne };

const url = require('./url');

afterAll(() => {
  authSpy.mockRestore();
  sendVerification.mockRestore();
  validatePrivilegeUser.mockRestore();
  logSuccessFullLogin.mockRestore();
  getUrlSpy.mockRestore();
  initSpy.mockRestore();
  saveSpy.mockRestore();
  logSpy.mockRestore();
  db.User = origUser;
  db.UserRole = origUserRole;
});

const makeRes = () => ({
  redirect: vi.fn(),
  render: vi.fn(),
  setHeader: vi.fn(),
});
const makeReq = (overrides = {}) => ({
  client: {
    id: 5,
    clientId: 'client-9',
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
  header: vi.fn(() => 'https://referer.example.com'),
  logIn: (user, cb) => cb(null),
  ...overrides,
});

beforeEach(() => {
  passportResult = { err: null, user: null };
  vi.clearAllMocks();
  sendVerification.mockResolvedValue(undefined);
  logSuccessFullLogin.mockResolvedValue(undefined);
  getUrlSpy.mockReturnValue('https://app/auth/url/authenticate?token=tok');
  initSpy.mockResolvedValue(undefined);
  saveSpy.mockResolvedValue(undefined);
  userRoleFindOne.mockResolvedValue(null);
});

// ---------------------------------------------------------------------------
// postLogin -> handleSending : magic-login email send path
// ---------------------------------------------------------------------------
describe('url.postLogin (magic-login send path)', () => {
  it('sends a verification email to an existing user and redirects to confirmation', async () => {
    const user = { id: 1, email: 'exists@x.com' };
    userFindOne.mockResolvedValue(user);
    const req = makeReq({
      body: { email: 'exists@x.com' },
      query: { redirect_uri: 'https://app.x/cb' },
    });
    const res = makeRes();

    await url.postLogin(req, res, vi.fn());

    expect(sendVerification).toHaveBeenCalledWith(
      user,
      req.client,
      expect.any(String)
    );
    expect(req.flash).toHaveBeenCalledWith(
      'success',
      expect.objectContaining({ msg: expect.stringContaining('exists@x.com') })
    );
    const target = res.redirect.mock.calls[0][0];
    expect(target).toContain('/auth/url/confirmation');
    expect(target).toContain('clientId=client-9');
  });

  it('creates a new user when none exists, then sends the email', async () => {
    userFindOne.mockResolvedValue(null);
    const created = { id: 2, email: 'new@x.com' };
    userCreate.mockResolvedValue(created);
    const req = makeReq({ body: { email: 'new@x.com' } });
    const res = makeRes();

    await url.postLogin(req, res, vi.fn());

    expect(userCreate).toHaveBeenCalledWith({ email: 'new@x.com' });
    expect(sendVerification).toHaveBeenCalledWith(
      created,
      req.client,
      expect.anything()
    );
  });

  it('refuses to create a user when canCreateNewUsers is false', async () => {
    userFindOne.mockResolvedValue(null);
    const req = makeReq({
      body: { email: 'blocked@x.com' },
      client: {
        id: 5,
        clientId: 'client-9',
        redirectUrl: 'r',
        config: { users: { canCreateNewUsers: false } },
      },
    });
    const res = makeRes();

    await url.postLogin(req, res, vi.fn());

    expect(userCreate).not.toHaveBeenCalled();
    expect(sendVerification).not.toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('error', expect.anything());
    expect(res.redirect).toHaveBeenCalledWith('https://referer.example.com');
  });

  it('uses the privileged path (client.id===1): validates user, and on send failure redirects with priviligedRoute', async () => {
    const privUser = { id: 9, email: 'admin@x.com' };
    validatePrivilegeUser.mockResolvedValue(privUser);
    sendVerification.mockRejectedValue(new Error('smtp down'));
    userFindOne.mockResolvedValue(null);
    userCreate.mockResolvedValue({ id: 9, email: 'admin@x.com' });
    const req = makeReq({
      body: { email: 'admin@x.com' },
      client: { id: 1, clientId: '1', redirectUrl: 'r', config: {} },
    });
    const res = makeRes();

    await url.postLogin(req, res, vi.fn());

    expect(validatePrivilegeUser).toHaveBeenCalledWith('admin@x.com', 1);
    const target = res.redirect.mock.calls[0][0];
    expect(target).toContain('/auth/url/login');
    expect(target).toContain('priviligedRoute=admin');
  });

  it('on send failure (non-privileged) flashes error and redirects to url login', async () => {
    userFindOne.mockResolvedValue({ id: 3, email: 'e@x.com' });
    sendVerification.mockRejectedValue(new Error('smtp down'));
    const req = makeReq({ body: { email: 'e@x.com' } });
    const res = makeRes();

    await url.postLogin(req, res, vi.fn());

    expect(req.flash).toHaveBeenCalledWith('error', expect.anything());
    expect(res.redirect.mock.calls[0][0]).toContain('/auth/url/login');
  });
});

// ---------------------------------------------------------------------------
// postAuthenticate : consuming the magic-login token
// ---------------------------------------------------------------------------
describe('url.postAuthenticate (token consumption)', () => {
  it('forwards passport errors to next()', () => {
    passportResult = { err: new Error('strategy boom'), user: null };
    const next = vi.fn();

    url.postAuthenticate(
      makeReq({ query: { redirect_uri: 'https://app.x/cb' } }),
      makeRes(),
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'strategy boom' })
    );
  });

  it('errors when neither redirect_uri nor client.redirectUrl is present', () => {
    passportResult = { err: null, user: { id: 1 } };
    const req = makeReq({
      client: { clientId: 'c', redirectUrl: null, config: {} },
    });
    const next = vi.fn();

    url.postAuthenticate(req, makeRes(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('redirects back to the login screen with an expired-token message when token is invalid (no user)', () => {
    passportResult = { err: null, user: null };
    const req = makeReq({ query: { redirect_uri: 'https://app.x/cb' } });
    const res = makeRes();

    url.postAuthenticate(req, res, vi.fn());

    expect(logSpy).toHaveBeenCalledWith(req, 'login_failed', expect.anything());
    expect(req.flash).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ msg: expect.any(String) })
    );
    expect(res.redirect.mock.calls[0][0]).toContain('/auth/url/login');
  });

  it('on a valid token logs the user in, upgrades anonymous role and redirects to authorize', async () => {
    const user = { id: 11 };
    passportResult = { err: null, user };
    const roleUpdate = vi.fn().mockResolvedValue(undefined);
    // anonymousRoleId default is 3; an anonymous role should be upgraded.
    userRoleFindOne.mockResolvedValue({ roleId: 3, update: roleUpdate });
    const req = makeReq({ query: { redirect_uri: 'https://app.x/cb' } });
    const res = makeRes();

    url.postAuthenticate(req, res, vi.fn());
    await vi.waitFor(() => expect(res.redirect).toHaveBeenCalled());

    expect(initSpy).toHaveBeenCalledWith(
      req.session,
      req.client,
      user,
      expect.objectContaining({ authType: 'Url' })
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(logSuccessFullLogin).toHaveBeenCalledWith(req);
    expect(req.brute.resetKey).toHaveBeenCalledWith('bk');
    const target = res.redirect.mock.calls[0][0];
    expect(target).toContain('/dialog/authorize');
    expect(target).toContain('response_type=code');
  });

  it('still redirects to authorize even if the role-upgrade lookup fails', async () => {
    const user = { id: 12 };
    passportResult = { err: null, user };
    userRoleFindOne.mockRejectedValue(new Error('db hiccup'));
    const req = makeReq({ query: { redirect_uri: 'https://app.x/cb' } });
    const res = makeRes();

    url.postAuthenticate(req, res, vi.fn());
    await vi.waitFor(() => expect(res.redirect).toHaveBeenCalled());

    expect(res.redirect.mock.calls[0][0]).toContain('/dialog/authorize');
  });
});

// ---------------------------------------------------------------------------
// postRegister : finishes registration then bounces to the token login url
// ---------------------------------------------------------------------------
describe('url.postRegister', () => {
  it('updates the user and redirects to the generated token URL', async () => {
    const updated = { id: 4 };
    const user = { update: vi.fn().mockResolvedValue(updated) };
    const req = makeReq({
      body: { name: 'N', postcode: '1000AA', token: 'tok' },
      user,
    });
    const res = makeRes();

    url.postRegister(req, res, vi.fn());
    await vi.waitFor(() => expect(res.redirect).toHaveBeenCalled());

    expect(user.update).toHaveBeenCalledWith({ name: 'N', postcode: '1000AA' });
    expect(getUrlSpy).toHaveBeenCalledWith(updated, req.client, 'tok');
    expect(res.redirect).toHaveBeenCalledWith(
      'https://app/auth/url/authenticate?token=tok'
    );
  });

  it('forwards update errors to next()', async () => {
    const boom = new Error('update failed');
    const user = { update: vi.fn().mockRejectedValue(boom) };
    const next = vi.fn();

    url.postRegister(makeReq({ body: {}, user }), makeRes(), next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(boom));
  });
});
