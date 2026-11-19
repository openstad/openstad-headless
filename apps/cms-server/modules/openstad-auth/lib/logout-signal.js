const WIDGET_LOGOUT_COOKIE = 'openstad_logout';
const WIDGET_LOGOUT_COOKIE_MAX_AGE_MS = 5 * 60 * 1000;

const markLogoutForWidgets = (res, { secure, env = process.env }) => {
  if (env.MULTI_PROJECT_LOGIN !== 'true') return;
  res.cookie(WIDGET_LOGOUT_COOKIE, '1', {
    path: '/',
    sameSite: 'lax',
    maxAge: WIDGET_LOGOUT_COOKIE_MAX_AGE_MS,
    httpOnly: false,
    secure,
  });
};

module.exports = { markLogoutForWidgets };
