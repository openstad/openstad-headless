import { useState } from 'react';

export default function useResource(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const resourceId = props.resourceId || props.config.resourceId;
  const { data, error, isLoading } = self.useSWR({ projectId, resourceId }, 'resource.fetch');

  // add functionality
  let resource = data || {};
    resource.update = function(newData) {
      self.mutate({ projectId, resourceId }, 'resource.update', newData, { action: 'update' });
    }
    resource.delete = function(newData) {
      self.mutate({ projectId, resourceId }, 'resource.delete', resource, { action: 'delete' });
    }
    resource.submitLike = function(vote) {
      self.mutate({ projectId, resourceId }, 'resource.submitLike', vote, { action: 'submitLike', revalidate: true });
    }

  return [ resource, error, isLoading ];

}

