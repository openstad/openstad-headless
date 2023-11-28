export default {
  fetch: async function ({ projectId }, data, options) {
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

      if (options?.filter?.search?.text) {
        params.append('search[text]', options.filter.search.text);
      }

      let sort =  options?.filter?.sort
      if (sort) {
        if (!Array.isArray(sort)) sort = [sort];
        sort.map( criterium => params.append('sort', criterium) );
      }

    }

    let url = `/api/project/${projectId}/idea?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&${params.toString()}`;
    return this.fetch(url);
  },
};
