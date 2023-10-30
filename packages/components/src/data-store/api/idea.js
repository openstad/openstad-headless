export default {

  fetch: async function({ projectId, ideaId }, key) {

    let url = `/api/project/${projectId}/idea/${ideaId}?includeUser=1&includeVoteCount=1&includeUserVote=1`;
    let headers = {
      'Content-Type': 'application/json'
    };

    return this.fetch(url, { headers });

  },

  update: async function({ projectId, ideaId }, data) {

    let url = `/api/project/${projectId}/idea/${ideaId}`;
    let headers = {
      'Content-Type': 'application/json'
    };
    let json = await this.fetch(url, { headers, method: 'put', body: JSON.stringify(data) })

    let event = new window.CustomEvent('osc-api-update-data', { detail: { type: 'idea', idea: json, data } });
	  window.dispatchEvent(event);

    return json;

  },

  submitLike: async function({ projectId, ideaId }, data) {

    let url = `/api/project/${projectId}/vote`;
    let headers = {
      'Content-Type': 'application/json'
    };

    let json = await this.fetch(url, { headers, method: 'POST', body: JSON.stringify({ ideaId, opinion: data.opinion })})

    let event = new window.CustomEvent('osc-idea-submit-like', { detail: { type: 'idea', ideaId, data } });
	  window.dispatchEvent(event);

    return json;

  },

}
