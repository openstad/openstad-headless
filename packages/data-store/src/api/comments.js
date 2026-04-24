export default {
  fetch: async function ({
    projectId,
    resourceId,
    sentiment,
    onlyIncludeTagIds,
    search,
    page,
    pageSize,
    sort,
    noPagination,
  }) {
    let url = `/api/project/${projectId}/resource/${resourceId}/comment?includeUser=1&includeUserVote=1&includeVoteCount=1&includeRepliesOnComments=1`;

    if (sentiment) {
      url += `&sentiment=${encodeURIComponent(sentiment)}`;
    }

    onlyIncludeTagIds = onlyIncludeTagIds || '';
    url += `&onlyIncludeTagIds=${onlyIncludeTagIds}`;

    if (search) {
      url += `&search[text]=${encodeURIComponent(search)}`;
    }

    if (noPagination) {
      url += '&noPagination=true';
    } else if (page != null && pageSize) {
      url += `&page=${page}&pageSize=${pageSize}`;
    }

    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }

    if (!projectId || !resourceId) {
      throw new Error(`No ${projectId ? 'projectId' : 'resourceId'} given`);
    }
    return this.fetch(url);
  },

  create: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${resourceId}/comment`;
    let method = 'post';
    delete data.id;
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body });
    return newData;
  },

  update: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}`;
    let method = 'put';
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body });
    return newData;
  },

  delete: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}`;
    let method = 'delete';

    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },

  submitLike: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}/vote/yes`;
    let method = 'post';
    let body = JSON.stringify({});

    return await this.fetch(url, { method });
  },

  submitDislike: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}/vote/no`;
    let method = 'post';
    let body = JSON.stringify({});

    return await this.fetch(url, { method });
  },
};
