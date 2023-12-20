export default {

  fetch: async function({ projectId, resourceId, sentiment }) {

    let url = `/api/project/${projectId}/resource/${resourceId}/comment?sentiment=${sentiment}&includeUser=1&includeUserVote=1&includeVoteCount=1&includeRepliesOnComments=1`;
    return this.fetch(url);

  },

  create: async function({ projectId, resourceId }, data) {

    let url = `/api/project/${projectId}/resource/${resourceId}/comment`;
    let method = 'post';
    delete data.id;
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body })
    return newData;

  },

  update: async function({ projectId, resourceId }, data) {

    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}`;
    let method = 'put';
    let body = JSON.stringify(data);
      
    let newData = await this.fetch(url, { method, body })
    return newData;

  },

  delete: async function({ projectId, resourceId }, data) {


    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}`;
    let method = 'delete';

    let newData = await this.fetch(url, { method })
    return { id: data.id };

    
  },

  submitLike: async function({ projectId, resourceId }, data) {

    let url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}/vote`;
    let method = 'post';
    let body = JSON.stringify({});

    let newData = await this.fetch(url, { method })
    return newData;

  },

}
