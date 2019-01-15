const ExpressBrute = require('express-brute');
var moment = require('moment-timezone');

const failCallback = function (req, res, next, nextValidRequestDate) {
    req.flash('error', { msg: "U heeft te vaak gepoogd in te loggen, probeer het weer "+moment(nextValidRequestDate).fromNow()});
    res.redirect('/login?clientId=' + req.client.clientId); // brute force protection triggered, send them back to the login page
};

const handleStoreError = function (error) {
    log.error(error); // log this error so we can figure out what went wrong
    // cause node to exit, hopefully restarting the process fixes the problem
    throw {
        message: error.message,
        parent: error.parent
    };
}

//CONFIGURE BRUTE FORCE PROTECT
exports.user = new ExpressBrute(new ExpressBrute.MemoryStore(), {
	freeRetries: 10,
	minWait: 5*60*1000, // 5 minutes
	maxWait: 60*60*1000, // 1 hour,
	failCallback: failCallback,
	handleStoreError: handleStoreError
});

//CONFIGURE BRUTE FORCE PROTECT
exports.global = new ExpressBrute(new ExpressBrute.MemoryStore(), {
	freeRetries: 1000,
	attachResetToRequest: false,
	refreshTimeoutOnRequest: false,
	minWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time)
	maxWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time)
	lifetime: 24*60*60, // 1 day (seconds not milliseconds)
	failCallback: failCallback,
	handleStoreError: handleStoreError
});
