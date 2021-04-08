const twofactor = require("node-2fa");

const twoFactorBaseUrl = '/auth/two-factor';

exports.index = () => {
    const config = req.client.config ? req.client.config : {};
    const configTwoFactor = config && config.twoFactor ? config.twoFactor : {};

    res.render('two-factor/authenticate', {
        client: req.client,
        clientId: req.client.clientId,
        postUrl: twoFactorBaseUrl,
        info: configTwoFactor.info,
        description: configTwoFactor.description,
        title: configTwoFactor.title,
        buttonText: configTwoFactor.buttonText,
        redirect_uri: encodeURIComponent(req.query.redirect_uri)
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
            await req.session.set('twoFactorValid', true).save();
        } catch (e) {
            next(e);
        }

        const redirectUrl = req.query.redirect_uri ? encodeURIComponent(req.query.redirect_uri) : req.client.redirectUrl;
        const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

        res.redirect(authorizeUrl);
    } else {
        console.log('Two factor validation failed', err);
        req.flash('error', {msg: 'Two factor validatie is niet gelukt, probeer het nogmaals.'});
        res.redirect(req.header('Referer') || '/login?clientId=' +  req.client.clientId + '&redirect_uri=' + req.redirectUrl);
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
    if (req.user.twoFactorValidated) {
        throw new Error("Not allowed to configure two factor token again.")
    } else {
        const config = req.client.config ? req.client.config : {};
        const configTwoFactor = config && config.configureTwoFactor ? config.configureTwoFactor : {};


        let twoFactorSecret = req.userModel.get('twoFactorToken');

        // will this cause issuer if used double in different Openstad installations?
        const issuer = "Openstad";
        // take email, since this is always present, make sure @ char doesn't cause issues in some cases
        const accountName = req.userModel.get('email');

        if (!twoFactorSecret) {
            /**
             * Get Two factor object:
             * @type {{secret: string, uri: string, qr: string}}
             */
            const twoFactor = twofactor.generateSecret({name: issuer, account: accountName});
            console.log('Formatted QR twoFactor', twoFactor);

            try {
                await req.userModel.set('twoFactorToken', twoFactor.secret).save();
            } catch (e) {
                next(e)
            }

            twoFactorSecret = twoFactor.secret;

        }

        const qrCode = `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/=${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}%3Fsecret=${twoFactorSecret}%26issuer=${encodeURIComponent(issuer)}`;

        console.log('Formatted QR code', qrCode);

        res.render('two-factor/configure', {
            postUrl: twoFactorBaseUrl + '/configure',
            twoFactorQrSrc: twoFactorSecret.qr,
            twoFactorSecret: twoFactor.secret,
            clientId: req.client.clientId,
            info: configTwoFactor.info,
            description: configTwoFactor.description,
            title: configTwoFactor.title,
            buttonText: configTwoFactor.buttonText,
            redirect_uri: encodeURIComponent(req.query.redirect_uri)
        });
    }
 }

exports.configurePost = async (req, res, next) => {
    if (req.user.twoFactorValidated) {
        throw new Error("Not allowed to configure two factor token again.")
    } else {
        const redirectUrl = req.query.redirect_uri ? encodeURIComponent(req.query.redirect_uri) : req.client.redirectUrl;
        const redirectToTwoFactor = `${twoFactorBaseUrl}?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}`;

        req.userModel
            .set('twoFactorConfigured', true)
            .save()
            .then(() => {
                req.flash('success', {msg: 'Two factor authentication configured!'});
                res.redirect(redirectToTwoFactor);
            })
            .catch((err) => { next(err) });
    }
}

