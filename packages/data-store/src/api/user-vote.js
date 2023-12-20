import fetch from './fetch';

export default {

  fetch: async function({ projectId, type }) {
    // todo, maar voor nu ff niet relevant
    return {};
  },

  submitVote: async function({ projectId, type }, data) {

    console.log('SUBMIT VOTE');

    let url = `/api/project/${projectId}/vote`;
    let headers = {
      'Content-Type': 'application/json'
    };

    let votes = data.map(resource => ({
      resourceId: resource.id,
      opinion: 'selected',
    }))

    let json = await this.fetch(url, { headers, method: 'POST', body: JSON.stringify(votes)})

    let event = new window.CustomEvent('osc-submit-user-vote', { detail: { type: 'userVote', votes } });
	  window.dispatchEvent(event);

    return json;

  },
  

}
