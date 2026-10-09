// Builds the payload the api-server expects for a duplication-style project
// create (POST /api/project with isDuplicateRequest) — also used as the
// snapshot stored in a project template. The caller adds `name`, and for a
// direct duplication also `sourceProjectId` + `isDuplicateRequest`.

export type DuplicationPayload = {
  areaId?: number;
  config: any;
  emailConfig: any;
  hostStatus: any;
  title: string;
  widgets: any[];
  tags: any[];
  statuses: any[];
  resources: any[];
  notificationTemplates: any[];
  resourceSettings: any;
  skipDefaultStatuses: boolean;
};

async function fetchList(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (item.deletedAt) {
        return null;
      }
      delete item.projectId;
      item.originalId = item.id;
      delete item.id;
      return item;
    })
    .filter(Boolean);
}

export async function collectDuplicationPayload(
  projectId: number | string,
  projectData?: any
): Promise<DuplicationPayload> {
  let data = projectData;

  if (!data) {
    const response = await fetch(
      `/api/openstad/api/project/${projectId}?includeConfig=1&includeEmailConfig=1&includeAuthConfig=1`
    );
    if (!response.ok) {
      throw new Error('Kon het project niet ophalen');
    }
    data = await response.json();
  }

  const payload: DuplicationPayload = {
    areaId: data.areaId,
    config: data.config || {},
    emailConfig: data.emailConfig,
    hostStatus: data.hostStatus,
    title: data.title,
    widgets: [],
    tags: [],
    statuses: [],
    resources: [],
    notificationTemplates: [],
    resourceSettings: false,
    skipDefaultStatuses: true,
  };

  if (payload.config && payload.config.uniqueId) {
    delete payload.config.uniqueId;
  }

  payload.widgets = await fetchList(
    `/api/openstad/api/project/${projectId}/widgets`
  );
  payload.tags = await fetchList(`/api/openstad/api/project/${projectId}/tag`);
  payload.statuses = await fetchList(
    `/api/openstad/api/project/${projectId}/status`
  );
  payload.resources = await fetchList(
    `/api/openstad/api/project/${projectId}/resource?includeTags=1&includeStatus=1`
  );
  payload.notificationTemplates = await fetchList(
    `/api/openstad/notification/project/${projectId}/template`
  );

  payload.resourceSettings = payload?.config?.resources || {};

  if (Array.isArray(payload.resources) && payload.resources.length > 0) {
    // Set the canAddNewResources to true to prevent the API from returning an error
    payload.config = payload.config || {};
    payload.config.resources = payload.config.resources || {};
    payload.config.resources.canAddNewResources = true;

    // Set min and max for title, description and summary to prevent the API from returning an error
    payload.config.resources.titleMaxLength = 10000;
    payload.config.resources.titleMinLength = 1;
    payload.config.resources.summaryMaxLength = 10000;
    payload.config.resources.summaryMinLength = 1;
    payload.config.resources.descriptionMaxLength = 10000;
    payload.config.resources.descriptionMinLength = 1;
  }

  return payload;
}
