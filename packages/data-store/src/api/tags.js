export default {
  fetch: async function ({ projectId, type, onlyIncludeIds = [] }) {
    const params = new URLSearchParams();
    if (onlyIncludeIds.length > 0) {
      onlyIncludeIds.forEach((tagId) => params.append('tags', tagId));
    }

    const projectNumber = type === "global" ? 0 : projectId;

    let url = `/api/project/${projectNumber}/tag?type=${type}&${params.toString()}`;
    return this.fetch(url);
  },

  create: async function ({ projectId, type }, data) {
    const projectNumber = type === "global" ? 0 : projectId;
    let url = `/api/project/${projectNumber}/tag`;
    let method = 'post';
    delete data.id;
    let body = JSON.stringify(data);
    let newData = await this.fetch(url, { method, body });
    return newData;
  },

  update: async function ({ projectId, type }, data) {
    const projectNumber = type === "global" ? 0 : projectId;
    let url = `/api/project/${projectNumber}/tag/${data.id}`;
    let method = 'put';
    let body = JSON.stringify(data);
    let newData = await this.fetch(url, { method, body });
    return newData;
  },

  delete: async function ({ projectId, type }, data) {
    const projectNumber = type === "global" ? 0 : projectId;
    let url = `/api/project/${projectNumber}/tag/${data.id}`;
    let method = 'delete';
    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },
};
