export default {
  fetch: async function ({ projectId, resourceId, sentiment, type }) {
    const resourceType = type === 'image-resource' ? 'image-resource' : 'resource';

    let url = `/api/project/${projectId}/${resourceType}/${resourceId}/comment?sentiment=${sentiment}&includeUser=1&includeUserVote=1&includeVoteCount=1&includeRepliesOnComments=1`;

    if (!projectId || !resourceId) {
      throw new Error(`No ${projectId ? 'projectId' : 'resourceId'} given`);
    }
    return this.fetch(url);
  },

  create: async function ({ projectId, resourceId, type }, data) {
    const resourceType = type === 'image-resource' ? 'image-resource' : 'resource';

    let url = `/api/project/${projectId}/${resourceType}/${resourceId}/comment`;
    let method = 'post';
    delete data.id;
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body });
    return newData;
  },

  update: async function ({ projectId, resourceId, type }, data) {
    const resourceType = type === 'image-resource' ? 'image-resource' : 'resource';

    let url = `/api/project/${projectId}/${resourceType}/${resourceId}/comment/${data.id}`;
    let method = 'put';
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body });
    return newData;
  },

  delete: async function ({ projectId, resourceId, type }, data) {
    const resourceType = type === 'image-resource' ? 'image-resource' : 'resource';

    let url = `/api/project/${projectId}/${resourceType}/${resourceId}/comment/${data.id}`;
    let method = 'delete';

    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },

  submitLike: async function ({ projectId, resourceId, type }, data) {
    const resourceType = type === 'image-resource' ? 'image-resource' : 'resource';

    let url = `/api/project/${projectId}/${resourceType}/${resourceId}/comment/${data.id}/vote`;
    let method = 'post';
    let body = JSON.stringify({});

    let newData = await this.fetch(url, { method });
    return newData;
  },
};
