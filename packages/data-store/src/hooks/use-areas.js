export default function useAreas({ ids } = {}) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    ids && ids.length > 0 ? { ids } : null,
    'areas.fetch'
  );

  let areas = data || [];
  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: areas, error, isLoading };
}
