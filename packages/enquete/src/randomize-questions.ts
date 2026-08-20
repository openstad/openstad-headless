// Helpers for showing the questions of a page in a random order.
//
// Randomising happens inside a single page: the fields between two pagination
// fields are permuted among themselves, so no question ever moves to another
// page. Content blocks keep their configured position, otherwise an intro text
// or an outro block would end up in the middle of the questions.
// Every page derives its own order from the same session seed.

export const PINNED_FIELD_TYPES = ['pagination', 'none', 'video'];

const ORDER_SEED_PREFIX = 'enquete-order-seed';

type FieldWithType = {
  type?: string;
};

export function getOrderStorageKey(
  projectId: string | number | undefined,
  widgetId: number | undefined,
  pathname: string
): string {
  const projectPart =
    typeof projectId !== 'undefined' ? String(projectId) : 'unknown-project';
  const widgetPart =
    typeof widgetId !== 'undefined' ? String(widgetId) : 'unknown-widget';
  return `${ORDER_SEED_PREFIX}:${projectPart}:${widgetPart}:${pathname}`;
}

export function createSeed(): number {
  return Math.floor(Math.random() * 2147483647) + 1;
}

// Deterministic PRNG so the same seed always produces the same order.
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(values: T[], seed: number): T[] {
  const shuffled = [...values];
  const random = mulberry32(seed);

  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[target];
    shuffled[target] = current;
  }

  return shuffled;
}

type RandomizePerPageInput<T> = {
  fields: T[];
  paginationPositions: number[];
};

export function buildRandomizePerPage<T extends FieldWithType>({
  fields,
  paginationPositions,
}: RandomizePerPageInput<T>): boolean[] {
  return [
    false,
    ...paginationPositions.map((position) => {
      const field = fields[position] as
        (T & { randomizeQuestions?: boolean }) | undefined;
      return field?.type === 'pagination' && field.randomizeQuestions === true;
    }),
  ];
}

type RandomizeInput<T> = {
  fields: T[];
  startPositions: number[];
  endPositions: number[];
  randomizePerPage: boolean[];
  seed: number;
};

export function randomizeFieldsPerPage<T extends FieldWithType>({
  fields,
  startPositions,
  endPositions,
  randomizePerPage,
  seed,
}: RandomizeInput<T>): T[] {
  if (!randomizePerPage.some(Boolean)) {
    return fields;
  }

  const randomized = [...fields];

  randomizePerPage.forEach((shouldRandomize, pageIndex) => {
    if (!shouldRandomize) return;

    const start = startPositions[pageIndex];
    const end = endPositions[pageIndex];

    if (typeof start !== 'number' || typeof end !== 'number') return;

    const positions: number[] = [];
    for (let index = start; index < end; index++) {
      if (!PINNED_FIELD_TYPES.includes(fields[index]?.type || '')) {
        positions.push(index);
      }
    }

    if (positions.length < 2) return;

    const shuffled = shuffleWithSeed(
      positions.map((position) => fields[position]),
      seed + pageIndex
    );

    positions.forEach((position, index) => {
      randomized[position] = shuffled[index];
    });
  });

  return randomized;
}

export function getOrderSeed(storageKey: string): number {
  if (
    typeof window === 'undefined' ||
    typeof window.sessionStorage === 'undefined'
  ) {
    return createSeed();
  }

  try {
    const stored = window.sessionStorage.getItem(storageKey);
    const parsed = stored !== null ? Number.parseInt(stored, 10) : Number.NaN;

    if (Number.isFinite(parsed)) {
      return parsed;
    }

    const seed = createSeed();
    window.sessionStorage.setItem(storageKey, String(seed));
    return seed;
  } catch {
    return createSeed();
  }
}

export function clearOrderSeed(storageKey: string): void {
  if (
    typeof window === 'undefined' ||
    typeof window.sessionStorage === 'undefined'
  ) {
    return;
  }

  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    return;
  }
}
