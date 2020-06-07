const authType = 'Anonymous';
const ActionLog = require('../../models').ActionLog;

const passport            = require('passport');
const bcrypt              = require('bcrypt');
const saltRounds          = 10;
const hat                 = require('hat');
const login               = require('connect-ensure-login');
const User                = require('../../models').User;
const tokenUrl            = require('../../services/tokenUrl');
const emailService        = require('../../services/email');
const authAnonymousConfig = require('../../config/auth').get(authType);
const url                 = require('url');

exports.login  = (req, res, next) => {

  /**
   * create a new anoymous user
   */

	// console.log('ANONYMOUS: LOGIN');


	let queryString = url.parse(req.url).query;
  
	// catch users that have cookies turned off
	req.session.createAnonymousUser = true;
	res.redirect('/auth/anonymous/register?' + queryString)

};

exports.register  = (req, res, next) => {

	if (!req.session.createAnonymousUser) {

		req.flash('error', {msg: 'Cookies zijn onmisbaar op deze site'});
		return res.redirect(`/auth/anonymous/info?clientId=${req.client.clientId}&redirect_uri=${req.query.redirect_uri}`);

	} else {

		req.session.createAnonymousUser = false;

		new User({ email: req.body.email })
			.save()
			.then((user) => {

				if (!user) {
					req.flash('error', {msg: authAnonymousConfig.errorMessage});
					return res.redirect(`/auth/anonymous/info?clientId=${req.client.clientId}&redirect_uri=${req.query.redirect_uri}`);
				}

				req.user = user.serialize();

				req.logIn(user, function(err) {
					if (err) { return next(err); }

					const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

					const values = {
						method: 'post',
						name: 'Anonymous',
						value: '',
						userId: user.id,
						clientId: req.client.id,
						ip: ip
					}

					const authorizeUrl = `/dialog/authorize?redirect_uri=${encodeURIComponent(req.query.redirect_uri)}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

					try {
						new ActionLog(values)
							.save()
							.then(() => {
								return res.redirect(authorizeUrl);
							})
							.catch((err) => {
								// Redirect if it succeeds to authorize screen
								return res.redirect(authorizeUrl);
						//		next(err);
							});
					} catch (e) {
						// Redirect if it succeeds to authorize screen

						return res.redirect(authorizeUrl);
					}


				});

			})
			.catch((err) => {
				console.log('===> err', err);
				req.flash('error', {msg: 'Inloggen is niet gelukt'});
				return res.redirect(`/auth/anonymous/info?clientId=${req.client.clientId}`);
			});

	}

}

exports.info  = (req, res, next) => {
  res.render('auth/anonymous/info', {
    loginUrl: authAnonymousConfig.loginUrl,
    clientId: req.client.clientId,
    client: req.client,
  });
}
