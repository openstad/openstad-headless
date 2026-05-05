import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import auditLogService from './audit-log.js';

// Mock the db module before importing
vi.mock('../db', () => ({
  default: {
    AuditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

const { sanitizeData, getChangedFields, getClientIp, buildEntry } =
  auditLogService;

describe('audit-log service', () => {
  describe('sanitizeData', () => {
    it('removes sensitive fields', () => {
      const data = {
        name: 'test',
        password: 'secret123',
        token: 'abc',
        email: 'test@example.com',
      };
      const result = sanitizeData(data);
      expect(result).toEqual({
        name: 'test',
        email: 'test@example.com',
      });
      expect(result.password).toBeUndefined();
      expect(result.token).toBeUndefined();
    });

    it('truncates long text fields', () => {
      const longText = 'a'.repeat(600);
      const data = { description: longText };
      const result = sanitizeData(data);
      expect(result.description.length).toBe(503); // 500 + '...'
      expect(result.description.endsWith('...')).toBe(true);
    });

    it('handles null and non-object input', () => {
      expect(sanitizeData(null)).toBeNull();
      expect(sanitizeData(undefined)).toBeUndefined();
      expect(sanitizeData('string')).toBe('string');
    });

    it('handles nested objects', () => {
      const data = {
        config: {
          password: 'should-be-removed',
          setting: 'keep',
        },
      };
      const result = sanitizeData(data);
      expect(result.config.password).toBeUndefined();
      expect(result.config.setting).toBe('keep');
    });

    it('sanitizes sensitive fields inside arrays', () => {
      const data = {
        items: [
          { name: 'item1', token: 'should-be-removed' },
          { name: 'item2', password: 'secret' },
        ],
      };
      const result = sanitizeData(data);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('item1');
      expect(result.items[0].token).toBeUndefined();
      expect(result.items[1].password).toBeUndefined();
    });

    it('passes through primitive array values', () => {
      const data = { tags: ['a', 'b', 'c'] };
      const result = sanitizeData(data);
      expect(result.tags).toEqual(['a', 'b', 'c']);
    });
  });

  describe('getChangedFields', () => {
    it('returns only changed fields', () => {
      const prev = { name: 'old', email: 'same@test.com', status: 'draft' };
      const next = { name: 'new', email: 'same@test.com', status: 'published' };
      const result = getChangedFields(prev, next);
      expect(result).toEqual({ name: 'new', status: 'published' });
    });

    it('returns null when nothing changed', () => {
      const prev = { name: 'same', email: 'same@test.com' };
      const next = { name: 'same', email: 'same@test.com' };
      const result = getChangedFields(prev, next);
      expect(result).toBeNull();
    });

    it('returns newData when previousData is null', () => {
      const result = getChangedFields(null, { name: 'new' });
      expect(result).toEqual({ name: 'new' });
    });

    it('filters sensitive fields from changes', () => {
      const prev = { name: 'old', password: 'old-pass' };
      const next = { name: 'new', password: 'new-pass' };
      const result = getChangedFields(prev, next);
      expect(result).toEqual({ name: 'new' });
    });
  });

  describe('getClientIp', () => {
    it('returns req.ip (trust proxy handles x-forwarded-for)', () => {
      const req = { ip: '1.2.3.4' };
      expect(getClientIp(req)).toBe('1.2.3.4');
    });

    it('returns null when req.ip is not set', () => {
      const req = {};
      expect(getClientIp(req)).toBeNull();
    });
  });

  describe('buildEntry', () => {
    it('builds a complete audit entry from request', () => {
      const req = {
        params: { projectId: '5' },
        user: { id: 42, displayName: 'Test User', role: 'admin' },
        headers: { 'user-agent': 'Mozilla/5.0' },
        originalUrl: '/api/project/5/resource/123',
        ip: '192.168.1.1',
      };

      const entry = buildEntry(req, {
        action: 'update',
        modelName: 'Resource',
        modelId: 123,
        previousData: { title: 'old' },
        newData: { title: 'new' },
        source: 'api',
        statusCode: 200,
      });

      expect(entry.projectId).toBe(5);
      expect(entry.userId).toBe(42);
      expect(entry.userName).toBe('Test User');
      expect(entry.userRole).toBe('admin');
      expect(entry.action).toBe('update');
      expect(entry.modelName).toBe('Resource');
      expect(entry.modelId).toBe(123);
      expect(entry.ipAddress).toBe('192.168.1.1');
      expect(entry.hostname).toBeTruthy();
      expect(entry.userAgent).toBe('Mozilla/5.0');
      expect(entry.routePath).toBe('/api/project/5/resource/123');
      expect(entry.statusCode).toBe(200);
      expect(entry.source).toBe('api');
    });

    it('handles missing user gracefully', () => {
      const req = {
        params: {},
        headers: {},
      };

      const entry = buildEntry(req, {
        action: 'read',
        modelName: 'Resource',
        source: 'api',
      });

      expect(entry.userId).toBeNull();
      expect(entry.userName).toBeNull();
      expect(entry.userRole).toBeNull();
      expect(entry.projectId).toBeNull();
    });
  });
});
