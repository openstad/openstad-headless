export default function useComments(props) {
  let self = this;
  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const sentiment = props.sentiment || null;
  const onlyIncludeTagIds = props.onlyIncludeTagIds || null;
  const search = props.search || '';
  const page = props.page ?? null;
  const pageSize = props.pageSize ?? null;
  const sort = props.sort || null;
  const noPagination = props.noPagination || false;
  const refreshKey = props.refreshKey || null;
  const commentsCacheKey = {
    projectId,
    resourceId,
    sentiment,
    onlyIncludeTagIds,
    search,
    page,
    pageSize,
    sort,
    noPagination,
    refreshKey,
  };

  let dataToReturn = [];
  let metadataToReturn = undefined;
  let errorToReturn = undefined;
  let isLoadingToReturn = false;

  if (resourceId && resourceId !== '0') {
    const { data, error, isLoading } = self.useSWR(
      commentsCacheKey,
      'comments.fetch'
    );

    if (data && Array.isArray(data.records) && data.metadata !== undefined) {
      dataToReturn = data.records;
      metadataToReturn = data.metadata;
    } else {
      dataToReturn = data;
    }
    errorToReturn = error;
    isLoadingToReturn = isLoading;
  }

  // add functionality
  let comments = dataToReturn || [];
  comments.create = function (newData) {
    return self.mutate(commentsCacheKey, 'comments.create', newData, {
      action: 'create',
    });
  };
  comments.map(async (comment) => {
    comment.update = function (newData) {
      return self.mutate(commentsCacheKey, 'comments.update', newData, {
        action: 'update',
      });
    };
    comment.delete = function (newData) {
      return self.mutate(commentsCacheKey, 'comments.delete', comment, {
        action: 'delete',
      });
    };
    comment.submitLike = function () {
      return self.mutate(commentsCacheKey, 'comments.submitLike', comment, {
        action: 'update',
      });
    };
    comment.submitDislike = function () {
      return self.mutate(commentsCacheKey, 'comments.submitDislike', comment, {
        action: 'update',
      });
    };
    comment.replies?.map(async (reply) => {
      reply.update = function (newData) {
        return self.mutate(commentsCacheKey, 'comments.update', newData, {
          action: 'update',
        });
      };
      reply.delete = function (newData) {
        return self.mutate(commentsCacheKey, 'comments.delete', reply, {
          action: 'delete',
        });
      };
      reply.submitLike = function () {
        return self.mutate(commentsCacheKey, 'comments.submitLike', reply, {
          action: 'update',
        });
      };
      reply.submitDislike = function () {
        return self.mutate(commentsCacheKey, 'comments.submitDislike', reply, {
          action: 'update',
        });
      };
    });
  });

  return {
    data: comments,
    metadata: metadataToReturn,
    error: errorToReturn,
    isLoading: isLoadingToReturn,
  };
}
