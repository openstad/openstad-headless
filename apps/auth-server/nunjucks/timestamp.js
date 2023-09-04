// Examples:
// {{ var | date }}
// {{ var | date('YYYY-MM-DD') }}
function timestamp( date ) {
	try {
		if( !date ) {
			throw Error('Onbekende datum');
		}
		// Timezone is set in `config/moment.js`.
		var date = new Date(date);
    return date.getTime();
	} catch( error ) {
		return (error.message || 'dateFilter error').toString()
	}
}


module.exports = timestamp;
