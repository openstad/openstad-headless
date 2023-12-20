const moment = require('moment');
const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const db	= require('../db');

// Purpose
// -------
// Auto-close resources that passed the deadline.
// 
// Runs every hour
module.exports = {
	cronTime: '0 0 */1 * * *',
	// cronTime: '*/5 * * * * *',
	runOnInit: false,
	onTick: async function() {

    try {

      let projects = await db.Project.findAll({
        where: Sequelize.where(Sequelize.fn('JSON_VALUE', Sequelize.col('config'), Sequelize.literal('"$.resources.automaticallyUpdateStatus.isActive"')), 'true')
      });

      for ( let project of projects ) {

        let days = project.config.resources.automaticallyUpdateStatus.afterXDays || 90;
        let resources = await db.Resource.findAll({
          where: {
            projectId: project.id,
            startDate: { [Op.lte]: moment().subtract(days, 'days').toDate() },
   			    status: 'OPEN'
          }
        });

        for ( let resource of resources ) {
          let result = await resource.setStatus('CLOSED');
          log('Automatically closed resource %d', resource.id);
        }

      }

    } catch(err) {
      console.log('CRON automatically update status FAILED');
      console.log(err);
    }

	}
};
