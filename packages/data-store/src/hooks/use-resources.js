export default function useResources(
  {
    projectId,
    page = 0,
    pageSize = 20,
    search = '',
    tags = [],
    excludeTags = [],
    sort = undefined,
    statuses = [],
    excludeStatuses = [],
    tagGroups = [],
    lat = undefined,
    lng = undefined,
    maxDistance = undefined,
    projectIds = [],
    allowMultipleProjects = false,
    fetchAll = false,
  },
  options
) {
  let self = this;

  const emptyResult = {
    metadata: {
      page: 0,
      pageSize: 0,
      pageCount: 1,
      totalCount: 0,
    },
    records: [],
  };

  if (!projectId) {
    return {
      data: emptyResult,
      allData: null,
      error: 'No projectId given',
      isLoading: false,
    };
  }

  // Shared filter params used by both the paginated and all-resources calls
  const filterParams = {
    projectId,
    search,
    tags,
    excludeTags,
    sort,
    statuses,
    excludeStatuses,
    tagGroups,
    lat,
    lng,
    maxDistance,
    projectIds,
    allowMultipleProjects,
  };

  // Primary paginated call
  const { data, error, isLoading } = self.useSWR(
    { ...filterParams, page, pageSize },
    'resources.fetch',
    options
  );

  // Secondary all-resources call (only when fetchAll is true)
  const { data: allDataRaw, isLoading: allIsLoading } = self.useSWR(
    fetchAll ? { ...filterParams, noPagination: true } : null,
    'resources.fetch',
    options
  );

  function normalizeResources(rawData) {
    let resources = rawData || [];
    if (Array.isArray(resources)) {
      resources = {
        metadata: {
          page: 0,
          pageSize: resources.length,
          pageCount: 1,
          totalCount: resources.length,
        },
        records: resources,
      };
    }
    return resources;
  }

  let resources = normalizeResources(data);
  let allResources = allDataRaw ? normalizeResources(allDataRaw) : null;

  const create = function (submittedData, widgetId) {
    return self.mutate(
      { projectId },
      'resources.create',
      { submittedData, widgetId },
      {
        action: 'create',
      }
    );
  };

  const submitVotes = function (resourcesToLike) {
    return self.mutate({ projectId }, 'resources.submitLike', resourcesToLike, {
      action: 'update',
    });
  };

  if (resources.records) {
    resources.records.create = function (newData) {
      return self.mutate({ projectId }, 'resources.create', newData, {
        action: 'create',
      });
    };

    resources.records.forEach(async (resource) => {
      resource.update = function (newData) {
        return self.mutate({ projectId }, 'resources.update', newData, {
          action: 'update',
        });
      };
      resource.delete = function () {
        return self.mutate({ projectId }, 'resources.delete', resource, {
          action: 'delete',
        });
      };
    });
  }

  return {
    data: resources,
    allData: allResources, // Read-only: no mutate methods (create/update/delete). Used for maps and callbacks.

    error,
    isLoading: isLoading || (fetchAll && allIsLoading),
    submitVotes,
    create,
  };
}
