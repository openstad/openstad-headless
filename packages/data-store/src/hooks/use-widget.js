export default function useWidget({ projectId, widgetId }) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    { projectId, widgetId },
    'widget.fetch'
  );

  let widget = data || [];

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: widget, error, isLoading };
}
