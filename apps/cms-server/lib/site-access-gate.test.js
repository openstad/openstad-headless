import { describe, expect, it, vi } from 'vitest';

const {
  LEGACY_SITE_ACCESS_COOKIE,
  SITE_ACCESS_COOKIE_PREFIX,
  SITE_ACCESS_PATH,
  siteAccessCookieName,
  siteAccessToken,
  parseCookies,
  safeEqual,
  safeReturnPath,
  escapeHtml,
  renderSiteAccessForm,
  isSecureRequest,
  createSiteAccessGate,
} = require('./site-access-gate');

describe('siteAccessCookieName', () => {
  it('scopes the cookie name to the site id', () => {
    expect(siteAccessCookieName({ id: 42 })).toBe(
      `${SITE_ACCESS_COOKIE_PREFIX}42`
    );
  });

  it('produces distinct names for sibling sites', () => {
    expect(siteAccessCookieName({ id: 1 })).not.toBe(
      siteAccessCookieName({ id: 2 })
    );
  });
});

describe('siteAccessToken', () => {
  it('is deterministic for the same site and password', () => {
    const site = { id: 7 };
    expect(siteAccessToken(site, 'secret')).toBe(
      siteAccessToken(site, 'secret')
    );
  });

  it('changes when the password changes', () => {
    const site = { id: 7 };
    expect(siteAccessToken(site, 'old')).not.toBe(siteAccessToken(site, 'new'));
  });

  it('changes when the site id changes', () => {
    expect(siteAccessToken({ id: 1 }, 'secret')).not.toBe(
      siteAccessToken({ id: 2 }, 'secret')
    );
  });
});

describe('parseCookies', () => {
  it('returns an empty object for a missing header', () => {
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies('')).toEqual({});
  });

  it('parses distinct per-site cookies independently', () => {
    const header = 'openstadSiteAccess_1=aaa; openstadSiteAccess_2=bbb';
    const cookies = parseCookies(header);
    expect(cookies['openstadSiteAccess_1']).toBe('aaa');
    expect(cookies['openstadSiteAccess_2']).toBe('bbb');
  });

  it('keeps the per-site cookie separate from a lingering legacy cookie', () => {
    const header = 'openstadSiteAccess_10=correct; openstadSiteAccess=stale';
    const cookies = parseCookies(header);
    expect(cookies['openstadSiteAccess_10']).toBe('correct');
    expect(cookies[LEGACY_SITE_ACCESS_COOKIE]).toBe('stale');
  });
});

