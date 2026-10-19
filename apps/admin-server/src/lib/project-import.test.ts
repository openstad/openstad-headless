import { describe, expect, it } from 'vitest';

import {
  ProjectImportError,
  buildProjectImportPayload,
} from './project-import';

const gzFile = {
  id: 12,
  name: 'gz-test',
  title: 'GZ test',
  url: 'gz.example.org',
  safeConfig: {},
  hostStatus: {},
  installationUrls: [],
  statuses: [{ id: 1, projectId: 12, name: 'Open' }],
};

const goudaFile = {
  id: 34,
  name: 'gouda',
  title: 'Gouda',
  url: 'gouda.example.org',
  safeConfig: {},
  hostStatus: {},
  installationUrls: [],
  statuses: [
    { id: 1, projectId: 34, name: 'Open' },
    { id: 2, projectId: 34, name: 'Closed' },
  ],
  resources: [
    { id: 1, title: 'One', commentsFor: [], tags: [], votes: [] },
    { id: 2, title: 'Two' },
  ],
};

const fullFile = {
  id: 56,
  name: 'full',
  title: 'Full export',
  url: 'full.example.org',
  config: { resources: { titleMinLength: 10 }, votes: { isActive: true } },
  emailConfig: { notifications: { from: 'a@example.org' } },
  statuses: [{ id: 1, projectId: 56, name: 'Open' }],
  resources: [],
};

const build = (file: unknown, name = 'imported') =>
  buildProjectImportPayload(JSON.stringify(file), name);

describe('buildProjectImportPayload', () => {
  it('reports missing settings and skipped statuses for a GZ-shaped file', () => {
    const result = build(gzFile);
    expect(result.missing).toEqual(['config', 'emailConfig']);
    expect(result.notImported).toEqual(['statuses']);
    expect(result.payload).not.toHaveProperty('config');
    expect(result.payload).not.toHaveProperty('emailConfig');
  });

  it('reports skipped statuses and resources for a Gouda-shaped file', () => {
    const result = build(goudaFile);
    expect(result.missing).toEqual(['config', 'emailConfig']);
    expect(result.notImported).toEqual(['statuses', 'resources']);
    expect(result.payload).not.toHaveProperty('config');
    expect(result.payload).not.toHaveProperty('emailConfig');
  });

  it('keeps config and emailConfig of a full export', () => {
    const result = build(fullFile);
    expect(result.missing).toEqual([]);
    expect(result.notImported).toEqual(['statuses']);
    expect(result.payload.config).toEqual(fullFile.config);
    expect(result.payload.emailConfig).toEqual(fullFile.emailConfig);
  });

  it('never puts statuses, resources, id or url in the payload', () => {
    for (const file of [gzFile, goudaFile, fullFile]) {
      const { payload } = build(file);
      for (const key of ['statuses', 'resources', 'id', 'url']) {
        expect(payload).not.toHaveProperty(key);
      }
    }
  });

  it('uses the given name and falls back to name when title is missing', () => {
    const { payload } = build({ name: 'only-name' }, 'chosen');
    expect(payload.name).toBe('chosen');
    expect(payload.title).toBe('chosen');
    expect(build(gzFile, 'chosen').payload.title).toBe('GZ test');
  });

  it('treats a non-object config as missing', () => {
    const result = build({ ...fullFile, config: [], emailConfig: 'x' });
    expect(result.missing).toEqual(['config', 'emailConfig']);
  });

  it('throws invalid-json for text that is not JSON', () => {
    expect(() => buildProjectImportPayload('not json', 'x')).toThrow(
      ProjectImportError
    );
    try {
      buildProjectImportPayload('not json', 'x');
    } catch (e) {
      expect((e as ProjectImportError).code).toBe('invalid-json');
    }
  });

  it.each([[[]], [null], ['text'], [5]])(
    'throws not-a-project for %j',
    (value) => {
      try {
        build(value);
        throw new Error('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ProjectImportError);
        expect((e as ProjectImportError).code).toBe('not-a-project');
      }
    }
  );
});
