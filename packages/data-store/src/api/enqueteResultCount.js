export default {
  fetch: async function ({ projectId, widgetToFetchId }) {
    let url = `/api/project/${projectId}/submission/widgets/${widgetToFetchId}/count`;
    return this.fetch(url);
  },
};
