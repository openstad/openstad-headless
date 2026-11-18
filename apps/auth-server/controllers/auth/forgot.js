/**
 * Controller responsible for handling the password forgot
 * (login in with a link, mainly send by e-mail)
 */
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hat = require('hat');
const login = require('connect-ensure-login');
const db = require('../../db');
const tokenUrl = require('../../services/tokenUrl');
const emailService = require('../../services/email');
const password = require('../../services/password');
const authLocalConfig = require('../../config/auth').get('Local');
const authForgotConfig = require('../../config/auth').get('Forgot');
const authResetConfig = require('../../config/auth').get('Reset');
const { logAuthEvent } = require('../../middleware/auditLog');
const sanitize = require('../../utils/sanitize');

const encodedRedirect = (req) =>
  req.redirectUri ? encodeURIComponent(req.redirectUri) : '';

exports.forgot = (req, res) => {
  const config = req.client.config ? req.client.config : {};
  const configAuthType =
    config.authTypes && config.authTypes['forgot']
      ? config.authTypes['forgot']
      : {};

  res.render('auth/forgot/forgot', {
    title: sanitize.plainText(configAuthType.title || authForgotConfig.title),
    description: sanitize.plainText(
      configAuthType.description || authForgotConfig.description
    ),
    backToLoginText: sanitize.plainText(
      configAuthType.backToLoginText || authForgotConfig.backToLoginText
    ),
    label: sanitize.plainText(configAuthType.label || authForgotConfig.label),
    buttonText: sanitize.plainText(
      configAuthType.buttonText || authForgotConfig.buttonText
    ),
    clientId: sanitize.plainText(req.client.clientId),
    client: sanitize.client(req.client),
    redirectUrl: encodedRedirect(req),
  });
};

exports.reset = (req, res) => {
  const config = req.client.config ? req.client.config : {};
  const configAuthType =
    config.authTypes && config.authTypes['reset']
      ? config.authTypes['reset']
      : authResetConfig;

  res.render('auth/forgot/reset', {
    title: sanitize.plainText(configAuthType.title),
    description: sanitize.plainText(configAuthType.description),
    buttonText: sanitize.plainText(configAuthType.buttonText),
    labelConfirmPassword: sanitize.plainText(
      configAuthType.labelConfirmPassword
    ),
    labelNewPassword: sanitize.plainText(configAuthType.labelNewPassword),
    labelEmail: sanitize.plainText(configAuthType.labelEmail),
    token: sanitize.plainText(String(req.query.token || '')),
    clientId: sanitize.plainText(req.client.clientId),
    client: sanitize.client(req.client),
    redirectUrl: encodedRedirect(req),
  });
};

/**
 * In case of reset (validation is done with middleware)
 */
exports.postReset = (req, res, next) => {
  const userId = req.userId;

  db.User.findOne({ where: { id: userId } })
    .then((user) => {
      if (req.body.email !== user.email) {
        throw new Error('E-mail not the same');
      }

      return password
        .invalidateTokensForUser(userId)
        .then(() => {
          return user.update({
            password: bcrypt.hashSync(req.body.password, saltRounds),
          });
        })
        .then(() => {
          logAuthEvent(req, 'password_reset', {
            userId,
            userName: user.email,
          });
          req.flash('success', {
            msg: 'Wachtwoord aangepast, je kan nu inloggen!',
          });
          res.redirect(
            authLocalConfig.loginUrl +
              `?clientId=${
                req.client.clientId
              }&redirect_uri=${encodedRedirect(req)}`
          );
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postForgot = (req, res, next) => {
  const backToForgot = () =>
    res.redirect(
      '/auth/local/forgot?clientId=' +
        req.client.clientId +
        `&redirect_uri=${encodedRedirect(req)}`
    );
  // The same message whether or not the address is known, so the form cannot
  // be used to find out which e-mail addresses have an account.
  const sentMessage =
    'Als dit e-mailadres bij ons bekend is, hebben we je een e-mail gestuurd met een link om je wachtwoord te resetten. Kijk ook in je spam-map.';

  const email = String(req.body.email || '').trim();
  if (!email) {
    req.flash('error', { msg: 'Vul je e-mailadres in.' });
    return backToForgot();
  }

  /**
   * Check if user exists
   */
  db.User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        req.flash('success', { msg: sentMessage });
        return backToForgot();
      }

      req.user = user;
      return password
        .invalidateTokensForUser(user.id)
        .then(() =>
          password.formatResetLink(req.client, user, encodedRedirect(req))
        )
        .then((url) => sendEmail(url, user, req.client))
        .then(() => {
          req.flash('success', { msg: sentMessage });
          return backToForgot();
        });
    })
    .catch((err) => {
      console.log(
        `[${new Date().toISOString()}][auth] password reset error: ${err?.message}`
      );
      req.flash('error', {
        msg: 'Het versturen van de e-mail is niet gelukt. Probeer het later opnieuw of neem contact op met de beheerder.',
      });
      return backToForgot();
    });

  /**
   * Send email
   */
  const sendEmail = (resetUrl, user, client) => {
    const clientConfig = client.config ? client.config : {};
    const configReset =
      clientConfig.authTypes && clientConfig.authTypes['reset']
        ? clientConfig.authTypes['reset']
        : authResetConfig;

    const clientConfigStyling = clientConfig.styling
      ? clientConfig.styling
      : {};

    const transporterConfig = clientConfig.smtpTransport
      ? clientConfig.smtpTransport
      : {};
    let emailLogo;

    // load env sheets that have been set for complete Environment, not specific for just one client
    if (process.env.LOGO) {
      emailLogo = process.env.LOGO;
    }

    if (clientConfigStyling && clientConfigStyling.logo) {
      emailLogo = clientConfigStyling.logo;
    }

    return emailService.send({
      toName: user.name.trim(),
      toEmail: user.email,
      fromEmail: clientConfig.fromEmail,
      fromName: clientConfig.fromName,
      subject: configReset.subjectLine
        ? configReset.subjectLine
        : 'Wachtwoord herstellen voor ' + client.name,
      template: 'emails/password-reset.html',
      variables: {
        resetUrl: resetUrl,
        name: user.name,
        clientUrl: client.mainUrl,
        clientName: client.name,
        logo: emailLogo,
        headerImage: false,
        emailButtonText: configReset.emailButtonText,
        emailDescriptionText: configReset.emailDescriptionText,
        emailValidTimeText:
          configReset.emailValidTimeText || 'Deze link is 1 uur geldig.',
        emailSalutationText: configReset.emailSalutationText,
        emailTitleText: configReset.emailTitleText,
        emaiLinkExplanationText: configReset.emaiLinkExplanationText,
      },
      transporterConfig,
    });
  };
};
