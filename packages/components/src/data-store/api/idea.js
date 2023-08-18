export default {

  fetch: async function({ projectId, ideaId }, key) {

    let url = `/api/project/${projectId}/idea/${ideaId}`;
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

}
