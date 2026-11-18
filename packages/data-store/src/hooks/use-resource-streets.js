export default function useResourceStreets({
  projectId,
  excludeTags = [],
  statuses = [],
  excludeStatuses = [],
  tagGroups = [],
  enabled = false,
}) {
  let self = this;
  const { data, error, isLoading } = self.useSWR(
    enabled
      ? {
          projectId: projectId || self.projectId,
          excludeTags,
          statuses,
          excludeStatuses,
          tagGroups,
        }
      : null,
    'resourceStreets.fetch'
  );

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return {
    data: Array.isArray(data) ? data : [],
    error,
    isLoading,
  };
}
