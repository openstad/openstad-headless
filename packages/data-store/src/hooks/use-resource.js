export default function useResource(props) {
  let self = this;

  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const initialData = props.initialData;

  const { data, error, isLoading } = self.useSWR(
    initialData ? null : { projectId, resourceId },
    'resource.fetch'
  );

  let resource = initialData ? { ...initialData } : data || {};
  resource.update = function (newData) {
    return self.mutate({ projectId, resourceId }, 'resource.update', newData, {
      action: 'update',
    });
  };
  resource.delete = function () {
    self.mutate({ projectId, resourceId }, 'resource.delete', resource, {
      action: 'delete',
    });
  };
  resource.submitLike = function (vote) {
    self.mutate({ projectId, resourceId }, 'resource.submitLike', vote, {
      action: 'submitLike',
      revalidate: true,
      populateCache: false,
    });
  };

  return {
    data: resource,
    error,
    isLoading,
    canEdit: data?.can?.edit || false,
    canDelete: data?.can?.delete || false,
  };
}
