import { useState } from 'react';

export default function useComments(props) {
  let self = this;

  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const sentiment = props.sentiment || null;

  const { data, error, isLoading } = self.useSWR(
    { projectId, resourceId, sentiment },
    'comments.fetch'
  );

  // add functionality
  let comments = data || [];
  
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

  return [comments, error, isLoading];
}
