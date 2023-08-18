import fetch from './fetch';
import SessionStorage from '../../lib/session-storage.js';

export default {

  fetch: async function({ projectId }) {

    let self = this;
    return {};
    
    console.log('++++++++++', self.currentUser ? self.currentUser.id : '-');

    const session = new SessionStorage(self.props)

    const cmsUser = self.props.cmsUser || self.props.config.cmsUser || {};
    // const projectId = self.props.projectId || self.props.config.projectId;
    
    // get user from self.props
    let initialUser = self.props.openStadUser || self.props.config.openStadUser || {};
    if (initialUser && initialUser.id && initialUser.projectId == projectId) {
      // self.setCurrentUserId( initialUser.id );
      return initialUser;
    }
    
    // get cmsUser from session data - this is a fix for badly written cms logouts
    let sessionCmsUser = session.get('cmsUser') || {};
    if (sessionCmsUser && cmsUser) {
      // compare with current cmsUser
      if (sessionCmsUser.access_token != cmsUser.access_token) {
        // delete exising session cache
        session.remove('cmsUser');
        session.remove('openStadUser');
      }
    }
    session.set('cmsUser', cmsUser);

    // get user from session data
    let sessionUser = session.get('openStadUser') || {};

    // existing jwt
    let jwt = initialUser.jwt || sessionUser.jwt;

    // get jwt for cmsUser
    if (!jwt && cmsUser && cmsUser.access_token && cmsUser.iss) {

      let data = {
        access_token: cmsUser.access_token,
        iss: `${cmsUser.iss}`,
      }

      let json = await fetch(`${self.apiUrl}/auth/project/${projectId}/connect-user?useAuth=oidc`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
      });
      jwt = json.jwt;

    }

    if (jwt) {

      let url = `${self.apiUrl}/auth/project/${projectId}/me`;
      let headers = { 'X-Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' };

      let json = await fetch(url, { headers })

      let openStadUser = json;
      if (openStadUser && openStadUser.id) openStadUser = { ...openStadUser, jwt };
      session.set('openStadUser', openStadUser);

      console.log('????', openStadUser && openStadUser.id);
      
      // self.setCurrentUserId( openStadUser && openStadUser.id );
      return openStadUser;

    } else {
      // self.setCurrentUserId( null );
      return {};
    }

  }

}
