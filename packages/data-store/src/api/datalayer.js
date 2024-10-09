export default {
  fetch: async function ({ projectId }) {

    let url = `/api/project/${projectId}/datalayer`;
    return this.fetch(url);
  },
}