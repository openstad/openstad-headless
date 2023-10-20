const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const db	= require('../db');

// Purpose
// -------
// Auto-close ideas that passed the deadline.
// 
// Runs every hour
module.exports = {
	cronTime: '0 0 */1 * * *',
	// cronTime: '*/5 * * * * *',
	runOnInit: false,
	onTick: async function() {

    try {

      let projects = await db.Project.findAll({
        where: Sequelize.where(Sequelize.fn('JSON_VALUE', Sequelize.col('config'), Sequelize.literal('"$.ideas.automaticallyUpdateStatus.isActive"')), 'true')
      });

      for ( let project of projects ) {

        let days = project.config.ideas.automaticallyUpdateStatus.afterXDays || 90;
        let startDate = new Date();
        startDate = new Date( startDate.setDate( startDate.getDate() - days ) );
        let ideas = await db.Idea.findAll({
          where: {
            projectId: project.id,
            startDate,
   			    status: 'OPEN'
          }
        });

        for ( let idea of ideas ) {
          let result = await idea.setStatus('CLOSED');
          log('Automatically closed idea %d', idea.id);
        }

      }

    } catch(err) {
      console.log('CRON automatically update status FAILED');
      console.log(err);
    }

	}
};
