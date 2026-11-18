export default function useResourceLinks({ projectId, resourceId }) {
  let self = this;
  const { data, error, isLoading, mutate } = self.useSWR(
    projectId && resourceId ? { projectId, resourceId } : null,
    'links.fetchLinks'
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
    refresh: mutate,
  };
}
