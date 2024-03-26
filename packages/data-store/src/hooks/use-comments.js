export default function useComments(props) {
  let self = this;

  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const sentiment = props.sentiment || null;

  let dataToReturn = [];
  let errorToReturn = undefined;
  let isLoadingToReturn = false;

  if (resourceId) {
    const { data, error, isLoading } = self.useSWR(
      { projectId, resourceId, sentiment },
      'comments.fetch'
    );

    console.log(error);

    dataToReturn = data;
    errorToReturn = error;
    isLoadingToReturn = isLoading;
  }

  // add functionality
  let comments = dataToReturn || [];
console.log({dataToReturn})
  comments.create = function (newData) {
    return self.mutate(
      { projectId, resourceId, sentiment },
      'comments.create',
      newData,
      { action: 'create' }
    );
  };
  comments.map(async (comment) => {
    comment.update = function (newData) {
      return self.mutate(
        { projectId, resourceId, sentiment },
        'comments.update',
        newData,
        { action: 'update' }
      );
    };
    comment.delete = function (newData) {
      return self.mutate(
        { projectId, resourceId, sentiment },
        'comments.delete',
        comment,
        { action: 'delete' }
      );
    };
    comment.submitLike = function () {
      return self.mutate(
        { projectId, resourceId, sentiment },
        'comments.submitLike',
        comment,
        { action: 'update' }
      );
    };
    comment.replies?.map(async (reply) => {
      reply.update = function (newData) {
        return self.mutate(
          { projectId, resourceId, sentiment },
          'comments.update',
          newData,
          { action: 'update' }
        );
      };
      reply.delete = function (newData) {
        return self.mutate(
          { projectId, resourceId, sentiment },
          'comments.delete',
          reply,
          { action: 'delete' }
        );
      };
      reply.submitLike = function () {
        return self.mutate(
          { projectId, resourceId, sentiment },
          'comments.submitLike',
          reply,
          { action: 'update' }
        );
      };
    });
  });

  return {
    data: comments,
    error: errorToReturn,
    isLoading: isLoadingToReturn,
  };
}
