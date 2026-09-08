import useSWR from 'swr';

import { LocalStorage } from '../../../lib/local-storage';

function setActiveCookie() {
  document.cookie =
    'openstad_active=1; path=/; SameSite=Lax' +
    (location.protocol === 'https:' ? '; Secure' : '');
}

function hasActiveCookie() {
  return /(^|;\s*)openstad_active=1/.test(document.cookie);
}

function activateExpireOnClose(storage) {
  storage.set('expireOnClose', true);
  setActiveCookie();
}

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
      console.log('[osc-auth] logout detected, clearing session');
      storage.remove('cmsUser');
      storage.remove('openStadUser');
      storage.remove('expireOnClose');

      let url = window.location.href;
      url = url.replace(new RegExp(`[?&]openstadlogout=true`), '');
      history.replaceState(null, '', url);
      self.currentUser = null;
      return {};
    }

    if (storage.get('expireOnClose') && !hasActiveCookie()) {
      storage.remove('cmsUser');
      storage.remove('openStadUser');
      storage.remove('expireOnClose');
      self.currentUser = null;
      return {};
    }

    // get user from props
    let initialUser = {};
    try {
      initialUser = globalOpenStadUser || props.openStadUser || {};
    } catch (err) {}

    if (params.has('expireOnClose')) {
      activateExpireOnClose(storage);
      let url = window.location.href;
      url = url.replace(/[?&]expireOnClose=1/, '');
      history.replaceState(null, '', url);
    }

    let jwt;
    if (params.has('openstadlogintoken')) {
      jwt = params.get('openstadlogintoken');
      console.log('[osc-auth] login token received from URL');
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
    if (!jwt && sessionUser.jwt) {
      jwt = sessionUser.jwt;
    }
    if (!jwt && initialUser.jwt) {
      jwt = initialUser.jwt;
    }

    // or get jwt for cmsUser
    if (!jwt && cmsUser && cmsUser.access_token && cmsUser.iss) {
      const result = await self.api.user.connectUser({
        projectId: self.projectId,
        cmsUser,
      });
      jwt = result.jwt;
      if (result.expireOnClose) {
        activateExpireOnClose(storage);
      }
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

        console.log(
          `[osc-auth] user authenticated: userId=${openStadUser?.id} role=${openStadUser?.role}`
        );
        storage.set('openStadUser', { ...openStadUser, jwt });
        if (openStadUser && openStadUser.expireOnClose) {
          activateExpireOnClose(storage);
        }
        return openStadUser;
      } catch (err) {
        console.log(`[osc-auth] user fetch failed: ${err?.message}`);
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
