export default {
  fetch: async function ({ areaId }) {
    let url = `/api/area/${areaId}`;
    return this.fetch(url);
  },
};
