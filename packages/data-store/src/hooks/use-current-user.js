import { SessionStorage } from '../../../lib/session-storage';
import useSWR from 'swr';

export default function useCurrentUser(props) {
  let self = this;

  const projectId = props.projectId;

  const { data, error, isLoading } = useSWR(
    { type: 'current-user', projectId: self.projectId },
    getCurrentUser
  );

  async function getCurrentUser() {
    // console.log('GETCURRENTUSER', self.currentUser);
    if (self.currentUser && self.currentUser.id) {
      // just once TODO: ik denk dat het jkan met useSWRmutaion,: als ik het goedlees update die alleen met de hand
      return self.currentUser;
    }

    // get user from props
    let initialUser = {};
    try {
      initialUser = globalOpenStadUser || props.openStadUser || {};
    } catch(err) {}

    if (initialUser.id && initialUser.projectId == self.projectId) {
      return initialUser;
    }

    const session = new SessionStorage(props);

    // jwt in url: use and remove from url
    const params = new URLSearchParams(window.location.search);
    let jwt;
    if (params.has('openstadlogintoken')) {
      jwt = params.get('openstadlogintoken');
      session.set('openStadUser', { jwt });
      let url = window.location.href;
      url = url.replace(new RegExp(`[?&]openstadlogintoken=${jwt}`), '');
      history.replaceState(null, '', url);
    }

    let cmsUser = {};
    try {
      cmsUser = globalCmsUser || props.cmsUser || {};
    } catch(err) {}

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

    // get openStad user from session data
    let sessionUser = session.get('openStadUser') || {};

    // or use existing jwt
    jwt = jwt || initialUser.jwt || sessionUser.jwt;

    // or get jwt for cmsUser
    if (!jwt && cmsUser && cmsUser.access_token && cmsUser.iss) {
      jwt = await self.api.user.connectUser({
        projectId: self.projectId,
        cmsUser,
      });
    }

    // fetch me for this jwt
    if (jwt) {

      self.api.currentUserJWT = jwt; // use current user in subsequent requests

      // refresh already fetched data, now with the current user
      self.refresh();

      // TODO: delete jwt on error
      let openStadUser = await self.api.user.fetchMe({
        projectId: self.projectId,
      });

      session.set('openStadUser', { ...openStadUser, jwt });
      return openStadUser;
    } else {
      return {};
    }
  }

  // add functionality
  if (data) {
    data.logout = function(params) {
      const session = new SessionStorage(props);
      session.destroy();
      self.api.user.logout(params);
    }
  }

  return {
    data,
    setUser: () => console.log('setUser not (yet) implemented'),
    error,
    isLoading,
  };
}
