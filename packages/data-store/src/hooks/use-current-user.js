import { useEffect } from 'react';
import useSWR, { mutate } from 'swr';

import {
  clearLogoutSignalCookie,
  getKnownIdentities,
  hasActiveSessionCookie,
  hasLogoutSignalCookie,
  notifyAuthChange,
  onAuthChange,
} from '../../../lib/auth-broker';
import { LocalStorage } from '../../../lib/local-storage';

const REVOKE_LOGINS_TIMEOUT_MS = 3000;

const projectsWithStoredLogin = new Set();

function markStoredLogin(projectId) {
  projectsWithStoredLogin.add(String(projectId));
}

function setActiveCookie() {
  document.cookie =
    'openstad_active=1; path=/; SameSite=Lax' +
    (location.protocol === 'https:' ? '; Secure' : '');
}

function activateExpireOnClose(storage) {
  storage.set('expireOnClose', true);
  setActiveCookie();
}

export function removeExpireOnCloseFromUrl(href) {
  const url = new URL(href);
  if (!url.searchParams.has('expireOnClose')) return href;
  url.searchParams.delete('expireOnClose');
  return url.toString();
}

export function consumeLoginTokenFromUrl({ search, projectId }) {
  const params = new URLSearchParams(search);
  const tokenProjectId = params.get('openstadprojectid');
  let jwt = params.get('openstadlogintoken');
  if (jwt && tokenProjectId && tokenProjectId !== String(projectId)) {
    jwt = null;
  }
  if (!jwt) {
    return { jwt: null, search };
  }
  params.delete('openstadlogintoken');
  params.delete('openstadprojectid');
  const query = params.toString();
  return { jwt, search: query ? `?${query}` : '' };
}

export function consumeLoginToken({ storage, projectId, location, history }) {
  const pickup = consumeLoginTokenFromUrl({
    search: location.search,
    projectId,
  });
  if (!pickup.jwt) return null;

  storage.set('openStadUser', { jwt: pickup.jwt });
  markStoredLogin(projectId);
  history.replaceState(
    null,
    '',
    `${location.pathname}${pickup.search}${location.hash}`
  );

  return pickup.jwt;
}

export function pickInitialUser({ globalUser, propsUser, projectId }) {
  const globalUserIsForThisProject =
    globalUser &&
    (!globalUser.projectId ||
      String(globalUser.projectId) === String(projectId));
  return (globalUserIsForThisProject ? globalUser : null) || propsUser || {};
}

const scheduledRefreshes = new Set();

export function refreshCurrentUser(projectId) {
  const key = String(projectId);
  if (scheduledRefreshes.has(key)) return;
  scheduledRefreshes.add(key);
  queueMicrotask(() => {
    scheduledRefreshes.delete(key);
    mutate({ type: 'current-user', projectId });
  });
}

export function refreshCurrentUserOnAuthChange(projectId) {
  return (projectIds) => {
    if (projectIds && !projectIds.includes(String(projectId))) return;
    refreshCurrentUser(projectId);
  };
}

