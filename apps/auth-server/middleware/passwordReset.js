const db = require('../db');

/** How long a password reset link stays valid (minutes). */
const DEFAULT_VALID_MINUTES = 60;

function validMinutes() {
  const n = parseInt(process.env.PASSWORD_RESET_TOKEN_MINUTES, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_VALID_MINUTES;
}

/** Where to send someone whose link cannot be used: the forgot-password form of the same client. */
function forgotUrl(req) {
  const clientId =
    (req.client && req.client.clientId) || req.query.clientId || '';
  const redirectUri = req.redirectUri || req.query.redirect_uri || '';
  return (
    '/auth/local/forgot?clientId=' +
    encodeURIComponent(clientId) +
    (redirectUri ? '&redirect_uri=' + encodeURIComponent(redirectUri) : '')
  );
}

function backToForgot(req, res, msg) {
  req.flash('error', { msg });
  return res.redirect(forgotUrl(req));
}

/**
 * Validates the token of a password reset link (GET /auth/local/reset and the
 * POST that follows). A missing, unknown, used or expired token no longer
 * ends in a generic error page: the user is sent back to the forgot-password
 * form with a message that says what happened.
 */
exports.validate = (req, res, next) => {
  const queryToken = req.query.token ? req.query.token : req.body.token;

  if (!queryToken || typeof queryToken !== 'string') {
    return backToForgot(
      req,
      res,
      'Deze link bevat geen geldige code. Vraag een nieuwe link aan om je wachtwoord te resetten.'
    );
  }

  const timeAgo = new Date(Date.now() - validMinutes() * 60 * 1000);

  db.PasswordResetToken.findOne({
    where: {
      token: queryToken,
      valid: true,
      createdAt: { [db.Sequelize.Op.gte]: timeAgo },
    },
    order: [['createdAt', 'DESC']],
  })
    .then((passwordResetToken) => {
      if (passwordResetToken) {
        req.passwordResetToken = passwordResetToken;
        req.body.userId = passwordResetToken.userId;
        req.userId = passwordResetToken.userId;
        return next();
      }

      // Tell the user whether the link expired (or was already used) or never existed.
      return db.PasswordResetToken.findOne({
        where: { token: queryToken },
      }).then((anyToken) =>
        backToForgot(
          req,
          res,
          anyToken
            ? 'Deze link om je wachtwoord te resetten is verlopen of al gebruikt. Vraag een nieuwe link aan.'
            : 'Deze link om je wachtwoord te resetten is niet geldig. Vraag een nieuwe link aan.'
        )
      );
    })
    .catch((err) => {
      console.error(
        `[${new Date().toISOString()}][auth] password reset token validation failed: ${err && err.message}`
      );
      return backToForgot(
        req,
        res,
        'Deze link om je wachtwoord te resetten kan niet worden gecontroleerd. Vraag een nieuwe link aan.'
      );
    });
};

exports.validMinutes = validMinutes;
