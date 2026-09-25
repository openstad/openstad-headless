import { describe, expect, it } from 'vitest';

import {
  ExportData,
  transformExportToImport,
} from './transform-export-to-import';

describe('transformExportToImport', () => {
  const baseExport: ExportData = {
    id: 1,
    name: 'Test Project',
    title: 'Test Title',
    config: { project: { projectHasEnded: false } },
    emailConfig: { smtp: 'test' },
    areaId: 1,
    hostStatus: 'live',
    widgets: [
      { id: 10, projectId: 1, type: 'resourceoverview', config: {} },
      { id: 11, projectId: 1, type: 'enquete', config: {} },
    ],
    tags: [
      { id: 20, projectId: 1, name: 'Tag A', type: 'theme' },
      { id: 21, projectId: 1, name: 'Tag B', type: 'area' },
    ],
    statuses: [
      { id: 30, projectId: 1, name: 'Open' },
      { id: 31, projectId: 1, name: 'Closed' },
    ],
    resources: [
      { id: 40, projectId: 1, title: 'Resource 1', userId: 5 },
      { id: 41, projectId: 1, title: 'Resource 2', userId: 6 },
    ],
  };

  it('uses the new name instead of the exported name', () => {
    const result = transformExportToImport(baseExport, 'New Project Name');
    expect(result.name).toBe('New Project Name');
  });

  it('preserves title, emailConfig, areaId, hostStatus', () => {
    const result = transformExportToImport(baseExport, 'Test');
    expect(result.title).toBe('Test Title');
    expect(result.emailConfig).toEqual({ smtp: 'test' });
    expect(result.areaId).toBe(1);
    expect(result.hostStatus).toBe('live');
  });

  it('strips id and projectId, sets originalId on all entities', () => {
    const result = transformExportToImport(baseExport, 'Test');

    for (const widget of result.widgets) {
      expect(widget.id).toBeUndefined();
      expect(widget.projectId).toBeUndefined();
      expect(widget.originalId).toBeDefined();
    }
    expect(result.widgets[0].originalId).toBe(10);
    expect(result.widgets[1].originalId).toBe(11);

    for (const tag of result.tags) {
      expect(tag.id).toBeUndefined();
      expect(tag.projectId).toBeUndefined();
      expect(tag.originalId).toBeDefined();
    }
    expect(result.tags[0].originalId).toBe(20);

    for (const status of result.statuses) {
      expect(status.id).toBeUndefined();
      expect(status.projectId).toBeUndefined();
      expect(status.originalId).toBeDefined();
    }

    for (const resource of result.resources) {
      expect(resource.id).toBeUndefined();
      expect(resource.projectId).toBeUndefined();
      expect(resource.originalId).toBeDefined();
    }
  });

  it('filters out items with deletedAt', () => {
    const exportWithDeleted: ExportData = {
      ...baseExport,
      widgets: [
        { id: 10, projectId: 1, type: 'active', config: {} },
        {
          id: 11,
          projectId: 1,
          type: 'deleted',
          config: {},
          deletedAt: '2024-01-01',
        },
      ],
      tags: [
        { id: 20, projectId: 1, name: 'Active Tag' },
        { id: 21, projectId: 1, name: 'Deleted Tag', deletedAt: '2024-01-01' },
      ],
    };
    const result = transformExportToImport(exportWithDeleted, 'Test');
    expect(result.widgets).toHaveLength(1);
    expect(result.widgets[0].type).toBe('active');
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].name).toBe('Active Tag');
  });

  it('removes uniqueId from config', () => {
    const exportWithUniqueId: ExportData = {
      ...baseExport,
      config: { uniqueId: 'abc-123', project: {} },
    };
    const result = transformExportToImport(exportWithUniqueId, 'Test');
    expect(result.config.uniqueId).toBeUndefined();
    expect(result.config.project).toBeDefined();
  });

  it('relaxes resource validation when resources exist', () => {
    const result = transformExportToImport(baseExport, 'Test');
    expect(result.config.resources.canAddNewResources).toBe(true);
    expect(result.config.resources.titleMaxLength).toBe(10000);
    expect(result.config.resources.titleMinLength).toBe(1);
    expect(result.config.resources.summaryMaxLength).toBe(10000);
    expect(result.config.resources.summaryMinLength).toBe(1);
    expect(result.config.resources.descriptionMaxLength).toBe(10000);
    expect(result.config.resources.descriptionMinLength).toBe(1);
  });

  it('does not relax validation when there are no resources', () => {
    const noResources: ExportData = {
      ...baseExport,
      resources: [],
    };
    const result = transformExportToImport(noResources, 'Test');
    expect(result.config.resources?.canAddNewResources).toBeUndefined();
  });

  it('sets skipDefaultStatuses to true', () => {
    const result = transformExportToImport(baseExport, 'Test');
    expect(result.skipDefaultStatuses).toBe(true);
  });

  it('handles missing widgets array (old export format)', () => {
    const oldExport: ExportData = {
      ...baseExport,
      widgets: undefined,
    };
    const result = transformExportToImport(oldExport, 'Test');
    expect(result.widgets).toEqual([]);
  });

  it('handles completely empty export', () => {
    const emptyExport: ExportData = {
      name: 'Empty',
    };
    const result = transformExportToImport(emptyExport, 'New Empty');
    expect(result.name).toBe('New Empty');
    expect(result.widgets).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(result.statuses).toEqual([]);
    expect(result.resources).toEqual([]);
    expect(result.skipDefaultStatuses).toBe(true);
  });

  it('stores original resourceSettings before relaxing validation', () => {
    const exportWithResourceConfig: ExportData = {
      ...baseExport,
      config: {
        resources: {
          canAddNewResources: false,
          titleMaxLength: 50,
          titleMinLength: 10,
        },
      },
    };
    const result = transformExportToImport(exportWithResourceConfig, 'Test');
    expect(result.resourceSettings).toEqual({
      canAddNewResources: false,
      titleMaxLength: 50,
      titleMinLength: 10,
    });
  });

  it('filters out null items from entities', () => {
    const exportWithNulls: ExportData = {
      ...baseExport,
      tags: [null as any, { id: 20, projectId: 1, name: 'Valid Tag' }],
    };
    const result = transformExportToImport(exportWithNulls, 'Test');
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].name).toBe('Valid Tag');
  });
});
