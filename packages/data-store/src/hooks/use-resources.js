import { useState } from 'react';

export default function useResources(props) {
  let self = this;

  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const sentiment = props.sentiment;

  const { data, error, isLoading } = self.useSWR(
    { projectId },
    'resources.fetch'
  );


  // add functionality
  let resources = data || [];
  resources.create = function (newData) {
    return self.mutate({ projectId }, 'resources.create', newData, {
      action: 'create',
    });
  };
  resources.filter = function (filter) {
    return self.mutate({ projectId }, 'resources.fetch', null, {
      action: 'fetch',
      filter,
    });
  };
  resources.map(async (resource) => {
    resource.update = function (newData) {
      return self.mutate({ projectId }, 'resources.update', newData, {
        action: 'update',
      });
    };
    resource.delete = function (newData) {
      return self.mutate({ projectId }, 'resources.delete', resource, {
        action: 'delete',
      });
    };
    resource.submitLike = function () {
      return self.mutate({ projectId }, 'resources.submitLike', resource, {
        action: 'update',
      });
    };
  });

  return [resources, error, isLoading];
}
