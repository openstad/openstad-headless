import useSWR from 'swr';

export default function useMarkers({ projectId }) {
  let self = this;

  const shouldFetch = !!projectId;

  const { data, error, isLoading } = useSWR(
    shouldFetch ? { type: 'markers', projectId } : null,
    shouldFetch ? () => self.api.markers.fetch({ projectId }) : null
  );

  let markers = data || [];

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: error,
    });
    document.dispatchEvent(event);
  }

  return { data: markers, error, isLoading };
}
