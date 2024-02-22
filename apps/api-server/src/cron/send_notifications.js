const processQueuedNotifications = require('../notifications/cron');

module.exports = {
	// cronTime: '*/10 * * * * *',
	// runOnInit: true,
	cronTime: '0 0 18 * * *',
	runOnInit: false,
	onTick: async function() {
    await processQueuedNotifications();
  }
}
