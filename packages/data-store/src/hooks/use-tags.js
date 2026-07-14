export default function useTags(props) {
  let self = this;
  const projectId = props.projectId;
  const type = props.type;
  const onlyIncludeIds = props.onlyIncludeIds;
  // Callers can opt out of fetching (e.g. when a feature that needs tags is
  // turned off) without breaking the rules of hooks. Defaults to enabled for
  // backward compatibility.
  const enabled = props.enabled !== false;
  const resolvedProjectId = projectId || self.projectId;

  const { data, error, isLoading } = self.useSWR(
    enabled && resolvedProjectId
      ? { projectId: resolvedProjectId, type, onlyIncludeIds }
      : null,
    'tags.fetch'
  );

  // add functionality
  let tags = data || [];
  tags.create = function (newData) {
    return self.mutate({ projectId, type }, 'tags.create', newData, {
      action: 'create',
    });
  };
  tags.map(async (tag) => {
    tag.update = function (newData) {
      return self.mutate({ projectId, type }, 'tags.update', newData, {
        action: 'update',
      });
    };
    tag.delete = function (newData) {
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
    let event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: tags, error, isLoading };
}
