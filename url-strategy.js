var passport = require('passport-strategy')


var UrlStrategy = function (options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) { throw new TypeError('UrlStrategy requires a verify callback'); }

    passport.Strategy.call(this);
    this.name = 'url';
    this._verify = verify;
    this._passReqToCallback = false;
    this.failRedirect = options.failRedirect;
    this.varName = options.varName;
}

UrlStrategy.prototype.authenticate = function(req, options) {
    var self = this;

    function verified(err, user, info) {
        if (err) { return self.redirect(self.failRedirect); }
        self.success(user, info);
    }

    this._verify(req.query[this.varName], verified);
};

module.exports = UrlStrategy;
