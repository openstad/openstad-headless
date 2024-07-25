import fetch from './fetch';

export default {

  fetch: async function({ projectId, userId }) {

    let url = `/api/project/${projectId}/user/${userId}`;
    let headers = {
      'Content-Type': 'application/json'
    };

    return this.fetch(url, { headers });

  },

  fetchMe: async function({ projectId }) {

    // console.log('FETCH ME');
    
    let url = `/auth/project/${projectId}/me`;
    let headers = {
      'Content-Type': 'application/json'
    };

    let json = await this.fetch(url, { headers });

    let openStadUser = json;
    if (openStadUser && openStadUser.id) openStadUser = { ...openStadUser, jwt: self.currentUserJWT };

    return openStadUser;

  },

  connectUser: async function({ projectId, cmsUser }) {

    // console.log('CONNECT-USER');

    let url = `/auth/project/${projectId}/connect-user?useAuth=oidc`;
    let headers = {
      'Content-Type': 'application/json'
    };

    let data = {
      access_token: cmsUser.access_token,
      iss: `${cmsUser.iss}`,
    }

    let json = await this.fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify(data)
    })
      
    return json.jwt;

  },

  update: async function ({ projectId, user }) {
    let url = `/api/project/${projectId}/user/${user.id}`;
    let headers = {
      'Content-Type': 'application/json'
    };

    let data = {
      postcode: user.postalCode,
      name: user.name,
      fullName: user.name,
      nickName: user.nickName,
      address: user.address,
      city: user.city,
    }

    let json = await this.fetch(url, {
      headers,
      method: 'PUT',
      body: JSON.stringify(data)
    })

    return json;
  },
  
  logout: function({ url }) {
    url = url || `${this.apiUrl}/auth/project/${this.projectId}/logout?useAuth=oidc`;
    document.location.href = url;
  },

}
