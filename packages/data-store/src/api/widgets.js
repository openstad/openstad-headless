export default {
  fetch: async function ({ projectId }) {
    let url = `/api/project/${projectId}/widgets`;
    return this.fetch(url);
  },
};
