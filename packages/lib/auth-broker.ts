const STORAGE_KEY = 'openstad';
const AUTH_CHANGED_EVENT = 'osc-auth-changed';
const ACTIVE_SESSION_COOKIE = /(^|;\s*)openstad_active=1/;
const LOGOUT_SIGNAL_COOKIE = /(^|;\s*)openstad_logout=1/;

export type KnownIdentity = { projectId: string; jwt: string };

const parseEntry = (value: unknown): any => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const jwtExpiresAt = (jwt: string): number | null => {
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const claims = JSON.parse(atob(padded));
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch (err) {
    return null;
  }
};

export function hasActiveSessionCookie(): boolean {
  return ACTIVE_SESSION_COOKIE.test(document.cookie);
}

export function hasLogoutSignalCookie(): boolean {
  return LOGOUT_SIGNAL_COOKIE.test(document.cookie);
}

export function clearLogoutSignalCookie(): void {
  document.cookie = 'openstad_logout=; path=/; max-age=0';
}

export function getKnownIdentities({
  apiUrl,
  excludeProjectId,
}: {
  apiUrl: string;
  excludeProjectId?: string | number;
}): KnownIdentity[] {
  let data: Record<string, any>;
  try {
    data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (err) {
    return [];
  }

  const now = Date.now();
  return Object.entries(data).flatMap(([projectId, projectData]) => {
    if (projectId === String(excludeProjectId)) return [];

    const user = parseEntry(projectData?.openStadUser);
    if (!user?.jwt || user.apiUrl !== apiUrl) return [];

    if (parseEntry(projectData?.expireOnClose) && !hasActiveSessionCookie()) {
      return [];
    }

    const expiresAt = jwtExpiresAt(user.jwt);
    if (!expiresAt || expiresAt <= now) return [];

    return [{ projectId, jwt: user.jwt }];
  });
}

const storedJwtsByProject = (value: string | null): Record<string, string> => {
  let data: Record<string, any>;
  try {
    data = JSON.parse(value || '{}') || {};
  } catch (err) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(data).flatMap(([projectId, projectData]) => {
      const jwt = parseEntry(projectData?.openStadUser)?.jwt;
      return jwt ? [[projectId, jwt]] : [];
    })
  );
};

function projectsWithChangedLogin(
  oldValue: string | null,
  newValue: string | null
): string[] {
  const before = storedJwtsByProject(oldValue);
  const after = storedJwtsByProject(newValue);
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (projectId) => before[projectId] !== after[projectId]
  );
}

export function notifyAuthChange(projectIds?: string[]): void {
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, {
      detail: { projectIds: projectIds ?? null },
    })
  );
}

export function onAuthChange(
  callback: (projectIds: string[] | null) => void
): () => void {
  const onChangeOnThisPage = (event: Event) => {
    callback((event as CustomEvent).detail?.projectIds ?? null);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const changed = projectsWithChangedLogin(event.oldValue, event.newValue);
    if (changed.length > 0) callback(changed);
  };
  window.addEventListener(AUTH_CHANGED_EVENT, onChangeOnThisPage);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, onChangeOnThisPage);
    window.removeEventListener('storage', onStorage);
  };
}
