export default {
  fetch: async function({ projectId, userId }) {

    let url = `/api/project/${projectId}/user/${userId}/activity?includeOtherProjects=1`;
    let headers = {
      'Content-Type': 'application/json'
    };

    return this.fetch(url, { headers });
  },
}