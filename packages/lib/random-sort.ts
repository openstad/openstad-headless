const MAX_INT_UNSIGNED = 4294967295;
const DEFAULT_RANDOM_SORT_SEED_STORAGE_PREFIX = 'openstadRandomSortSeed';
const HASH_MODULUS = 2147483647;
const HASH_MULTIPLIER = 48271;

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
  // Keep state in a prime modulus domain; avoids bitwise ops and stays deterministic.
  let state = Math.abs(Math.floor(seed)) % (HASH_MODULUS - 1);
  state += 1;

  for (let index = 0; index < key.length; index += 1) {
    const characterCode = key.charCodeAt(index) + 1;
    const characterPosition = index + 1;
    const seedStep =
      (state * HASH_MULTIPLIER + (seed % 1000003) + characterPosition * 97) %
      HASH_MODULUS;

    // Mix current state, seed and position; this avoids monotonic ordering on similar keys.
    state =
      (seedStep * (characterCode + 37 + (seedStep % 97)) +
        characterPosition * 101) %
      HASH_MODULUS;
  }

  return (state - 1) / (HASH_MODULUS - 1);
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
