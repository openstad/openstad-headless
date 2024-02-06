export default function useSubmissions({ projectId }) {
  let self = this;

  const { data, error, isLoading } = self.useSWR(
    { projectId },
    'submissions.fetch'
  );

  let submissions = data || [];

  if (error) {
    const event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  const create = function (submittedData, widgetId) {
    return self.mutate(
      { projectId },
      'submissions.create',
      { submittedData, widgetId },
      {
        action: 'create',
      }
    );
  };

  return { data: submissions, error, isLoading, create };
}
