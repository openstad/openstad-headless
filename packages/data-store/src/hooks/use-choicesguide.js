export default function useChoicesguide({ projectId }) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    { projectId },
    'choicesguide.fetch'
  );

  let choiceguides = data || [];

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  const create = function (submittedData, widgetId) {
    return self.mutate(
      { projectId },
      'choicesguide.create',
      { submittedData, projectId, widgetId },
      {
        action: 'create',
      }
    );
  };

  return { data: choiceguides, error, isLoading, create };
}