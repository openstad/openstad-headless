import useSWR from 'swr';

import { LocalStorage } from '../../../lib/local-storage';

export default function useCurrentUser(props) {
  let self = this;

  const projectId = props.projectId;

  const { data, error, isLoading } = useSWR(
    { type: 'current-user', projectId: self.projectId },
    getCurrentUser
  );

  async function getCurrentUser() {
    const storage = new LocalStorage(props);

    // jwt in url: use and remove from url
    const params = new URLSearchParams(window.location.search);

    if (params.has('openstadlogout')) {
      storage.remove('cmsUser');
      storage.remove('openStadUser');

      let url = window.location.href;
      url = url.replace(new RegExp(`[?&]openstadlogout=true`), '');
      history.replaceState(null, '', url);
      self.currentUser = null;
      return {};
    }

    // console.log('GETCURRENTUSER', self.currentUser);
    if (self.currentUser && self.currentUser.id) {
      // just once TODO: ik denk dat het jkan met useSWRmutaion,: als ik het goedlees update die alleen met de hand
      return self.currentUser;
    }

    // get user from props
    let initialUser = {};
    try {
      initialUser = globalOpenStadUser || props.openStadUser || {};
    } catch (err) {}

    if (initialUser.id && initialUser.projectId == self.projectId) {
      return initialUser;
    }
    let jwt;
    if (params.has('openstadlogintoken')) {
      jwt = params.get('openstadlogintoken');
      storage.set('openStadUser', { jwt });
      let url = window.location.href;
      url = url.replace(new RegExp(`[?&]openstadlogintoken=${jwt}`), '');
      history.replaceState(null, '', url);
    }

    let cmsUser = {};
    try {
      cmsUser = globalCmsUser || props.cmsUser || {};
    } catch (err) {}

    // get cmsUser from session data - this is a fix for badly written cms logouts
    let sessionCmsUser = storage.get('cmsUser') || {};
    if (sessionCmsUser && cmsUser) {
      // compare with current cmsUser
      if (sessionCmsUser.access_token != cmsUser.access_token) {
        // delete exising session cache
        storage.remove('cmsUser');
        storage.remove('openStadUser');
      }
    }
    storage.set('cmsUser', cmsUser);

    // get openStad user from session data
    let sessionUser = storage.get('openStadUser') || {};

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

      try {
        let openStadUser = await self.api.user.fetchMe({
          projectId: self.projectId,
        });

        storage.set('openStadUser', { ...openStadUser, jwt });
        return openStadUser;
      } catch (err) {
        storage.remove('openStadUser');
        return {};
      }
    } else {
      return {};
    }
  }

  // add functionality
  if (data) {
    data.logout = function (params) {
      const storage = new LocalStorage(props);
      storage.destroy();
      self.api.user.logout(params);
    };
  }

  return {
    data,
    setUser: () => console.log('setUser not (yet) implemented'),
    error,
    isLoading,
  };
}
