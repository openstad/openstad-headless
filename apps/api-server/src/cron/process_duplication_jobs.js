const db = require('../db');
const dup = require('../services/projectDuplication');
const {
  createDuplicateRollbackSessionStore,
} = require('../util/duplicate-rollback-session');

const STALE_MS = 5 * 60 * 1000;
const HEARTBEAT_MS = 60 * 1000;
const MAX_ATTEMPTS = 3;

const rollbackStore = createDuplicateRollbackSessionStore({
  projectModel: db.Project,
});

let busy = false;

async function reclaimStaleJobs() {
  const cutoff = new Date(Date.now() - STALE_MS);
  const staleJobs = await db.DuplicationJob.findAll({
    where: {
      status: 'running',
      claimedAt: { [db.Sequelize.Op.lt]: cutoff },
    },
  });

  for (const job of staleJobs) {
    if (job.result && job.result.started) {
      await job.update({
        status: 'failed',
        result: {
          errors: [
            {
              step: 'worker',
              error:
                'duplication interrupted, existing data may need manual cleanup',
            },
          ],
        },
        claimedAt: null,
      });
      continue;
    }

    if (job.attempts >= MAX_ATTEMPTS) {
      await job.update({
        status: 'failed',
        result: {
          errors: [{ step: 'worker', error: 'exceeded max attempts' }],
        },
        claimedAt: null,
      });
      continue;
    }

    await job.update({
      status: 'pending',
      claimedAt: null,
      attempts: job.attempts + 1,
    });
  }
}

async function claimNextJob() {
  return db.sequelize.transaction(async (t) => {
    const job = await db.DuplicationJob.findOne({
      where: { status: 'pending' },
      order: [['id', 'ASC']],
      lock: t.LOCK.UPDATE,
      skipLocked: true,
      transaction: t,
    });
    if (!job) return null;
    await job.update(
      { status: 'running', claimedAt: new Date() },
      { transaction: t }
    );
    return job;
  });
}

async function createRollbackSession(job, maps) {
  try {
    const rollbackSessionId = rollbackStore.createSession({
      userId: job.userId,
      data: maps,
    });
    await rollbackStore.saveSessionOnProject({
      projectId: job.projectId,
      sessionId: rollbackSessionId,
      userId: job.userId,
      data: maps,
    });
    return rollbackSessionId;
  } catch (err) {
    console.error('[cron] failed to store rollback session:', err);
    return undefined;
  }
}

async function runJob(job) {
  const heartbeat = setInterval(() => {
    db.DuplicationJob.update(
      { claimedAt: new Date() },
      { where: { id: job.id, status: 'running' } }
    ).catch((err) => {
      console.error('[cron] duplication heartbeat failed:', err);
    });
  }, HEARTBEAT_MS);

  try {
    await job.update({ result: { started: true } });
    const { errors, maps } = await dup.runProjectDuplication({
      projectId: job.projectId,
      payload: job.payload,
    });
    if (errors.length) {
      const rollbackSessionId = await createRollbackSession(job, maps);
      await job.update({
        status: 'failed',
        result: { errors, maps, rollbackSessionId },
        claimedAt: null,
      });
    } else {
      await job.update({
        status: 'done',
        result: { errors, maps },
        claimedAt: null,
      });
    }
  } catch (err) {
    await job
      .update({
        status: 'failed',
        result: { errors: [{ step: 'worker', error: err.message }] },
        claimedAt: null,
      })
      .catch((updateErr) => {
        console.error(
          '[cron] failed to mark duplication job as failed:',
          updateErr
        );
      });
  } finally {
    clearInterval(heartbeat);
  }
}

async function processOneJob() {
  const job = await claimNextJob();
  if (!job) return false;
  await runJob(job);
  return true;
}

module.exports = {
  cronTime: '*/5 * * * * *',
  onTick: async function () {
    if (busy) return;
    busy = true;
    try {
      await reclaimStaleJobs();
      await processOneJob();
    } catch (err) {
      console.error('[cron] process_duplication_jobs error:', err);
    } finally {
      busy = false;
    }
  },
  onComplete: function () {},
  runJob,
  processOneJob,
  reclaimStaleJobs,
};
