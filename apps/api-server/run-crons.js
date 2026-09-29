#!/usr/bin/env node

/**
 * Standalone script for running cron jobs via Kubernetes CronJob.
 *
 * Loads all cron definitions from src/cron/ and executes any job whose
 * cronTime schedule has at least one match in the past CRON_WINDOW_MINUTES
 * (default: 15). This allows a single K8s CronJob running every X minutes
 * to cover all the different schedules defined in the application.
 *
 * Usage:
 *   CRON_WINDOW_MINUTES=15 node run-crons.js
 */

require('dotenv').config();

const config = require('config');

// Env variable used by npm's `debug` package.
process.env.DEBUG = config.logging;

require('./config/promises');
require('./config/moment');

const { CronTime } = require('cron');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');

const windowMinutes = parseInt(process.env.CRON_WINDOW_MINUTES, 10) || 15;
const timeZone = config.get('timeZone');
const cronDir = path.join(__dirname, 'src', 'cron');

/**
 * Check if a cron schedule had at least one tick in the window [now - windowMs, now].
 *
 * Uses CronTime._getNextDateFrom(windowStart) — if that next fire time falls
 * before "now", the job should have fired within the window.
 */
function shouldRunInWindow(cronTime, windowMs) {
  try {
    const ct = new CronTime(cronTime, timeZone);
    const now = moment();
    const windowStart = moment().subtract(windowMs, 'milliseconds');
    const nextFromWindow = ct._getNextDateFrom(windowStart);
    return nextFromWindow.isSameOrBefore(now);
  } catch (e) {
    console.warn(`[run-crons] Invalid cron expression: ${cronTime}`, e.message);
    return false;
  }
}

async function main() {
  const windowMs = windowMinutes * 60 * 1000;
  console.log(
    `[run-crons] Checking cron jobs with a ${windowMinutes}-minute window`
  );

  const files = fs
    .readdirSync(cronDir)
    .filter((f) => f.endsWith('.js') && f !== 'index.js');

  const jobs = [];

  for (const file of files) {
    const jobDef = require(path.join(cronDir, file));
    const name = file.replace(/\.js$/, '');

    if (!jobDef.cronTime || !jobDef.onTick) {
      console.log(`[run-crons] Skipping ${name}: missing cronTime or onTick`);
      continue;
    }

    if (shouldRunInWindow(jobDef.cronTime, windowMs)) {
      console.log(
        `[run-crons] Running: ${name} (schedule: ${jobDef.cronTime})`
      );
      jobs.push(
        Promise.resolve()
          .then(() => jobDef.onTick())
          .then(() => console.log(`[run-crons] Completed: ${name}`))
          .catch((err) => console.error(`[run-crons] Failed: ${name}`, err))
      );
    } else {
      console.log(`[run-crons] Skipping ${name}: not scheduled in window`);
    }
  }

  if (jobs.length === 0) {
    console.log('[run-crons] No jobs to run in this window');
  } else {
    await Promise.allSettled(jobs);
  }

  console.log('[run-crons] Done');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[run-crons] Fatal error:', err);
    process.exit(1);
  });
