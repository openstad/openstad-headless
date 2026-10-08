const STORAGE_KEY = 'openstad';
const AUTH_CHANGED_EVENT = 'osc-auth-changed';
const ACTIVE_SESSION_COOKIE = /(^|;\s*)openstad_active=1/;

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

export function notifyAuthChange(): void {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function onAuthChange(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}
