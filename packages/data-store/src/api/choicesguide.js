export default {
  fetch: async function ({ projectId }) {
    return [];
  },

  create: async function ({ projectId }, data) {
    delete data.id;

    const url = `/api/project/${projectId}/choicesguide`;
    const method = 'POST';

    const body = JSON.stringify(data);

    return await this.fetch(url, { method, body });
  },
};