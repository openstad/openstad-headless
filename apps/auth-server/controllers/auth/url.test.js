import { createRequire } from 'module';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const require = createRequire(import.meta.url);

const db = { User: { findOne: vi.fn(), create: vi.fn() } };
const verificationService = { sendVerification: vi.fn() };
const authService = { validatePrivilegeUser: vi.fn() };

require.cache[require.resolve('../../db')] = { exports: db };
require.cache[require.resolve('../../services/verificationService')] = {
  exports: verificationService,
};
require.cache[require.resolve('../../services/authService')] = {
  exports: authService,
};
require.cache[require.resolve('../../services/tokenUrl')] = { exports: {} };
require.cache[require.resolve('../../utils/clientAuth')] = { exports: {} };
require.cache[require.resolve('../../middleware/auditLog')] = {
  exports: { logAuthEvent: vi.fn() },
};

const url = require('./url');

const privacyUrl = 'https://example.nl/privacy';
const redirectUri = 'https://site.example.nl/callback';
const loginPage = `/auth/url/login?clientId=abc&redirect_uri=${encodeURIComponent(redirectUri)}`;

function clientWith(config = { clientDisclaimerUrl: privacyUrl }) {
  return { id: 7, clientId: 'abc', config };
}

function requestWith({ body = {}, client = clientWith(), params = {} } = {}) {
  return {
    body: { email: 'iemand@example.nl', ...body },
    client,
    params,
    query: {},
    redirectUri,
    flash: vi.fn(),
    header: vi.fn(),
  };
}

function response() {
  return { redirect: vi.fn(), render: vi.fn(), setHeader: vi.fn() };
}

function newUser() {
  const user = { email: 'iemand@example.nl', privacyConsentAt: null };
  user.update = vi.fn(async () => user);
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
  db.User.findOne.mockResolvedValue(null);
  verificationService.sendVerification.mockResolvedValue(undefined);
});

describe('e-mail login page', () => {
  test('shows no privacy checkbox without a privacy statement url', () => {
    const res = response();
    url.login[1](requestWith({ client: clientWith({}) }), res);

    expect(res.render.mock.calls[0][1].privacyConsent).toBe(null);
  });

  test('shows the privacy checkbox when a privacy statement url is set', () => {
    const res = response();
    url.login[1](requestWith(), res);

    expect(res.render.mock.calls[0][1].privacyConsent).toMatchObject({
      url: privacyUrl,
      labelPrefix:
        'Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de ',
    });
  });
});

describe('sending the login mail', () => {
  test('refuses to send without privacy consent and creates no user', async () => {
    const req = requestWith();
    const res = response();

    await url.postLogin(req, res);

    expect(req.flash).toHaveBeenCalledWith('error', {
      msg: 'Je moet akkoord gaan met de privacyverklaring om verder te gaan.',
    });
    expect(res.redirect).toHaveBeenCalledWith(loginPage);
    expect(db.User.findOne).not.toHaveBeenCalled();
    expect(db.User.create).not.toHaveBeenCalled();
    expect(verificationService.sendVerification).not.toHaveBeenCalled();
  });

  test('keeps the admin route when it refuses to send', async () => {
    const req = requestWith({ params: { priviligedRoute: 'admin' } });
    const res = response();

    await url.postLogin(req, res);

    expect(req.flash).toHaveBeenCalledWith('error', {
      msg: 'Je moet akkoord gaan met de privacyverklaring om verder te gaan.',
    });
    expect(res.redirect).toHaveBeenCalledWith(
      `${loginPage}&priviligedRoute=admin`
    );
    expect(db.User.findOne).not.toHaveBeenCalled();
  });

  test('records the consent before it sends the mail', async () => {
    const user = newUser();
    db.User.create.mockResolvedValue(user);
    const res = response();

    await url.postLogin(requestWith({ body: { privacyConsent: 'on' } }), res);

    const saved = user.update.mock.calls[0][0].privacyConsentAt;
    expect(typeof saved[7]).toBe('string');
    expect(user.update.mock.invocationCallOrder[0]).toBeLessThan(
      verificationService.sendVerification.mock.invocationCallOrder[0]
    );
    expect(res.redirect.mock.calls[0][0]).toMatch(
      /^\/auth\/url\/confirmation\?clientId=abc/
    );
  });

  test('sends the mail without recording consent when no privacy statement is set', async () => {
    const user = newUser();
    db.User.findOne.mockResolvedValue(user);
    const res = response();

    await url.postLogin(requestWith({ client: clientWith({}) }), res);

    expect(user.update).not.toHaveBeenCalled();
    expect(verificationService.sendVerification).toHaveBeenCalledTimes(1);
  });

  test('keeps the recorded consent when the mail cannot be sent', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = newUser();
    db.User.create.mockResolvedValue(user);
    verificationService.sendVerification.mockRejectedValue(
      new Error('smtp down')
    );
    const req = requestWith({ body: { privacyConsent: 'on' } });
    const res = response();

    await url.postLogin(req, res);

    expect(user.update).toHaveBeenCalledTimes(1);
    expect(req.flash).toHaveBeenCalledWith('error', {
      msg: 'Het is niet gelukt om de e-mail te versturen!',
    });
    expect(res.redirect).toHaveBeenCalledWith(loginPage);
  });
});
