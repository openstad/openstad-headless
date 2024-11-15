var config  = require('config');
var CronJob = require('cron').CronJob;
var extend  = require('lodash/extend');
var util    = require('./util');

module.exports = {
	// jobs: new Map,
	//
	// start: function() {
	// 	var jobs = this.jobs;
	// 	util.invokeDir('./cron', function( jobDef, fileName ) {
	// 		try {
	// 			console.log('Creating CronJob for file:', fileName);
	// 			console.log('Job definition:', jobDef);
	// 			var job = new CronJob(extend({}, jobDef, {
	// 				timeZone : config.get('timeZone'),
	// 				start    : true
	// 			}));
	// 			jobs.set(fileName, job);
	// 		} catch( e ) {
	// 			console.error('Error creating CronJob for file:', fileName, e);
	// 			throw new Error('Invalid cron: ' + e.message);
	// 		}
	// 	});
	// 	return this;
	// },
	// stop: function() {
	// 	for( let job of this.jobs ) {
	// 		job.stop();
	// 	}
	// 	return this;
	// }
}
