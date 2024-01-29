export default {
  fetch: async function({ projectId, sentiment }) {

    let url = `/api/project/${projectId}/comment?sentiment=${sentiment}`;
    return this.fetch(url);

  },
}