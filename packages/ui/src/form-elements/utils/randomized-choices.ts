type ChoiceStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function parseStoredValues(raw: string | null): unknown[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((item) =>
      item && typeof item === 'object' ? item.value : item
    );
  } catch {
    return null;
  }
}

export function getRandomizedDisplayChoices<T extends { value: string }>(
  choices: T[],
  fieldKey: string,
  storage: ChoiceStorage = sessionStorage
): T[] {
  if (choices.length === 0) return choices;

  const storageKey = `randomizedChoices_${fieldKey}`;
  const storedValues = parseStoredValues(storage.getItem(storageKey));

  if (
    storedValues &&
    storedValues.length === choices.length &&
    new Set(storedValues).size === storedValues.length
  ) {
    const ordered = storedValues.map((value) =>
      choices.find((choice) => choice.value === value)
    );
    if (ordered.every((choice): choice is T => choice !== undefined)) {
      return ordered;
    }
  }

  const shuffled = shuffleArray(choices);
  storage.setItem(
    storageKey,
    JSON.stringify(shuffled.map((choice) => choice.value))
  );
  return shuffled;
}
