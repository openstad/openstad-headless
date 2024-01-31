export default {
  fetch: async function ({ projectId, pageSize}, data, options) {
    const params = new URLSearchParams();

    const tags = options?.filter?.tags;
    if (tags) {
      for (let type in tags) {
        const tagValues = tags[type];
        if (tagValues)
          if (Array.isArray(tagValues)) {
            tagValues.forEach((tag) => {
              params.append('tags', tag);
            });
          } else {
            params.append('tags', tags[type]);
          }
      }
    }

    if (options?.filter?.search?.text) {
      params.append('search[text]', options.filter.search.text);
    }

    let sort =  options?.filter?.sort
    if (sort) {
      if (!Array.isArray(sort)) sort = [sort];
      sort.map( criterium => params.append('sort', criterium) );
    }

    let page =  options?.filter?.page;
    let itemsPerPage = options?.filter?.pageSize;

    if (page >= 0 && itemsPerPage) {
      params.append('page', page);
      params.append('pageSize', itemsPerPage);
    } else if(pageSize >= 0) {
      params.append('page', 0);
      params.append('pageSize', pageSize);
    }

    let url = `/api/project/${projectId}/resource?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&${params.toString()}`;
    return this.fetch(url);
  },

  delete: async function({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${data.id}`;
    let method = 'delete';
    let newData = await this.fetch(url, { method })
    return { id: data.id };
  },
};
