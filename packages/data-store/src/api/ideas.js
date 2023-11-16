export default {
  fetch: async function ({ projectId }, data, options) {
    let filterString = '';
    const tags = options?.filter?.tags;
    if (tags) {
      for (let type in tags) {
        const tagValues = tags[type];
        if (tagValues)
          if (Array.isArray(tagValues)) {
            tagValues.forEach((tag) => (filterString += `&tags=${tag}`));
          } else {
            filterString += `&tags=${options.filter.tags[type]}`;
          }
      }

      if (options.filter.search?.text)
        filterString += `&search[text]=${options.filter.search.text}`;
    }

    let url = `/api/project/${projectId}/idea?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1${filterString}`;
    return this.fetch(url);
  },
};
