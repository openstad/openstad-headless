const config = require('config');
const db = require('../db');

// Run every hour by default; actual schedule is managed by the cron runner that loads this file.
module.exports = {
  // Example: run every hour. Adjust in the cron scheduler if needed.
  cronTime: '0 40 3 * * *',
  onTick: async function () {
    try {
      const hours = 48;
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const deletedCount = await db.PendingBudgetVote.destroy({
        where: {
          createdAt: { [db.Sequelize.Op.lt]: cutoffDate },
        },
        force: true,
      });

      if (deletedCount > 0) {
        console.log(
          `[cron] cleanup_pending_budget_votes: deleted ${deletedCount} records older than 48h`
        );
      }
    } catch (err) {
      console.error('[cron] cleanup_pending_budget_votes error:', err);
    }
  },
  onComplete: function () {},
};
