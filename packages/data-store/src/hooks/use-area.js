export default function useArea({ areaId }) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    areaId ? { areaId } : null,
    'area.fetch'
  );

  let area = data || null;

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: area, error, isLoading };
}
