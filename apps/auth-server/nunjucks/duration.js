var moment   = require('moment-timezone');

// Example:
// {{ var | duration }}
function duration( ms ) {
	try {
		// Timezone is set in `config/moment.js`.
		return moment.duration(ms).humanize();
	} catch( error ) {
		return (error.message || 'duration error').toString()
	}
}

module.exports = duration;