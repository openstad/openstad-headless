export default {
  fetch: async function ({ projectId, resourceId }) {
    let url = `/stats/project/${projectId}/vote/no-of-users`;
    if (resourceId) url += `?resourceId=${encodeURIComponent(resourceId)}`;
    const data = await this.fetch(url);

    // Extract the count from the response
    const count = data?.count || 0;

    return { count };
  },
};
