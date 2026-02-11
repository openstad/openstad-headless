export default {
  fetch: async function({ projectId }) {
    let url = `/stats/project/${projectId}/vote/no-of-users`;
    const data = await this.fetch(url);

    // Extract the count from the response
    const count = data?.count || 0;

    return { count };
  }
}