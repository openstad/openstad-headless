const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const config = require('config');
const db = require('../db');
const UseLock = require('../lib/use-lock');

// Purpose
// -------
// Anonymize users in projects that have ended, if the project settings allow it
//
// Runs every day
module.exports = {
  cronTime: '0 20 4 * * *',
  runOnInit: false,
  onTick: UseLock.createLockedExecutable({
    name: 'project-ended-anonymize-users',
    task: async (next) => {
      try {
        let projects = await db.Project.findAll();

        for (const project of projects) {
          const projectEndDate = project?.config?.project?.endDate;
          let formattedEndDate = new Date(projectEndDate);
          const today = new Date().setHours(0, 0, 0, 0);

          const projectHasEnded = projectEndDate
            ? new Date(projectEndDate) < today
            : false;

          const allowAnonymization =
            project?.config?.anonymize?.allowAnonymizeUsersAfterEndDate;
          const anonymizeUsersXDaysAfterEndDate =
            project?.config?.anonymize?.anonymizeUsersXDaysAfterEndDate;
          const daysAfterEndDate = isNaN(
            parseInt(anonymizeUsersXDaysAfterEndDate)
          )
            ? 0
            : parseInt(anonymizeUsersXDaysAfterEndDate);

          const readyToAnonymize =
            projectHasEnded &&
            allowAnonymization &&
            new Date(
              formattedEndDate.getTime() +
                daysAfterEndDate * 24 * 60 * 60 * 1000
            ) < today;

          if (!readyToAnonymize) continue;

          let users = await db.User.findAll({
            where: {
              projectId: project.id,
              role: 'member',
            },
          });

          if (users.length > 0) {
            // for each user
            for (const user of users) {
              console.log(
                'CRON project-ended-anonymize-users: anonymize user',
                user.email
              );
              // anonymize user
              user.doAnonymize();
            }
          }
        }

        return next();
      } catch (err) {
        console.log('error in project-ended-anonymize-users cron');
        next(err); // let the locked function handle this
      }
    },
  }),
};
