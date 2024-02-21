const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const config = require('config');
const db = require('../db');
const UseLock = require('../lib/use-lock');

// Purpose
// -------
// Send emails to projectmanagers just before the enddate of their project is reached
// 
// Runs every day
module.exports = {
  // cronTime: '*/10 * * * * *',
  cronTime: '0 30 4 * * *',
  runOnInit: false,
  onTick: UseLock.createLockedExecutable({
    name: 'send-enddate-notifications',
    task: async (next) => {

      let endDateConfig = config.notifications.sendEndDateNotifications;

      try {

        // for each project
        let targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + endDateConfig.XDaysBefore);
        let projects = await db.Project.findAll({
          where: {
            [Sequelize.Op.and]: [
              {
                config: {
                  project: {
                    endDate: {
                      [Sequelize.Op.not]: null
                    }
                  }
                }
              }, {
                config: {
                  project: {
                    endDate: {
                      [Sequelize.Op.not]: ''
                    }
                  }
                }
              }, {
                config: {
                  project: {
                    endDate: {
                      [Sequelize.Op.lte]: targetDate,
                    }
                  }
                }
              }, {
                config: {
                  project: {
                    projectHasEnded: false,
                  }
                }
                //            }, {
                //              config: {
                //                project: {
                //                  endDateNotificationSent: false
                //                }
                //              }
              }
            ]
          }
        });
        for (let i=0; i < projects.length; i++) {
          let project = projects[i];

          if (!project.config.project.endDateNotificationSent) { // todo: the where clause above does not work for reasons I do not have time for now

            // send notification
            console.log('CRON send-enddate-notifications: send email to projectmanager');
            await db.Notification.create({
              type: "project issues warning",
			        projectId: project.id,
              data: {
                messages: [{content: 'de einddatum van je project nadert'}]
              }
			      })

            project.update({ config: { project: { endDateNotificationSent: true } } });

          }
        }
        
        return next();

      } catch (err) {
        console.log('error in send-enddate-notifications cron');
        next(err); // let the locked function handle this
      }
      
    }
  })

};

