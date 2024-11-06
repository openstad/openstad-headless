var log           = require('debug')('app:cron');
const db = require('../db');

// -------
// Run actions
//
module.exports = {
  // Run it once
    cronTime: '1 1 1 1 1',
    //cronTime: '*/5  * * * *',
    //cronTime: '*/10 * * * *',
    runOnInit: false,
    onTick: async () => {
      // Early return, actions are not created yet
      return;
        /*try {
            await db.Action.run();
        } catch (e) {
            console.log('Error in actions crons: ', e)
        }*/
    }
};
