const twofactor = require("node-2fa");

const twoFactor = () => {
    const newSecret = twofactor.generateSecret({ name: "My Awesome App", account: "johndoe" });

    res.render('account/two-factor', {
        newSecret: req.client,
        clientId: req.client.clientId,
        requiredFields: requiredUserFields,
        info: configRequiredFields.info,
        description: configRequiredFields.description,
        title: configRequiredFields.title,
        buttonText: configRequiredFields.buttonText,
        redirect_uri: encodeURIComponent(req.query.redirect_uri)
    });
}

const twoFactorPost = () => {
    req.userModel.set('twoFactorToken', req.body.twoFactorToken);
    req.userModel.save()
        .then(() => {

        })
        .catch(() => {

        });
}

const validateToken = () => {
    const verified = twofactor.verifyToken(req.user.twoFactorToken, req.body.twoFactorToken);

    if (verified) {

    } else {

    }
}