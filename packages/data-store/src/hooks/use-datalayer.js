export default function useDatalayer({ projectId, datalayerId }) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    { projectId },
    'datalayer.fetch'
  );

  let datalayer = data || [];

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: datalayer, error, isLoading };
}
