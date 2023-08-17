var config  = require('config');

if( config.get('debug') ) {
	Promise.longStackTraces();
}
