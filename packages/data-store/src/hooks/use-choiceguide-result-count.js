export default function useChoiceGuideResultCount({
  projectId,
  widgetId,
}) {
  let self = this;

  if (!widgetId) {
    return { data: 0, error: 'No widgetId given', isLoading: false };
  }

  try {
    const { data, error, isLoading } = self.useSWR(
      { projectId, widgetId },
      'choiceGuideResultCount.fetch'
    );

    if (error) {
      let newError = new Error(error);
      let event = new window.CustomEvent('osc-error', { detail: newError });
      document.dispatchEvent(event);
    }
    
    return { data: data?.count || 0, error, isLoading };
  } catch (e) {
    return {
      data: 0,
      error:
        'Er ging iets mis bij het ophalen van de resultaten, waarschijnlijk ontbreken er een aantal rechten',
      isLoading: false,
    };
  }
}
