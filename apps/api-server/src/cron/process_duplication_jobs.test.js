import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const dup = require('../services/projectDuplication');
const worker = require('./process_duplication_jobs');

const origRun = dup.runProjectDuplication;
const origProjectFindByPk = db.Project.findByPk;
const origFindAll = db.DuplicationJob.findAll;
const origUpdate = db.DuplicationJob.update;

afterEach(() => {
  dup.runProjectDuplication = origRun;
  db.Project.findByPk = origProjectFindByPk;
  db.DuplicationJob.findAll = origFindAll;
  db.DuplicationJob.update = origUpdate;
  vi.clearAllMocks();
});

function staleJob(overrides = {}) {
  return {
    id: 7,
    projectId: 5,
    claimedAt: new Date('2020-01-01T00:00:00Z'),
    result: null,
    attempts: 0,
    update: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

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
  it('fails a stale job that already started, guarded on the claim it read', async () => {
    const job = staleJob({ result: { started: true } });
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);
    db.DuplicationJob.update = vi.fn().mockResolvedValue([1]);

    await worker.reclaimStaleJobs();

    const [values, options] = db.DuplicationJob.update.mock.calls[0];
    expect(values.status).toBe('failed');
    expect(values.claimedAt).toBeNull();
    expect(values.result.errors[0].error).toMatch(/interrupted/);
    expect(options.where).toEqual({
      id: job.id,
      status: 'running',
      claimedAt: job.claimedAt,
    });
  });

  it('does nothing further when another process already reclaimed the job', async () => {
    const job = staleJob({ result: { started: true, maps: { projectId: 5 } } });
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);
    db.DuplicationJob.update = vi.fn().mockResolvedValue([0]);

    await worker.reclaimStaleJobs();

    expect(db.DuplicationJob.update).toHaveBeenCalledTimes(1);
  });

  it('stores a rollback session for an interrupted job that has maps', async () => {
    const job = staleJob({ result: { started: true, maps: { projectId: 5 } } });
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);
    db.DuplicationJob.update = vi.fn().mockResolvedValue([1]);
    db.Project.findByPk = vi.fn().mockResolvedValue(null);

    await worker.reclaimStaleJobs();

    expect(db.DuplicationJob.update).toHaveBeenCalledTimes(2);
    const [values] = db.DuplicationJob.update.mock.calls[1];
    expect(typeof values.result.rollbackSessionId).toBe('string');
    expect(values.result.maps).toEqual({ projectId: 5 });
  });

  it('requeues a stale job that never started', async () => {
    const job = staleJob();
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);
    db.DuplicationJob.update = vi.fn().mockResolvedValue([1]);

    await worker.reclaimStaleJobs();

    const [values, options] = db.DuplicationJob.update.mock.calls[0];
    expect(values.status).toBe('pending');
    expect(values.attempts).toBe(1);
    expect(values.claimedAt).toBeNull();
    expect(options.where.claimedAt).toBe(job.claimedAt);
  });

  it('fails a stale job that exceeded max attempts', async () => {
    const job = staleJob({ attempts: 3 });
    db.DuplicationJob.findAll = vi.fn().mockResolvedValue([job]);
    db.DuplicationJob.update = vi.fn().mockResolvedValue([1]);

    await worker.reclaimStaleJobs();

    const [values] = db.DuplicationJob.update.mock.calls[0];
    expect(values.status).toBe('failed');
    expect(values.result.errors[0].error).toMatch(/max attempts/);
  });
});
