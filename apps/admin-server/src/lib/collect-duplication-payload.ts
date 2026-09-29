// Builds the payload the api-server expects for a duplication-style project
// create (POST /api/project with isDuplicateRequest) — also used as the
// snapshot stored in a project template. The caller adds `name`, and for a
// direct duplication also `sourceProjectId` + `isDuplicateRequest`.
import type {
  ApiNotificationTemplate,
  ApiProject,
  ApiResource,
  ApiStatus,
  ApiTag,
  ApiWidget,
  DynamicJson,
} from '@openstad-headless/types';

// List item as sent for duplication: `id` moves to `originalId` and
// `projectId` is dropped.
type DuplicatedItem<T extends { id: number }> = Omit<T, 'id' | 'projectId'> & {
  originalId: T['id'];
};

export type DuplicationPayload = {
  areaId?: number | null;
  config: DynamicJson;
  emailConfig: DynamicJson;
  hostStatus: DynamicJson;
  title: string | null;
  widgets: DuplicatedItem<ApiWidget>[];
  tags: DuplicatedItem<ApiTag>[];
  statuses: DuplicatedItem<ApiStatus>[];
  resources: DuplicatedItem<ApiResource>[];
  notificationTemplates: DuplicatedItem<ApiNotificationTemplate>[];
  // `false` until filled with the project's resource settings.
  resourceSettings: DynamicJson | false;
  skipDefaultStatuses: boolean;
};

async function fetchList<T extends { id: number }>(
  url: string
): Promise<DuplicatedItem<T>[]> {
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
  projectData?: ApiProject
): Promise<DuplicationPayload> {
  let data: ApiProject | undefined = projectData;

  if (!data) {
    const response = await fetch(
      `/api/openstad/api/project/${projectId}?includeConfig=1&includeEmailConfig=1&includeAuthConfig=1`
    );
    if (!response.ok) {
      throw new Error('Kon het project niet ophalen');
    }
    const fetched: ApiProject = await response.json();
    data = fetched;
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

  payload.widgets = await fetchList<ApiWidget>(
    `/api/openstad/api/project/${projectId}/widgets`
  );
  payload.tags = await fetchList<ApiTag>(
    `/api/openstad/api/project/${projectId}/tag`
  );
  payload.statuses = await fetchList<ApiStatus>(
    `/api/openstad/api/project/${projectId}/status`
  );
  payload.resources = await fetchList<ApiResource>(
    `/api/openstad/api/project/${projectId}/resource?includeTags=1&includeStatus=1`
  );
  payload.notificationTemplates = await fetchList<ApiNotificationTemplate>(
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
