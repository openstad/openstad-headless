export default function useComments(props) {
  let self = this;
  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const sentiment = props.sentiment || null;
  const onlyIncludeTagIds = props.onlyIncludeTagIds || null;
  const search = props.search || '';
  const commentsCacheKey = {
    projectId,
    resourceId,
    sentiment,
    onlyIncludeTagIds,
    search,
  };

  let dataToReturn = [];
  let errorToReturn = undefined;
  let isLoadingToReturn = false;

  if (resourceId && resourceId !== '0') {
    const { data, error, isLoading } = self.useSWR(
      commentsCacheKey,
      'comments.fetch'
    );

    dataToReturn = data;
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
    error: errorToReturn,
    isLoading: isLoadingToReturn,
  };
}
