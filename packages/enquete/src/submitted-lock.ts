const SUBMITTED_PREFIX = 'enquete-submitted';

export function getSubmittedStorageKey(
  projectId: string | number | undefined,
  widgetId: number | string | undefined
): string {
  const projectPart =
    typeof projectId !== 'undefined' ? String(projectId) : 'unknown-project';
  const widgetPart =
    typeof widgetId !== 'undefined' ? String(widgetId) : 'unknown-widget';
  return `${SUBMITTED_PREFIX}:${projectPart}:${widgetPart}`;
}

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readSubmittedFlag(key: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    return storage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function readSubmittedAt(key: string): number | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function formatSubmittedAt(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day}, ${time}`;
}

export function writeSubmittedFlag(key: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

export function isFormClosed({
  flag,
  closeFormAfterSubmit,
  canBypass,
}: {
  flag: boolean;
  closeFormAfterSubmit?: boolean;
  canBypass?: boolean;
}): boolean {
  if (!closeFormAfterSubmit) return false;
  if (canBypass) return false;
  return !!flag;
}
