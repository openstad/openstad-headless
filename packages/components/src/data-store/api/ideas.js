export default {

  fetch: async function({ projectId }, data, options) {

    let filterString = '';
    if (options && options.filter) {

      for (let type in options.filter.tags) {
        if (options.filter.tags[type]) filterString += `&tags=${options.filter.tags[type]}`;
      }

      if ( options.filter.search && options.filter.search.text ) filterString += `&search[criteria][text]=${options.filter.search.text}`;

    }

    let url = `/api/project/${projectId}/idea?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags${filterString}`;
    return this.fetch(url);

  },

}
