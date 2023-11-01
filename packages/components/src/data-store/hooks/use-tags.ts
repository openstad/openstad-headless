import { useState } from 'react';
import { WidgetConfig } from '../../types/config';

export default function useTags(props: WidgetConfig) {
  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const type = props.type || props.config.type;

  const { data, error, isLoading } = self.useSWR(
    { projectId, type },
    'tags.fetch'
  );

  // add functionality
  let tags = data || [];
  tags.create = function (newData: any) {
    return self.mutate({ projectId, type }, 'tags.create', newData, {
      action: 'create',
    });
  };
  tags.map(async (tag: any) => {
    tag.update = function (newData: any) {
      return self.mutate({ projectId, type }, 'tags.update', newData, {
        action: 'update',
      });
    };
    tag.delete = function (newData: any) {
      return self.mutate({ projectId, type }, 'tags.delete', tag, {
        action: 'delete',
      });
    };
    tag.submitLike = function () {
      return self.mutate({ projectId, type }, 'tags.submitLike', tag, {
        action: 'update',
      });
    };
  });

  if (error) {
    const tagsError = new Error(error);
    let event = new window.CustomEvent('osc-error', { detail: tagsError });
    document.dispatchEvent(event);
  }

  return [tags, error, isLoading];
}