export function revokeKnownLogins({
  apiUrl,
  timeoutMs = REVOKE_LOGINS_TIMEOUT_MS,
}) {
  const revocations = getKnownIdentities({ apiUrl }).map(({ projectId, jwt }) =>
    fetch(`${apiUrl}/auth/project/${projectId}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      keepalive: true,
    })
  );
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  return Promise.race([Promise.allSettled(revocations), timeout]).finally(() =>
    clearTimeout(timer)
  );
}

export function applyJwt({ storage, api, projectId, jwt }) {
  storage.set('openStadUser', { jwt, apiUrl: api.apiUrl });
  markStoredLogin(projectId);
  api.currentUserJWT = jwt;
  refreshCurrentUser(projectId);
  notifyAuthChange([String(projectId)]);
}

export default function useCurrentUser(props) {
  let self = this;

  const projectId = props.projectId;
  const multiProjectLogin =
    props.multiProjectLogin ?? props.api?.multiProjectLogin;

  const { data, error, isLoading } = useSWR(
    { type: 'current-user', projectId: self.projectId },
    getCurrentUser
  );

  useEffect(() => {
    if (!multiProjectLogin) return undefined;
    return onAuthChange(refreshCurrentUserOnAuthChange(self.projectId));
  }, [self.projectId, multiProjectLogin]);

  async function getCurrentUser() {
    if (self.projectId === undefined || self.projectId === null) return {};

    const storage = new LocalStorage(props);

    // jwt in url: use and remove from url
    const params = new URLSearchParams(window.location.search);

    const freshLoginInUrl = !!consumeLoginTokenFromUrl({
      search: window.location.search,
      projectId,
    }).jwt;
    const logoutSignalCookie = multiProjectLogin && hasLogoutSignalCookie();
    if (logoutSignalCookie && freshLoginInUrl) clearLogoutSignalCookie();
    const logoutSignalledByCms = logoutSignalCookie && !freshLoginInUrl;
    if (params.has('openstadlogout') || logoutSignalledByCms) {
      console.log('[osc-auth] logout detected, clearing session');
      if (multiProjectLogin) {
        storage.destroy();
      } else {
        storage.remove('cmsUser');
        storage.remove('openStadUser');
        storage.remove('expireOnClose');
      }
      if (logoutSignalledByCms) clearLogoutSignalCookie();

      let url = window.location.href;
      url = url.replace(new RegExp(`[?&]openstadlogout=true`), '');
      history.replaceState(null, '', url);
      self.currentUser = null;
      return {};
    }

    if (storage.get('expireOnClose') && !hasActiveSessionCookie()) {
      storage.remove('cmsUser');
      storage.remove('openStadUser');
      storage.remove('expireOnClose');
      self.currentUser = null;
      return {};
    }

    // get user from props
    let initialUser = {};
    try {
      initialUser = pickInitialUser({
        globalUser: globalOpenStadUser,
        propsUser: props.openStadUser,
        projectId,
      });
    } catch (err) {}

    if (params.has('expireOnClose')) {
      activateExpireOnClose(storage);
      history.replaceState(
        null,
        '',
        removeExpireOnCloseFromUrl(window.location.href)
      );
    }

    let jwt;
    const jwtFromUrl = consumeLoginToken({
      storage,
      projectId,
      location: window.location,
      history: window.history,
    });
    if (jwtFromUrl) {
      jwt = jwtFromUrl;
      console.log('[osc-auth] login token received from URL');
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
    const jwtIsStored = !!jwt && jwt === sessionUser.jwt && jwt !== jwtFromUrl;
    if (jwtIsStored) {
      markStoredLogin(projectId);
    }
    const storedLoginWasRemoved =
      !jwt &&
      multiProjectLogin &&
      projectsWithStoredLogin.has(String(projectId));
    if (!jwt && initialUser.jwt && !storedLoginWasRemoved) {
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

        if (!openStadUser?.id) {
          console.log('[osc-auth] token not accepted, continuing anonymous');
          storage.remove('openStadUser');
          return {};
        }

        if (
          multiProjectLogin &&
          jwtIsStored &&
          storage.get('openStadUser')?.jwt !== jwt
        ) {
          console.log(
            '[osc-auth] token removed while fetching the user, continuing anonymous'
          );
          return {};
        }

        console.log(
          `[osc-auth] user authenticated: userId=${openStadUser?.id} role=${openStadUser?.role}`
        );
        storage.set('openStadUser', {
          ...openStadUser,
          jwt,
          apiUrl: self.api.apiUrl,
        });
        markStoredLogin(projectId);
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
    data.logout = async function (params) {
      const storage = new LocalStorage(props);
      if (multiProjectLogin) {
        await revokeKnownLogins({ apiUrl: self.api.apiUrl });
      }
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
