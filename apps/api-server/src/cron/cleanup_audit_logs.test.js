import { beforeEach, describe, expect, it, vi } from 'vitest';

import cleanupModule from './cleanup_audit_logs.js';

const { createOnTick } = cleanupModule;

const Op = {
  ne: Symbol('ne'),
  lt: Symbol('lt'),
  notIn: Symbol('notIn'),
  in: Symbol('in'),
  or: Symbol('or'),
};

function createMockDb() {
  return {
    AuditLog: {
      destroy: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({}),
    },
    Project: {
      findAll: vi.fn().mockResolvedValue([]),
    },
    Sequelize: { Op },
  };
}

describe('cleanup_audit_logs cron', () => {
  let mockDb;
  let onTick;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    onTick = createOnTick(mockDb);
    delete process.env.AUDIT_RETENTION_MONTHS;
    delete process.env.AUDIT_INCIDENT_RETENTION_MONTHS;
  });

  it('calls destroy on AuditLog', async () => {
    await onTick();
    expect(mockDb.AuditLog.destroy).toHaveBeenCalled();
  });

  it('uses default retention and batched deletion', async () => {
    await onTick();
    const call = mockDb.AuditLog.destroy.mock.calls[0][0];
    expect(call.where.createdAt).toBeDefined();
    expect(call.limit).toBe(10000);
  });

  it('respects AUDIT_RETENTION_MONTHS env var', async () => {
    process.env.AUDIT_RETENTION_MONTHS = '6';
    await onTick();
    expect(mockDb.AuditLog.destroy).toHaveBeenCalled();
  });

  it('handles projects with incident timestamp', async () => {
    const recentIncident = new Date();
    recentIncident.setMonth(recentIncident.getMonth() - 1);

    mockDb.Project.findAll.mockResolvedValue([
      { id: 5, auditIncidentAt: recentIncident.toISOString() },
    ]);

    await onTick();
    // Should call destroy for both regular and incident cleanup
    expect(mockDb.AuditLog.destroy).toHaveBeenCalledTimes(2);
  });

  it('creates an audit entry when records are deleted', async () => {
    mockDb.AuditLog.destroy.mockResolvedValue(5);

    await onTick();

    expect(mockDb.AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'cleanup',
        modelName: 'audit_log',
        source: 'api',
        newData: expect.objectContaining({
          deletedCount: 5,
        }),
      })
    );
  });

  it('does not create an audit entry when no records are deleted', async () => {
    mockDb.AuditLog.destroy.mockResolvedValue(0);

    await onTick();

    expect(mockDb.AuditLog.create).not.toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDb.Project.findAll.mockRejectedValue(new Error('DB error'));

    await onTick();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[cron] cleanup_audit_logs error:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
