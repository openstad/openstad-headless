import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const dup = require('../services/projectDuplication');
const worker = require('./process_duplication_jobs');

const origRun = dup.runProjectDuplication;
const origProjectFindByPk = db.Project.findByPk;
const origFindAll = db.DuplicationJob.findAll;

afterEach(() => {
  dup.runProjectDuplication = origRun;
  db.Project.findByPk = origProjectFindByPk;
  db.DuplicationJob.findAll = origFindAll;
  vi.clearAllMocks();
});

function fakeJob() {
  return { projectId: 5, payload: {}, update: vi.fn().mockResolvedValue({}) };
}

describe('worker runJob', () => {
  it('marks the job started, then done when duplication has no errors', async () => {
    dup.runProjectDuplication = vi
      .fn()
      .mockResolvedValue({ errors: [], maps: {} });
    const job = fakeJob();

    await worker.runJob(job);

    expect(job.update).toHaveBeenCalledTimes(2);
    expect(job.update.mock.calls[0][0]).toEqual({ result: { started: true } });
    expect(job.update.mock.calls[1][0].status).toBe('done');
    expect(job.update.mock.calls[1][0].claimedAt).toBeNull();
  });

  it('marks failed and creates a rollback session when duplication reports errors', async () => {
    dup.runProjectDuplication = vi.fn().mockResolvedValue({
      errors: [{ step: 'x', error: 'boom' }],
      maps: { projectId: 5, tagMap: {} },
    });
    db.Project.findByPk = vi.fn().mockResolvedValue(null);
    const job = fakeJob();

    await worker.runJob(job);

    const arg = job.update.mock.calls[1][0];
    expect(arg.status).toBe('failed');
    expect(typeof arg.result.rollbackSessionId).toBe('string');
  });

  it('marks the job failed and never throws when duplication throws', async () => {
    dup.runProjectDuplication = vi.fn().mockRejectedValue(new Error('kaboom'));
    const job = fakeJob();

    await expect(worker.runJob(job)).resolves.toBeUndefined();

    expect(job.update.mock.calls[1][0].status).toBe('failed');
    expect(job.update.mock.calls[1][0].result.errors[0].error).toBe('kaboom');
  });
});

describe('worker reclaimStaleJobs', () => {
  it('fails a stale job that already started, without requeueing', async () => {
    const job = {
      result: { started: true },
      attempts: 0,
      update: vi.fn().mockResolvedValue({}),
    };
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);

    await worker.reclaimStaleJobs();

    expect(job.update).toHaveBeenCalledTimes(1);
    const arg = job.update.mock.calls[0][0];
    expect(arg.status).toBe('failed');
    expect(arg.claimedAt).toBeNull();
    expect(arg.result.errors[0].error).toMatch(/interrupted/);
  });

  it('requeues a stale job that never started', async () => {
    const job = {
      result: null,
      attempts: 0,
      update: vi.fn().mockResolvedValue({}),
    };
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);

    await worker.reclaimStaleJobs();

    const arg = job.update.mock.calls[0][0];
    expect(arg.status).toBe('pending');
    expect(arg.attempts).toBe(1);
    expect(arg.claimedAt).toBeNull();
  });

  it('fails a stale job that exceeded max attempts', async () => {
    const job = {
      result: null,
      attempts: 3,
      update: vi.fn().mockResolvedValue({}),
    };
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);

    await worker.reclaimStaleJobs();

    const arg = job.update.mock.calls[0][0];
    expect(arg.status).toBe('failed');
    expect(arg.result.errors[0].error).toMatch(/max attempts/);
  });
});
