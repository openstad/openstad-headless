export default {
  fetch: async function ({ projectId }) {
    let url = `/api/project/${projectId}/status`;
    return this.fetch(url);
  },
};
