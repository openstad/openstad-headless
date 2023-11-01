import { useState } from 'react';
import { WidgetConfig } from '../../types/config';

export default function useIdeas(
  props: WidgetConfig & { ideaId?: number; sentiment?: string }
) {
  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const ideaId = props.ideaId || props.config.ideaId;
  const sentiment = props.sentiment || props.config.sentiment || null;

  const { data, error, isLoading } = self.useSWR({ projectId }, 'ideas.fetch');

  // add functionality
  let ideas = data || [];
  ideas.create = function (newData: any) {
    return self.mutate({ projectId }, 'ideas.create', newData, {
      action: 'create',
    });
  };
  ideas.filter = function (filter: any) {
    return self.mutate({ projectId }, 'ideas.fetch', null, {
      action: 'fetch',
      filter,
    });
  };
  ideas.map(async (idea: any) => {
    idea.update = function (newData: any) {
      return self.mutate({ projectId }, 'ideas.update', newData, {
        action: 'update',
      });
    };
    idea.delete = function (newData: any) {
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
