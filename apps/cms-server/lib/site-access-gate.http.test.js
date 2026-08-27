import http from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const express = require('express');
const {
  createSiteAccessGate,
  siteAccessToken,
  siteAccessCookieName,
} = require('./site-access-gate');

const SITE = {
  id: 10,
  config: { basicAuth: { active: true, password: 'letmein' } },
};
const TOKEN = siteAccessToken(SITE, 'letmein');
const COOKIE = siteAccessCookieName(SITE);

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.set('trust proxy', true);
  app.use((req, res, next) => {
    req.site = SITE;
    next();
  });
  app.use(
    createSiteAccessGate({ parseBody: express.urlencoded({ extended: false }) })
  );
  app.use((req, res) => res.status(200).send('SECRET CONTENT'));

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function requestRaw({ method = 'GET', path = '/', headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            setCookies: res.headers['set-cookie'] || [],
            body: data,
          })
        );
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function form(fields) {
  return new URLSearchParams(fields).toString();
}

async function login(password, returnTo = '/dashboard') {
  return requestRaw({
    method: 'POST',
    path: '/openstad-site-access',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-Proto': 'https',
    },
    body: form({ password, returnTo }),
  });
}

describe('site-access gate over real HTTP', () => {
  it('serves the password form for an unauthenticated request', async () => {
    const res = await requestRaw({ path: '/' });
    expect(res.status).toBe(401);
    expect(res.body).toContain('Deze site is afgeschermd');
  });

  it('rejects a wrong password without setting the access cookie', async () => {
    const res = await login('wrong-password');
    expect(res.status).toBe(401);
    expect(res.body).toContain('Onjuist wachtwoord');
    expect(res.setCookies.some((c) => c.startsWith(`${COOKIE}=`))).toBe(false);
  });

  it('sets a per-site cookie at path / and redirects on a correct login', async () => {
    const res = await login('letmein', '/dashboard');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
    const setCookie = res.setCookies.find((c) => c.startsWith(`${COOKIE}=`));
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(`${COOKIE}=${TOKEN}`);
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=Lax');
  });

  it('grants access to a request carrying the valid per-site cookie', async () => {
    const res = await requestRaw({
      path: '/',
      headers: { Cookie: `${COOKIE}=${TOKEN}` },
    });
    expect(res.status).toBe(200);
    expect(res.body).toBe('SECRET CONTENT');
  });

  it('regression: a valid cookie plus a stale legacy cookie still grants access and clears the legacy cookie', async () => {
    const res = await requestRaw({
      path: '/',
      headers: { Cookie: `${COOKIE}=${TOKEN}; openstadSiteAccess=stale-value` },
    });
    expect(res.status).toBe(200);
    expect(res.body).toBe('SECRET CONTENT');
    const cleared = res.setCookies.find((c) =>
      c.startsWith('openstadSiteAccess=')
    );
    expect(cleared, 'legacy cookie should be cleared').toBeTruthy();
    expect(cleared).toContain('Expires=Thu, 01 Jan 1970');
  });

  it('locks out a request that only carries a stale legacy cookie', async () => {
    const res = await requestRaw({
      path: '/',
      headers: { Cookie: 'openstadSiteAccess=stale-value' },
    });
    expect(res.status).toBe(401);
    expect(res.body).toContain('Deze site is afgeschermd');
  });

  it('does not honour an external returnTo after login', async () => {
    const res = await login('letmein', 'https://evil.example.com/steal');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  it('marks the cookie Secure when a chained proxy sends a comma-separated x-forwarded-proto', async () => {
    const res = await requestRaw({
      method: 'POST',
      path: '/openstad-site-access',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-Proto': 'https, http',
      },
      body: form({ password: 'letmein', returnTo: '/' }),
    });
    expect(res.status).toBe(302);
    const setCookie = res.setCookies.find((c) => c.startsWith(`${COOKIE}=`));
    expect(setCookie).toContain('Secure');
  });
});
