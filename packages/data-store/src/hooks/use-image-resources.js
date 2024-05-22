export default function useImageResources({
                                       projectId,
                                       page = 0,
                                       pageSize = 20,
                                       search = '',
                                       tags = [],
                                       sort = 'createdAt_desc',
                                     }) {
  let self = this;

  if (!projectId) {
    const data = {
      metadata: {
        page: 0,
        pageSize: 0,
        pageCount: 1,
        totalCount: 0,
      },
      records: [],
    };

    return { data, error: 'No projectId given', isLoading: false };
  }

  // If you add a prop here, the also do it for filter
  const { data, error, isLoading } = self.useSWR(
    { projectId, page, pageSize, search, tags, sort },
    'imageResources.fetch'
  );

  // add functionality
  let imageResources = data || [];

  // Resource where probably called without page and itemsPerPage
  if (Array.isArray(imageResources)) {
    imageResources = {
      metadata: {
        page: 0,
        pageSize: imageResources.length,
        pageCount: 1,
        totalCount: imageResources.length,
      },
      records: imageResources,
    };
  }

  const create = function (submittedData, widgetId) {
    return self.mutate(
      { projectId },
      'imageResources.create',
      { submittedData, widgetId },
      {
        action: 'create',
      }
    );
  };

  const submitVotes = function (imageResourcesToLike) {
    return self.mutate({ projectId }, 'imageResources.submitLike', imageResourcesToLike, {
      action: 'update',
    });
  };

  imageResources.records.create = function (newData) {
    return self.mutate({ projectId }, 'imageResources.create', newData, {
      action: 'create',
    });
  };

  imageResources.records.forEach(async (resource) => {
    resource.update = function (newData) {
      return self.mutate({ projectId }, 'imageResources.update', newData, {
        action: 'update',
      });
    };
    resource.delete = function () {
      return self.mutate({ projectId }, 'imageResources.delete', resource, {
        action: 'delete',
      });
    };
  });
  return {data :imageResources, error, isLoading, submitVotes, create};
}
