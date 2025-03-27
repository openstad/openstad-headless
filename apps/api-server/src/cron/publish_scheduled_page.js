const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const config = require('config');
const db = require('../db');
const UseLock = require('../lib/use-lock');

// Purpose
// -------
// Publish pages that are scheduled
//
// Runs every hour


// module.exports = {
//     cronTime: '59 * * * *',
//     runOnInit: false,
//     onTick: UseLock.createLockedExecutable({
//         name: 'publish-scheduled-page',
//         task: async (next) => {
//             try {
//                 await db.models['apostrophe-pages']
//                     .update({
//                         publishedAt: Sequelize.fn('NOW')
//                     }, {
//                         where: {
//                             scheduledPublishDate: {
//                                 [Op.lte]: Sequelize.fn('NOW')
//                             },
//                             publishedAt: null
//                         }
//                     });
//
//                 log('Scheduled pages published successfully');
//                 return next();
//             } catch (err) {
//                 log('Error in publish-scheduled-page cron:', err);
//                 next(err);
//             }
//         }
//     })
// };
