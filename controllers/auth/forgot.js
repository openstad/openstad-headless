/**
 * Controller responsible for handling the password forgot
 * (login in with a link, mainly send by e-mail)
 */
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hat = require('hat');
const login = require('connect-ensure-login');
const User = require('../../models').User;
const tokenUrl = require('../../services/tokenUrl');
const emailService = require('../../services/email');
const password = require('../../services/password');
const authLocalConfig = require('../../config/auth').get('Local');
const authForgotConfig = require('../../config/auth').get('Forgot');
const authResetConfig = require('../../config/auth').get('Reset');

exports.forgot = (req, res) => {
    const config = req.client.config ? req.client.config : {};
    const configAuthType = config.authTypes && config.authTypes['forgot'] ? config.authTypes['forgot'] : {};


    res.render('auth/forgot/forgot', {
        title: configAuthType.title ? configAuthType.title : authForgotConfig.title,
        description: configAuthType.description ?  configAuthType.description : authForgotConfig.description,
        backToLoginText: configAuthType.backToLoginText ? configAuthType.backToLoginText : authForgotConfig.backToLoginText,
        label: configAuthType.label ?  configAuthType.label : authForgotConfig.label,
        buttonText: configAuthType.buttonText ?  configAuthType.buttonText : authForgotConfig.buttonText,
        clientId: req.client.clientId,
        client: req.client,
        redirectUrl: encodeURIComponent(req.query.redirect_uri),
    });
};

exports.reset = (req, res) => {
    const config = req.client.config ? req.client.config : {};
    const configAuthType = config.authTypes && config.authTypes['reset'] ? config.authTypes['reset'] : authResetConfig;


    res.render('auth/forgot/reset', {
        title: configAuthType.title,
        description: configAuthType.description,
        buttonText: configAuthType.buttonText,
        labelConfirmPassword: configAuthType.labelConfirmPassword,
        labelNewPassword: configAuthType.labelNewPassword,
        labelEmail: configAuthType.labelEmail,
        token: req.query.token,
        clientId: req.client.clientId,
        client: req.client,
        redirectUrl: encodeURIComponent(req.query.redirect_uri),
    });
};

/**
 * In case of reset (validation is done with middleware)
 */
exports.postReset = (req, res, next) => {

    const userId = req.userId;

    new User({id: userId})
        .fetch()
        .then((user) => {

            if (req.body.email !== user.get('email')) {
                throw new Error('E-mail not the same');
            }

            user.set('password', bcrypt.hashSync(req.body.password, saltRounds));

            return password.invalidateTokensForUser(userId)
                .then(() => {
                    return user.save();
                })
                .then(() => {
                    req.flash('success', {msg: 'Wachtwoord aangepast, je kan nu inloggen!'});
                    res.redirect(authLocalConfig.loginUrl + `?clientId=${req.client.clientId}&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}`);
                })
                .catch((err) => {
                    next(err);
                })
        })
        .catch((err) => {
            next(err);
        });
}

exports.postForgot = (req, res, next) => {
    /**
     * Check if user exists
     */
    new User({email: req.body.email})
        .fetch()
        .then((user) => {
            if (!user) {
                req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
                res.redirect('/auth/local/forgot' + '?clientId=' + req.client.clientId + `&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}`);
            }

            req.user = user.serialize();
            return password.invalidateTokensForUser(req.user.id);
        })
        .then(() => {
            console.log('req.query.redirect_uri', req.query.redirect_uri)
            return password.formatResetLink(req.client, req.user, encodeURIComponent(req.query.redirect_uri));
        })
        .then((url) => {
            return sendEmail(url, req.user, req.client);
        })
        .then(() => {
            req.flash('success', {msg: 'We hebben een e-mail naar je verstuurd'});
            res.redirect(authLocalConfig.loginUrl + '?clientId=' + req.client.clientId + `&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}`);
        })
        .catch((err) => {
            console.log('ererer', err)
            req.flash('error', {msg: 'E-mail adres is niet bekend bij ons.'});
            res.redirect('/auth/local/forgot?clientId=' + req.client.clientId + `&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}`);
        });

    /**
     * Send email
     */
    const sendEmail = (resetUrl, user, client) => {
        const clientConfig = client.config ? client.config : {};
        const configReset = clientConfig.authTypes && clientConfig.authTypes['reset'] ? clientConfig.authTypes['reset'] : authResetConfig;

        const clientConfigStyling = clientConfig.styling ? clientConfig.styling : {};

        const transporterConfig = clientConfig.smtpTransport ? clientConfig.smtpTransport : {};
        let emailLogo;

        // load env sheets that have been set for complete Environment, not specific for just one client
        if (process.env.LOGO) {
            emailLogo = process.env.LOGO;
        }

        if (clientConfigStyling && clientConfigStyling.logo) {
            emailLogo = clientConfigStyling.logo;
        }

        return emailService.send({
            toName: (user.firstName + ' ' + user.lastName).trim(),
            toEmail: user.email,
            fromEmail: clientConfig.fromEmail,
            fromName: clientConfig.fromName,
            subject: configReset.subjectLine ? configReset.subjectLine : 'Wachtwoord herstellen voor ' + client.name,
            template:  'emails/password-reset.html',
            variables: {
                resetUrl: resetUrl,
                firstName: user.firstName,
                clientUrl: client.mainUrl,
                clientName: client.name,
                logo: emailLogo,
                headerImage: false,
                emailButtonText: configReset.emailButtonText,
                emailDescriptionText: configReset.emailDescriptionText,
                emailValidTimeText: configReset.emailValidTimeText,
                emailSalutationText: configReset.emailSalutationText,
                emailTitleText: configReset.emailTitleText,
                emaiLinkExplanationText: configReset.emaiLinkExplanationText,
            },
            transporterConfig
        });
    }
}
