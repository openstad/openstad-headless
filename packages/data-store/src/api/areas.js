export default {
  fetch: async function ({ ids } = {}) {
    let url = `/api/area`;
    if (ids && ids.length > 0) {
      url += `?ids=${ids.join(',')}`;
    }
    return this.fetch(url);
  },
};
