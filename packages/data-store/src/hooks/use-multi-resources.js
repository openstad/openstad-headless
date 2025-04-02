export default function useMultiResources(
  {
    projectIds = [],
    page = 0,
    pageSize = 20,
    search = '',
    tags = [],
    sort = 'random',
    statuses = []
  },
  options
) {
  let self = this;

  console.log( 'useMultiResources' );
  console.log( 'projectIds', projectIds );

  if (!projectIds || projectIds.length === 0) {
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

  const { data, error, isLoading } = self.useSWR(
    { projectIds, page, pageSize, search, tags, sort, statuses },
    'multiResources.fetch',
    options
  );

  console.log( 'data', data );

  // add functionality
  let resources = data || [];

  // Resource where probably called without page and itemsPerPage
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

  const submitVotes = function (resourcesToLike) {
    return self.mutate({ projectId }, 'multiResources.submitLike', resourcesToLike, {
      action: 'update',
    });
  };

  return { data: resources, error, isLoading, submitVotes };
}