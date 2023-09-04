const twofactor = require("node-2fa");

const twoFactorBaseUrl = '/auth/two-factor';

function isEncoded(uri) {
    uri = uri || '';

    return uri !== decodeURIComponent(uri);
}

const formatRedirectUrl = (url, req) => {
    let redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;

    // check if url is encoded otherwise encode
    redirectUrl  = isEncoded(redirectUrl) ? redirectUrl : encodeURIComponent(redirectUrl);

    return `${url}?clientId=${req.client.clientId}&redirect_uri=${redirectUrl}`;
}

exports.index = (req, res, next) => {
    const config = req.client.config ? req.client.config : {};
    const configTwoFactor = config && config.twoFactor ? config.twoFactor : {};

    // in case user hasn't configured 2FA yet, redirect them to the configuration screen
    if (!req.user.twoFactorConfigured) {
        return res.redirect(formatRedirectUrl(`${twoFactorBaseUrl}/configure`, req));
    }

    res.render('auth/two-factor/authenticate', {
        client: req.client,
        clientId: req.client.clientId,
        postUrl: twoFactorBaseUrl,
        info: configTwoFactor.info,
        description: configTwoFactor.description,
        title: configTwoFactor.title,
        buttonText: configTwoFactor.buttonText,
        redirectUrl: encodeURIComponent(req.query.redirect_uri)
    });
}



/**
 * Handle post of 2FA auth
 *
 * @param req
 * @param res
 * @param next
 */
exports.post = async (req, res, next) => {
    const verified = twofactor.verifyToken(req.user.twoFactorToken, req.body.twoFactorToken);

    if (verified) {
        try {
            req.session.twoFactorValid = true;
            await req.session.save();
        } catch (e) {
            next(e);
        }

        const redirectUrl = req.query.redirect_uri ? encodeURIComponent(req.query.redirect_uri) : req.client.redirectUrl;
        const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

        res.redirect(authorizeUrl);
    } else {
        console.log('Two factor validation failed');
        req.flash('error', {msg: 'Two factor validatie is niet gelukt, probeer het nogmaals.'});
        res.redirect(req.header('Referer') || formatRedirectUrl(`/login`, req));
    }
}

/**
 * First time configuration is only allowed first time when no Two factor token is present
 * After this re-configuring 2factor can only happen after being logged in with 2 factor.
 *
 * @param req
 * @param res
 * @param next
 */
exports.configure = async (req, res, next) => {
    if (req.user.twoFactorConfigured) {
        return next(new Error("Not allowed to configure two factor token again."));
    } else {
        const config = req.client.config ? req.client.config : {};
        const configTwoFactor = config && config.configureTwoFactor ? config.configureTwoFactor : {};

        let twoFactorSecret = req.user.twoFactorToken;

        // @todo, would be good to take this from ENV or settings somewhere. Currently however no name per installation
        const issuer = "Openstad";
        // take email, since this is always present, make sure @ char doesn't cause issues in some cases
        const accountName = req.user.email;

        if (!twoFactorSecret) {
            /**
             * Get Two factor object:
             * @type {{secret: string, uri: string, qr: string}}
             */
            const twoFactor = twofactor.generateSecret({name: issuer, account: accountName});

            try {
              await req.user.update({ twoFactorToken: twoFactor.secret });
            } catch (e) {
                next(e)
            }

            twoFactorSecret = twoFactor.secret;

        }

        const qrCode = `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/=${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}%3Fsecret=${twoFactorSecret}%26issuer=${encodeURIComponent(issuer)}`;

        res.render('auth/two-factor/configure', {
            postUrl: twoFactorBaseUrl + '/configure',
            twoFactorQrSrc: qrCode,
            twoFactorSecret: twoFactorSecret,
            clientId: req.client.clientId,
            info: configTwoFactor.info,
            description: configTwoFactor.description,
            title: configTwoFactor.title,
            buttonText: configTwoFactor.buttonText,
            redirectUrl: encodeURIComponent(req.query.redirect_uri)
        });
    }
 }

exports.configurePost = async (req, res, next) => {
    if (req.user.twoFactorConfigured) {
        return next(new Error("Not allowed to configure two factor token again."));
    } else {
        const redirectToTwoFactor = formatRedirectUrl(twoFactorBaseUrl, req);

        req.user
        .update({ twoFactorConfigured: true })
            .then(() => {
                req.flash('success', {msg: 'Two factor authentication configured!'});
                res.redirect(redirectToTwoFactor);
            })
            .catch((err) => { next(err) });
    }
}

