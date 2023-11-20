import { useState } from 'react';

export default function useIdeas(props) {
  let self = this;

  const projectId = props.projectId || props.config?.projectId;
  const ideaId = props.ideaId || props.config?.ideaId;
  const sentiment = props.sentiment || props.config?.sentiment || null;

  const { data, error, isLoading } = self.useSWR({ projectId }, 'ideas.fetch');

  // add functionality
  let ideas = data || [];
  ideas.create = function (newData) {
    return self.mutate({ projectId }, 'ideas.create', newData, {
      action: 'create',
    });
  };
  ideas.filter = function (filter) {
    return self.mutate({ projectId }, 'ideas.fetch', null, {
      action: 'fetch',
      filter,
    });
  };
  ideas.map(async (idea) => {
    idea.update = function (newData) {
      return self.mutate({ projectId }, 'ideas.update', newData, {
        action: 'update',
      });
    };
    idea.delete = function (newData) {
      return self.mutate({ projectId }, 'ideas.delete', idea, {
        action: 'delete',
      });
    };
    idea.submitLike = function () {
      return self.mutate({ projectId }, 'ideas.submitLike', idea, {
        action: 'update',
      });
    };
  });

  return [ideas, error, isLoading];
}
