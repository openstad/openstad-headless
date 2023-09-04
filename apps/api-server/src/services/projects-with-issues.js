const Sequelize = require('sequelize');
const db = require('../db');

let projectsWithIssues = {};

projectsWithIssues.shouldHaveEndedButAreNot = function({ offset, limit }) {
  return db.Project
    .findAndCountAll({
      offset, limit,
      attributes: { 
        include: [
          [Sequelize.literal('"Project endDate is in the past but projectHasEnded is not set"'), 'issue'],
        ],
      },
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
                  [Sequelize.Op.lte]: new Date(),
                }
              }
            }
          }, {
            config: {
              project: {
                projectHasEnded: false,
              }
            }
          }              
        ]
      }
    })
}

projectsWithIssues.endedButNotAnonymized = function({ offset, limit }) {
  return db.Project
    .findAndCountAll({
      offset, limit,
      attributes: { 
        include: [
          [Sequelize.literal('"Project has ended but is not yet anonymized"'), 'issue'],
          [Sequelize.fn("COUNT", Sequelize.col("users.id")), "userCount"]
        ],
      },
      include: [{
        model: db.User,
        attributes: [],
        where: {
          role: 'member',
        }
      }],
      group: ['users.projectId'],
      where: {
        [Sequelize.Op.and]: [
          // where project enddate is more then anonymizeUsersXDaysAfterEndDate days ago
          Sequelize.literal("DATE_ADD(CAST(JSON_UNQUOTE(JSON_EXTRACT(project.config,'$.project.endDate')) as DATETIME), INTERVAL json_extract(project.config, '$.anonymize.anonymizeUsersXDaysAfterEndDate') DAY) < NOW()"),
          { config: { project: { projectHasEnded: true } } },
        ]
      }
    })
}

module.exports = exports = projectsWithIssues;
