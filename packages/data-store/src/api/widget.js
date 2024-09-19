export default {
  fetch: async function ({ projectId, widgetId }) {

    let url = `/api/project/${projectId}/widgets/${widgetId}`;
    return this.fetch(url);
  },
}