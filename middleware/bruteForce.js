const ExpressBrute = require('express-brute');


//CONFIGURE BRUTE FORCE PROTECT
exports.default = new ExpressBrute(new ExpressBrute.MemoryStore(), {
	freeRetries  : 1000,
	minWait      : 5000,
	maxWait      : 900000, // 15 min
	lifetime     : 86400, // 24 hours
	failCallback : function( req, res, next, nextValidRequestDate ) {
		var retryAfter = Math.ceil((nextValidRequestDate.getTime() - Date.now())/1000);
		res.header('Retry-After', retryAfter);
		res.locals.nextValidRequestDate = nextValidRequestDate;
		res.locals.retryAfter           = retryAfter;
		next(createError(429, {nextValidRequestDate: nextValidRequestDate}));
	}
});
