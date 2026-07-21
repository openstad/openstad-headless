export default function useWidgets({ projectId } = {}) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    projectId ? { projectId } : null,
    'widgets.fetch'
  );

  let widgets = data || [];

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: widgets, error, isLoading };
}
