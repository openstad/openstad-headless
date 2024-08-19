export default {
  fetch: async function (
    { projectId, page, pageSize, search, tags, sort, statuses },
    options
  ) {
    const params = new URLSearchParams();

    if (Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag) => params.append('tags', tag));
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      statuses.forEach((status) => params.append('statuses', status));
    }

    if (search) {
      params.append('search[text]', search);
    }

    if (sort) {
      if (!Array.isArray(sort)) sort = [sort];
      sort.map((criterium) => params.append('sort', criterium));
    }

    if (page >= 0 && pageSize) {
      params.append('page', page);
      params.append('pageSize', pageSize);
    } else if (pageSize >= 0) {
      params.append('page', 0);
      params.append('pageSize', pageSize);
    }

    let url = `/api/project/${projectId}/resource?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&includeCommentsCount=1&${params.toString()}`;
    return this.fetch(url, options);
  },

  delete: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${data.id}`;
    let method = 'delete';
    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },

  create: async function ({ projectId, widgetId }, data) {
    delete data.id;

    let url = `/api/project/${projectId}/resource`;
    let method = 'POST';

    if (widgetId) {
      data.widgetId = widgetId;
    }

    let body = JSON.stringify(data);

    return await this.fetch(url, {method, body});
  },

  submitLike: async function ({ projectId }, resources) {
    if (!Array.isArray(resources)) throw new Error('Resources is geen array');
    if(resources.some(r => !'resourceId' in r || !'opinion' in r)) throw new Error("Ontbrekende velden resourceId of opinion");

    let url = `/api/project/${projectId}/vote`;
    let headers = {
      'Content-Type': 'application/json',
    };

    let json = await this.fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify(resources),
    });

    return json;
  },
};
