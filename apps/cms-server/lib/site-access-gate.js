const crypto = require('node:crypto');

const LEGACY_SITE_ACCESS_COOKIE = 'openstadSiteAccess';
const SITE_ACCESS_COOKIE_PREFIX = 'openstadSiteAccess_';
const SITE_ACCESS_PATH = '/openstad-site-access';
const SITE_ACCESS_MAX_AGE = 1000 * 60 * 60 * 24;

function siteAccessCookieName(site) {
  return `${SITE_ACCESS_COOKIE_PREFIX}${site.id}`;
}

function siteAccessToken(site, password) {
  return crypto
    .createHmac('sha256', String(password))
    .update(`${LEGACY_SITE_ACCESS_COOKIE}:${site.id}`)
    .digest('hex');
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    if (!key) return;
    const raw = part.slice(index + 1).trim();
    try {
      cookies[key] = decodeURIComponent(raw);
    } catch {
      cookies[key] = raw;
    }
  });
  return cookies;
}

function safeEqual(a, b) {
  const bufferA = Buffer.from(String(a));
  const bufferB = Buffer.from(String(b));
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function safeReturnPath(value, fallback) {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    const base = 'http://site.invalid';
    const parsed = new URL(value, base);
    if (parsed.origin !== base) return fallback;
    return parsed.pathname + parsed.search;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

function renderSiteAccessForm(action, returnTo, hasError) {
  const errorBlock = hasError
    ? `<p class="error" role="alert">Onjuist wachtwoord.</p>`
    : '';
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Toegang</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f4f5f7; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
  form { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.15); width: 100%; max-width: 320px; }
  h1 { font-size: 1.25rem; margin: 0 0 1rem; }
  label { display: block; font-size: .875rem; margin: .75rem 0 .25rem; }
  input { width: 100%; padding: .5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
  button { margin-top: 1.25rem; width: 100%; padding: .6rem; border: 0; border-radius: 4px; background: #1f2937; color: #fff; font-size: 1rem; cursor: pointer; }
  .error { color: #b91c1c; font-size: .875rem; margin: 0 0 .5rem; }
</style>
</head>
<body>
<form method="post" action="${escapeHtml(action)}">
  <h1>Deze site is afgeschermd</h1>
  ${errorBlock}
  <input type="hidden" name="returnTo" value="${escapeHtml(returnTo)}">
  <label for="site-access-password">Wachtwoord</label>
  <input id="site-access-password" name="password" type="password" autocomplete="current-password" autofocus required>
  <button type="submit">Doorgaan</button>
</form>
</body>
</html>`;
}

function isSecureRequest(req) {
  return req.protocol === 'https';
}

function clearAccessCookie(req, res, name) {
  if (parseCookies(req.headers.cookie)[name] === undefined) return;
  const options = {
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: 'lax',
  };
  const prefix = req.sitePrefix ? '/' + req.sitePrefix : '';
  res.clearCookie(name, { ...options, path: '/' });
  if (prefix) {
    res.clearCookie(name, { ...options, path: prefix });
  }
}

function createSiteAccessGate({ parseBody }) {
  return function siteAccessGate(req, res, next) {
    const basicAuth = req.site?.config?.basicAuth;
    const prefix = req.sitePrefix ? '/' + req.sitePrefix : '';

    if (!req.site || !basicAuth?.active || !basicAuth?.password?.trim()) {
      if (req.site) {
        clearAccessCookie(req, res, LEGACY_SITE_ACCESS_COOKIE);
        clearAccessCookie(req, res, siteAccessCookieName(req.site));
      }
      return next();
    }

    const cookieName = siteAccessCookieName(req.site);
    const formAction = prefix + SITE_ACCESS_PATH;
    const expectedToken = siteAccessToken(req.site, basicAuth.password);
    const presentedToken = parseCookies(req.headers.cookie)[cookieName];

    if (presentedToken && safeEqual(presentedToken, expectedToken)) {
      clearAccessCookie(req, res, LEGACY_SITE_ACCESS_COOKIE);
      return next();
    }

    if (req.method === 'POST' && req.path === SITE_ACCESS_PATH) {
      return parseBody(req, res, () => {
        const returnTo = safeReturnPath(req.body?.returnTo, prefix + '/');
        const submittedToken = siteAccessToken(
          req.site,
          req.body?.password || ''
        );
        if (safeEqual(submittedToken, expectedToken)) {
          clearAccessCookie(req, res, LEGACY_SITE_ACCESS_COOKIE);
          res.cookie(cookieName, expectedToken, {
            httpOnly: true,
            secure: isSecureRequest(req),
            sameSite: 'lax',
            path: '/',
            maxAge: SITE_ACCESS_MAX_AGE,
          });
          return res.redirect(returnTo);
        }
        return res
          .status(401)
          .send(renderSiteAccessForm(formAction, returnTo, true));
      });
    }

    const returnTo = safeReturnPath(req.originalUrl, prefix + '/');
    return res
      .status(401)
      .send(renderSiteAccessForm(formAction, returnTo, false));
  };
}

module.exports = {
  LEGACY_SITE_ACCESS_COOKIE,
  SITE_ACCESS_COOKIE_PREFIX,
  SITE_ACCESS_PATH,
  SITE_ACCESS_MAX_AGE,
  siteAccessCookieName,
  siteAccessToken,
  parseCookies,
  safeEqual,
  safeReturnPath,
  escapeHtml,
  renderSiteAccessForm,
  isSecureRequest,
  clearAccessCookie,
  createSiteAccessGate,
};
