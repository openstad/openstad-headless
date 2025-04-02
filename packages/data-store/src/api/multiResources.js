export default {
  fetch: async function (
    { projectIds, page, pageSize, search, tags, sort, statuses },
    options
  ) {
    const params = new URLSearchParams();

    if (Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag) => params.append('tags', tag));
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      statuses.forEach((status) => params.append('statuses', status));
    }

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      projectIds.forEach((projectId) => params.append('projectIds', projectId));
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

    let url = `/api/project/multi-resource?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&includeCommentsCount=1&${params.toString()}`;

    return this.fetch(url, options);
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
