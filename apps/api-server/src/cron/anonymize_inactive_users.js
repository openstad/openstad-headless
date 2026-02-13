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
        let projects = await db.Project.findAll();

        for (const project of projects) {
          let users = await db.User.findAll({
            where: {
              projectId: project.id,
              role: 'member',
            },
          });

          if (users.length > 0) {
            // for each user
            for (const user of users) {
              const warnUsersAfterXDaysOfInactivity =
                project?.config?.anonymize?.warnUsersAfterXDaysOfInactivity ||
                770;
              const anonymizeUsersAfterXDaysOfInactivity =
                project?.config?.anonymize
                  ?.anonymizeUsersAfterXDaysOfInactivity || 860;

              if (user.isNotifiedAboutAnonymization) {
                let daysSinceNotification = parseInt(
                  (Date.now() -
                    new Date(user.isNotifiedAboutAnonymization).getTime()) /
                    (24 * 60 * 60 * 1000)
                );
                let anonymizeUsersXDaysAfterNotification =
                  anonymizeUsersAfterXDaysOfInactivity -
                  warnUsersAfterXDaysOfInactivity;

                if (
                  daysSinceNotification > anonymizeUsersXDaysAfterNotification
                ) {
                  console.log(
                    'CRON anonymize-inactive-users: anonymize user',
                    user.email,
                    user.lastLogin
                  );
                  // anonymize user
                  user.doAnonymize();
                }
              } else {
                // send notification logic
                if (user.email) {
                  const lastLoginDate = new Date(user.lastLogin);

                  const lastLoginTime = new Date(user.lastLogin).getTime();
                  const targetAnonymizeWarnTime =
                    lastLoginTime +
                    warnUsersAfterXDaysOfInactivity * 24 * 60 * 60 * 1000;

                  if (Date.now() < targetAnonymizeWarnTime) {
                    // Skip sending email to user, not enough inactivity yet
                    continue;
                  }
                  console.log(
                    'CRON anonymize-inactive-users: send warning email to user',
                    user.email,
                    user.lastLogin
                  );

                  const anonymizeDate = new Date(
                    lastLoginTime +
                      warnUsersAfterXDaysOfInactivity * 24 * 60 * 60 * 1000
                  );

                  const dateInDDMMYYYY = (date) => {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                  };

                  db.Notification.create({
                    type: 'user account about to expire',
                    projectId: project.id,
                    data: {
                      userId: user.id,
                      projectUrl: project.url,
                      projectName: project.name,
                      anonymizeDate: dateInDDMMYYYY(anonymizeDate),
                    },
                  });
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
    },
  }),
};
