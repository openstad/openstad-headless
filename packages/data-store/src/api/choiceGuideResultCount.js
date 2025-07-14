export default {
  fetch: async function({ projectId, widgetId }) {
  
    let url = `/api/project/${projectId}/choicesguide/widgets/${widgetId}/count`;
    return this.fetch(url);
  
  }
}
