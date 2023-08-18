export default {

  fetch: async function({ projectId, ideaId, sentiment }, key) {
    let url = `/api/project/${projectId}/idea/${ideaId}/comment?sentiment=${sentiment}&withUser=1&withUserVote=1&withVoteCount=1&includeCommentsOnComments=1`;
    let headers = { 'Content-Type': 'application/json' };
    // if (requestcache.users && requestcache.users[projectId]) headers['X-Authorization'] = `Bearer ${requestcache.users[projectId].jwt}`;
    return this.fetch(url, { headers });
  },

  update: async function({ projectId, ideaId }, data) {


    let url = `/api/project/${projectId}/idea/${ideaId}/comment`;
    let method = 'post';
    let headers = {
      'Content-Type': 'application/json'
    };

    let myurl = url;
    method = 'post'
    if (data.id) {
      myurl += '/' + data.id
      method = 'put';
    } else {
      delete data.id
    }
      
    let formDataJsonString = JSON.stringify(data);
    let newData = await this.fetch(myurl, { headers, method, body: formDataJsonString })

    return method == 'post' ? { created: newData } : { updated: newData };

  },

  delete: async function({ projectId, ideaId }, data) {


    let url = `/api/project/${projectId}/idea/${ideaId}/comment`;
    let method = 'delete';
    let headers = {
      'Content-Type': 'application/json'
    };

    let myurl = url + '/' + data.id
    let newData = await this.fetch(myurl, { headers, method })

    return { deleted: { id: data.id } };

    
  },

}
