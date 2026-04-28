export default {
  fetch: async function ({ projectId }) {
    let url = `/api/project/${projectId}/markers`;
    return this.fetch(url);
  },
};
