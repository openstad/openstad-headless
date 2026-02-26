const { Sequelize, Op } = require('sequelize');
const log = require('debug')('app:cron');
const config = require('config');
const { Resource, Comment } = require('../db');
const UseLock = require('../lib/use-lock');

// Recalculate the scores for all Resources / Comments based on existing votes
// There are hooks in place to do this on vote creation/deletion, but if those hooks
// fail for some reason (or are skipped), the scores can get out of sync. This cron job ensures
// that scores are recalculated regularly to maintain data integrity.
module.exports = {
  cronTime: '0 30 2 * * *',
  runOnInit: false,
  onTick: UseLock.createLockedExecutable({
    name: 'recalculate-scores',
    task: async (next) => {
      try {
        // Fetch all resources and calculate their scores based on existing votes
        const resources = await Resource.findAll();
        for (const resource of resources) {
          // Workaround for validation in Resource model
          resource.auth.user = {
            role: 'admin',
          };
          await resource.calculateAndSaveScore();
        }

        // Fetch all comments and calculate their scores based on existing votes
        const comments = await Comment.findAll();
        for (const comment of comments) {
          // Workaround for validation in Comment model
          comment.auth.user = {
            role: 'admin',
          };
          await comment.calculateAndSaveScore();
        }

        return next();
      } catch (err) {
        console.log('error in recalculate-scores cron');
        next(err); // let the locked function handle this
      }
    },
  }),
};
