const config = require('config');

function dateFilter( date ) {
	try {
		if( !date ) {
			throw Error('Onbekende datum');
		} else if( date === 'now' || date === 'today' ) {
			date = new Date();
		}
		return new Intl.DateTimeFormat(...config.datetime.format).format(date);
	} catch( error ) {
		return (error.message || 'dateFilter error').toString()
	}
}

module.exports = dateFilter;
