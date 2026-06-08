export interface ExportData {
  id?: number;
  name: string;
  title?: string;
  config?: any;
  emailConfig?: any;
  areaId?: number;
  hostStatus?: any;
  resources?: any[];
  tags?: any[];
  statuses?: any[];
  widgets?: any[];
}

export interface ImportPayload {
  name: string;
  title?: string;
  config: any;
  emailConfig: any;
  areaId?: number;
  hostStatus?: any;
  widgets: any[];
  tags: any[];
  statuses: any[];
  resources: any[];
  resourceSettings: any;
  skipDefaultStatuses: boolean;
}

function transformEntities(items: any[] | undefined): any[] {
  return (items || [])
    .filter((item) => item && !item.deletedAt)
    .map((item) => {
      const transformed = { ...item };
      transformed.originalId = transformed.id;
      delete transformed.id;
      delete transformed.projectId;
      return transformed;
    });
}

export function transformExportToImport(
  exportData: ExportData,
  newName: string
): ImportPayload {
  const config = { ...(exportData.config || {}) };

  if (config.uniqueId) {
    delete config.uniqueId;
  }

  const resources = transformEntities(exportData.resources);
  const resourceSettings = JSON.parse(JSON.stringify(config?.resources || {}));

  if (resources.length > 0) {
    config.resources = config.resources || {};
    config.resources.canAddNewResources = true;
    config.resources.titleMaxLength = 10000;
    config.resources.titleMinLength = 1;
    config.resources.summaryMaxLength = 10000;
    config.resources.summaryMinLength = 1;
    config.resources.descriptionMaxLength = 10000;
    config.resources.descriptionMinLength = 1;
  }

  return {
    name: newName,
    title: exportData.title,
    config,
    emailConfig: exportData.emailConfig,
    areaId: exportData.areaId,
    hostStatus: exportData.hostStatus,
    widgets: transformEntities(exportData.widgets),
    tags: transformEntities(exportData.tags),
    statuses: transformEntities(exportData.statuses),
    resources,
    resourceSettings,
    skipDefaultStatuses: true,
  };
}
