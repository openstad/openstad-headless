const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const config = require('config');
const db = require('../db');
const UseLock = require('../lib/use-lock');

// Purpose
// -------
// Send emails to users that have not logged in for a long time and anonymize those users if they do not respond
// 
// Runs every day
module.exports = {
  // cronTime: '*/10 * * * * *',
  cronTime: '0 20 4 * * *',
  runOnInit: false,
  onTick: UseLock.createLockedExecutable({
    name: 'anonymize-inactive-users',
    task: async (next) => {

      try {

        // for each project
        let projects = await db.Project.findAll();
        for (let i=0; i < projects.length; i++) {
          let project = projects[i];
          let anonymizeUsersXDaysAfterNotification = project.config.anonymize.anonymizeUsersAfterXDaysOfInactivity - project.config.anonymize.warnUsersAfterXDaysOfInactivity;

          // find users that have not logged in for a while
          let anonymizeUsersAfterXDaysOfInactivity = project.config.anonymize.warnUsersAfterXDaysOfInactivity;
          let targetDate = new Date();
          targetDate.setDate(targetDate.getDate() - anonymizeUsersAfterXDaysOfInactivity);
          let users = await db.User.findAll({
            where: {
              projectId: project.id,
              role: 'member',
              lastLogin: {
                [Sequelize.Op.lte]: targetDate,
              }
            }
          })
          if (users.length > 0) {

            // for each user
            for (let i = 0; i < users.length; i++) {
              let user = users[i];

              if (user.isNotifiedAboutAnonymization) {
                let daysSinceNotification = parseInt( (Date.now() - new Date(user.isNotifiedAboutAnonymization).getTime()) / ( 24 * 60 * 60 * 1000 ) );
                if (daysSinceNotification > anonymizeUsersXDaysAfterNotification) {
                  console.log('CRON anonymize-inactive-users: anonymize user', user.email, user.lastLogin);
                  // anonymize user
                  user.doAnonymize();
                }
              } else {
                // send notification
                if (user.email) {
                  console.log('CRON anonymize-inactive-users: send warning email to user', user.email, user.lastLogin);
                  db.Notification.create({
                    type: "user account about to expire",
			              projectId: project.id,
                    data: {
                      userId: user.id,
                    }
			            })
                  user.update({ isNotifiedAboutAnonymization: new Date() });
                }
              }

            }
          }
        }

        return next();

      } catch (err) {
        console.log('error in anonymize-inactive-users cron');
        next(err); // let the locked function handle this
      }
      
    }
  })

};


