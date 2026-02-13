const MAX_INT_UNSIGNED = 4294967295;
const UINT32_MODULUS = MAX_INT_UNSIGNED + 1;
const DEFAULT_RANDOM_SORT_SEED_STORAGE_PREFIX = 'openstadRandomSortSeed';

function getNavigationType() {
  if (typeof window === 'undefined' || !window.performance?.getEntriesByType)
    return '';
  const [entry] = window.performance.getEntriesByType('navigation') as any[];
  return entry?.type || '';
}

export function getScopedSessionRandomSortSeed(
  scope: string,
  storagePrefix = DEFAULT_RANDOM_SORT_SEED_STORAGE_PREFIX
) {
  if (typeof window === 'undefined') return 1;

  const storageKey = `${storagePrefix}:${scope}`;
  const isReload = getNavigationType() === 'reload';

  if (isReload || !window.sessionStorage.getItem(storageKey)) {
    const nextSeed = `${Math.floor(Math.random() * MAX_INT_UNSIGNED)}`;
    window.sessionStorage.setItem(storageKey, nextSeed);
  }

  return Number.parseInt(window.sessionStorage.getItem(storageKey) || '1', 10);
}

export function deterministicRandomNumber(seed: number, key: string) {
  const seedAndKey = `${seed}:${key}`;
  let hash = 0;
  const primeMultiplier = 31;

  // Build a stable 32-bit-like hash without bitwise operators.
  for (let index = 0; index < seedAndKey.length; index += 1) {
    const characterCode = seedAndKey.charCodeAt(index);
    hash = (hash * primeMultiplier + characterCode) % UINT32_MODULUS;
  }

  return hash / MAX_INT_UNSIGNED;
}

export function deterministicRandomSort(
  a: any,
  b: any,
  seed: number,
  getKey: (entry: any) => string
) {
  const keyA = getKey(a);
  const keyB = getKey(b);
  const randomA = deterministicRandomNumber(seed, keyA);
  const randomB = deterministicRandomNumber(seed, keyB);

  if (randomA === randomB) return keyA.localeCompare(keyB);
  return randomA - randomB;
}
