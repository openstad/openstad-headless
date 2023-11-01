import { useState } from 'react';
import { WidgetConfig } from '../../types/config';

export default function useIdea(props: WidgetConfig & { ideaId?: number }) {
  let self = this;
  console.log({ self });
  const projectId = props.projectId || props.config.projectId;
  const ideaId = props.ideaId || props.config.ideaId;
  const { data, error, isLoading } = self.useSWR(
    { projectId, ideaId },
    'idea.fetch'
  );

  // add functionality
  let idea = data || {};
  idea.update = function (newData: any) {
    self.mutate({ projectId, ideaId }, 'idea.update', newData, {
      action: 'update',
    });
  };
  idea.delete = function (newData: any) {
    self.mutate({ projectId, ideaId }, 'idea.delete', idea, {
      action: 'delete',
    });
  };
  idea.submitLike = function (vote: any) {
    self.mutate({ projectId, ideaId }, 'idea.submitLike', vote, {
      action: 'submitLike',
      revalidate: true,
    });
  };

  return [idea, error, isLoading];
}
