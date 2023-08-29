export default {

  fetch: async function({ projectId, ideaId, sentiment }) {

    let url = `/api/project/${projectId}/idea/${ideaId}/comment?sentiment=${sentiment}&withUser=1&withUserVote=1&withVoteCount=1&includeCommentsOnComments=1`;
    return this.fetch(url);

  },

  create: async function({ projectId, ideaId }, data) {

    let url = `/api/project/${projectId}/idea/${ideaId}/comment`;
    let method = 'post';
    delete data.id;
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body })
    return { created: newData };

  },

  update: async function({ projectId, ideaId }, data) {

    let url = `/api/project/${projectId}/idea/${ideaId}/comment/${data.id}`;
    let method = 'put';
    let body = JSON.stringify(data);
      
    let newData = await this.fetch(url, { method, body })
    return { updated: newData };

  },

  delete: async function({ projectId, ideaId }, data) {


    let url = `/api/project/${projectId}/idea/${ideaId}/comment/${data.id}`;
    let method = 'delete';

    let newData = await this.fetch(url, { method })
    return { deleted: { id: data.id } };

    
  },

  submitLike: async function({ projectId, ideaId }, data) {

    let url = `/api/project/${projectId}/idea/${ideaId}/comment/${data.id}/vote`;
    let method = 'post';
    let body = JSON.stringify({});

    let newData = await this.fetch(url, { method })
    return { updated: newData };

  },

}