describe('safeEqual', () => {
  it('returns true for identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(safeEqual('abc', 'abd')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });

  it('confirms a correct password token and rejects a stale one', () => {
    const site = { id: 5 };
    const expected = siteAccessToken(site, 'goodpass');
    const submitted = siteAccessToken(site, 'goodpass');
    const stale = siteAccessToken(site, 'oldpass');
    expect(safeEqual(submitted, expected)).toBe(true);
    expect(safeEqual(stale, expected)).toBe(false);
  });
});

describe('safeReturnPath', () => {
  const protocolRelative = '/' + '/evil.com';

  it('keeps a same-origin relative path', () => {
    expect(safeReturnPath('/site/page?x=1', '/')).toBe('/site/page?x=1');
  });

  it('falls back for a protocol-relative external url', () => {
    expect(safeReturnPath(protocolRelative, '/')).toBe('/');
  });

  it('falls back for an absolute external url', () => {
    expect(safeReturnPath('https://evil.com/steal', '/')).toBe('/');
  });

  it('falls back for a javascript scheme', () => {
    expect(safeReturnPath('javascript:alert(1)', '/')).toBe('/');
  });

  it('falls back for empty or non-string input', () => {
    expect(safeReturnPath('', '/home')).toBe('/home');
    expect(safeReturnPath(undefined, '/home')).toBe('/home');
    expect(safeReturnPath(42, '/home')).toBe('/home');
  });
});

describe('escapeHtml', () => {
  it('escapes html-significant characters', () => {
    expect(escapeHtml(`<script>"'&\``)).toBe(
      '&lt;script&gt;&quot;&#39;&amp;&#96;'
    );
  });
});

describe('renderSiteAccessForm', () => {
  it('renders the error block only when hasError is set', () => {
    expect(renderSiteAccessForm('/a', '/', false)).not.toContain(
      'Onjuist wachtwoord'
    );
    expect(renderSiteAccessForm('/a', '/', true)).toContain(
      'Onjuist wachtwoord'
    );
  });

  it('escapes the returnTo value into the hidden field', () => {
    const html = renderSiteAccessForm('/a', '"><img src=x>', false);
    expect(html).not.toContain('"><img src=x>');
    expect(html).toContain('&quot;&gt;&lt;img src=x&gt;');
  });
});

describe('isSecureRequest', () => {
  it('reads req.protocol, which Express derives from x-forwarded-proto under trust proxy', () => {
    expect(isSecureRequest({ protocol: 'https' })).toBe(true);
    expect(isSecureRequest({ protocol: 'http' })).toBe(false);
  });
});

function makeRes() {
  const res = {
    cookies: {},
    cleared: [],
    statusCode: 200,
    body: undefined,
    redirectedTo: undefined,
  };
  res.cookie = vi.fn((name, value, options) => {
    res.cookies[name] = { value, options };
    return res;
  });
  res.clearCookie = vi.fn((name, options) => {
    res.cleared.push({ name, options });
    return res;
  });
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.send = vi.fn((body) => {
    res.body = body;
    return res;
  });
  res.redirect = vi.fn((to) => {
    res.redirectedTo = to;
    return res;
  });
  return res;
}

const passthroughBody = (req, res, cb) => cb();
const gate = createSiteAccessGate({ parseBody: passthroughBody });

const protectedSite = {
  id: 10,
  config: { basicAuth: { active: true, password: 'letmein' } },
};

describe('siteAccessGate middleware', () => {
  it('grants access and does not set a cookie when no site is resolved', () => {
    const req = { headers: {}, method: 'GET', path: '/', originalUrl: '/' };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('clears any access cookies and grants access when basicAuth is off', () => {
    const req = {
      headers: { cookie: 'openstadSiteAccess_10=x; openstadSiteAccess=old' },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      site: { id: 10, config: { basicAuth: { active: false } } },
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
    const clearedNames = res.cleared.map((c) => c.name).sort();
    expect(clearedNames).toEqual([
      'openstadSiteAccess',
      'openstadSiteAccess_10',
    ]);
  });

  it('shows the password form on an unauthenticated GET', () => {
    const req = {
      headers: {},
      method: 'GET',
      path: '/some/page',
      originalUrl: '/some/page',
      site: protectedSite,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toContain('Deze site is afgeschermd');
  });

  it('grants access with a valid per-site cookie', () => {
    const token = siteAccessToken(protectedSite, 'letmein');
    const req = {
      headers: { cookie: `openstadSiteAccess_10=${token}` },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      site: protectedSite,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('still grants access when a stale legacy cookie is sent alongside the valid one, and clears the legacy cookie', () => {
    const token = siteAccessToken(protectedSite, 'letmein');
    const req = {
      headers: {
        cookie: `openstadSiteAccess_10=${token}; openstadSiteAccess=stalevalue`,
      },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      site: protectedSite,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.cleared.map((c) => c.name)).toContain('openstadSiteAccess');
  });

  it('rejects a per-site cookie carrying a stale token value', () => {
    const staleToken = siteAccessToken(protectedSite, 'oldpassword');
    const req = {
      headers: { cookie: `openstadSiteAccess_10=${staleToken}` },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      site: protectedSite,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('sets the cookie at path / and redirects on a correct password POST', () => {
    const req = {
      headers: {},
      protocol: 'https',
      method: 'POST',
      path: SITE_ACCESS_PATH,
      originalUrl: SITE_ACCESS_PATH,
      body: { password: 'letmein', returnTo: '/dashboard' },
      site: protectedSite,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(res.redirectedTo).toBe('/dashboard');
    const set = res.cookies['openstadSiteAccess_10'];
    expect(set).toBeTruthy();
    expect(set.options.path).toBe('/');
    expect(set.options.secure).toBe(true);
    expect(set.value).toBe(siteAccessToken(protectedSite, 'letmein'));
  });

  it('clears the legacy cookie when logging in', () => {
    const req = {
      headers: { cookie: 'openstadSiteAccess=stale' },
      method: 'POST',
      path: SITE_ACCESS_PATH,
      originalUrl: SITE_ACCESS_PATH,
      body: { password: 'letmein', returnTo: '/' },
      site: protectedSite,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    expect(res.cleared.map((c) => c.name)).toContain('openstadSiteAccess');
  });

  it('rejects a wrong password POST without setting a cookie', () => {
    const req = {
      headers: {},
      method: 'POST',
      path: SITE_ACCESS_PATH,
      originalUrl: SITE_ACCESS_PATH,
      body: { password: 'wrong', returnTo: '/' },
      site: protectedSite,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    expect(res.statusCode).toBe(401);
    expect(res.body).toContain('Onjuist wachtwoord');
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('does not honour an external returnTo on login', () => {
    const req = {
      headers: {},
      method: 'POST',
      path: SITE_ACCESS_PATH,
      originalUrl: SITE_ACCESS_PATH,
      body: { password: 'letmein', returnTo: 'https://evil.com' },
      site: protectedSite,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    expect(res.redirectedTo).toBe('/');
  });

  it('does not accept a sibling site cookie for a different site', () => {
    const siblingToken = siteAccessToken({ id: 20 }, 'letmein');
    const req = {
      headers: { cookie: `openstadSiteAccess_20=${siblingToken}` },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      site: protectedSite,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('uses a non-secure cookie when the request is plain http', () => {
    const req = {
      headers: {},
      protocol: 'http',
      method: 'POST',
      path: SITE_ACCESS_PATH,
      originalUrl: SITE_ACCESS_PATH,
      body: { password: 'letmein', returnTo: '/' },
      site: protectedSite,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    expect(res.cookies['openstadSiteAccess_10'].options.secure).toBe(false);
  });

  it('scopes the login form action to the site prefix', () => {
    const req = {
      headers: {},
      method: 'GET',
      path: '/',
      originalUrl: '/inspraak',
      sitePrefix: 'inspraak',
      site: protectedSite,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    expect(res.body).toContain(`action="/inspraak${SITE_ACCESS_PATH}"`);
  });
});

describe('siteAccessGate with sibling subsites on one domain', () => {
  const siteA = {
    id: 1,
    config: { basicAuth: { active: true, password: 'pwA' } },
  };
  const siteB = {
    id: 2,
    config: { basicAuth: { active: true, password: 'pwB' } },
  };
  const tokenA = siteAccessToken(siteA, 'pwA');
  const tokenB = siteAccessToken(siteB, 'pwB');
  const bothCookies =
    `${siteAccessCookieName(siteA)}=${tokenA}; ` +
    `${siteAccessCookieName(siteB)}=${tokenB}`;

  it('grants access to site A without clearing site B its cookie', () => {
    const req = {
      headers: { cookie: bothCookies },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      sitePrefix: 'site-a',
      site: siteA,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.cleared.map((c) => c.name)).not.toContain(
      siteAccessCookieName(siteB)
    );
  });

  it('grants access to site B without clearing site A its cookie', () => {
    const req = {
      headers: { cookie: bothCookies },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      sitePrefix: 'site-b',
      site: siteB,
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.cleared.map((c) => c.name)).not.toContain(
      siteAccessCookieName(siteA)
    );
  });

  it('turning basicAuth off for site A leaves site B its cookie intact', () => {
    const req = {
      headers: { cookie: bothCookies },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      sitePrefix: 'site-a',
      site: { id: 1, config: { basicAuth: { active: false } } },
    };
    const res = makeRes();
    const next = vi.fn();
    gate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.cleared.map((c) => c.name)).not.toContain(
      siteAccessCookieName(siteB)
    );
  });

  it('clears a stale legacy cookie at both the root and the prefix path', () => {
    const req = {
      headers: {
        cookie: `${siteAccessCookieName(siteA)}=${tokenA}; openstadSiteAccess=stale`,
      },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      sitePrefix: 'site-a',
      site: siteA,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    const legacyClears = res.cleared.filter(
      (c) => c.name === 'openstadSiteAccess'
    );
    const paths = legacyClears.map((c) => c.options.path).sort();
    expect(paths).toEqual(['/', '/site-a']);
  });

  it('does not emit a clear for a legacy cookie that is not present', () => {
    const req = {
      headers: { cookie: `${siteAccessCookieName(siteA)}=${tokenA}` },
      method: 'GET',
      path: '/',
      originalUrl: '/',
      sitePrefix: 'site-a',
      site: siteA,
    };
    const res = makeRes();
    gate(req, res, vi.fn());
    expect(res.cleared).toEqual([]);
  });
});
