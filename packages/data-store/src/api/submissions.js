export default {
  
  fetch: async function({ projectId }) {

    let url = `/api/project/${projectId}/submission`;
    return this.fetch(url);

  }
}