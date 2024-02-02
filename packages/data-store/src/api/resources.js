export default {
  fetch: async function (
    { projectId, pageSize, tags: tagsOnlyFilter },
    data,
    options
  ) {
    const params = new URLSearchParams();
    const givenTags = Array.isArray(options?.filter?.tags) ? options.filter.tags : [];

    const tagIdLimits = Array.isArray(tagsOnlyFilter)
      ? tagsOnlyFilter.map((idTag) => idTag.toString())
      : [];

    // Fallback on the tagIdLimits if no tags are given
    const tagsFiltered = tagIdLimits.filter((t) => givenTags.length > 0
        ? givenTags.includes(t)
        : true
    );

    if(tagsFiltered.length > 0) {
      tagsFiltered.forEach((tag) => params.append('tags', tag));
    } else {
      givenTags.forEach((tag) => params.append('tags', tag));
    }

    if (options?.filter?.search?.text) {
      params.append('search[text]', options.filter.search.text);
    }

    let sort = options?.filter?.sort;
    if (sort) {
      if (!Array.isArray(sort)) sort = [sort];
      sort.map((criterium) => params.append('sort', criterium));
    }

    let page = options?.filter?.page;
    let itemsPerPage = options?.filter?.pageSize;

    if (page >= 0 && itemsPerPage) {
      params.append('page', page);
      params.append('pageSize', itemsPerPage);
    } else if (pageSize >= 0) {
      params.append('page', 0);
      params.append('pageSize', pageSize);
    }

    let url = `/api/project/${projectId}/resource?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&${params.toString()}`;
    return this.fetch(url);
  },

  delete: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${data.id}`;
    let method = 'delete';
    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },
};
