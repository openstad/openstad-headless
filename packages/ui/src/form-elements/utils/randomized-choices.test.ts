import { describe, expect, test } from 'vitest';

import { getRandomizedDisplayChoices } from './randomized-choices';

function fakeStorage(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial };
  return {
    data,
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

const choices = [
  { value: 'a', label: 'Appel' },
  { value: 'b', label: 'Banaan' },
  { value: 'c', label: 'Citroen' },
];

describe('getRandomizedDisplayChoices', () => {
  test('stores only the values of the shuffled order', () => {
    const storage = fakeStorage();

    const result = getRandomizedDisplayChoices(choices, 'fruit', storage);

    expect(JSON.parse(storage.data.randomizedChoices_fruit)).toEqual(
      result.map((choice) => choice.value)
    );
    expect([...result].sort((x, y) => x.value.localeCompare(y.value))).toEqual(
      choices
    );
  });

  test('keeps the same order across calls', () => {
    const storage = fakeStorage();

    const first = getRandomizedDisplayChoices(choices, 'fruit', storage);
    const second = getRandomizedDisplayChoices(choices, 'fruit', storage);

    expect(second.map((choice) => choice.value)).toEqual(
      first.map((choice) => choice.value)
    );
  });

  test('shows changed labels while keeping the stored order', () => {
    const storage = fakeStorage({
      randomizedChoices_fruit: JSON.stringify(['c', 'a', 'b']),
    });
    const renamed = [
      { value: 'a', label: 'Peer' },
      { value: 'b', label: 'Banaan' },
      { value: 'c', label: 'Citroen' },
    ];

    expect(getRandomizedDisplayChoices(renamed, 'fruit', storage)).toEqual([
      renamed[2],
      renamed[0],
      renamed[1],
    ]);
  });

  test('reads an order stored as full choice objects', () => {
    const storage = fakeStorage({
      randomizedChoices_fruit: JSON.stringify([
        { value: 'b', label: 'Oud label' },
        { value: 'c', label: 'Citroen' },
        { value: 'a', label: 'Appel' },
      ]),
    });

    expect(getRandomizedDisplayChoices(choices, 'fruit', storage)).toEqual([
      choices[1],
      choices[2],
      choices[0],
    ]);
  });

  test('shuffles again when a choice was added', () => {
    const storage = fakeStorage({
      randomizedChoices_fruit: JSON.stringify(['b', 'a']),
    });

    const result = getRandomizedDisplayChoices(choices, 'fruit', storage);

    expect(result).toHaveLength(3);
    expect(JSON.parse(storage.data.randomizedChoices_fruit)).toHaveLength(3);
  });

  test('shuffles again when a choice was replaced', () => {
    const storage = fakeStorage({
      randomizedChoices_fruit: JSON.stringify(['a', 'b', 'x']),
    });

    const result = getRandomizedDisplayChoices(choices, 'fruit', storage);

    expect(result.map((choice) => choice.value).sort()).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  test('shuffles again when the stored order repeats a value', () => {
    const storage = fakeStorage({
      randomizedChoices_fruit: JSON.stringify(['a', 'a', 'b']),
    });

    const result = getRandomizedDisplayChoices(choices, 'fruit', storage);

    expect(result.map((choice) => choice.value).sort()).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  test('shuffles again when the stored value is not a list', () => {
    for (const raw of ['not json', '{"a":1}']) {
      const storage = fakeStorage({ randomizedChoices_fruit: raw });

      const result = getRandomizedDisplayChoices(choices, 'fruit', storage);

      expect(result).toHaveLength(3);
      expect(
        Array.isArray(JSON.parse(storage.data.randomizedChoices_fruit))
      ).toBe(true);
    }
  });

  test('returns an empty list without storing anything', () => {
    const storage = fakeStorage();

    expect(getRandomizedDisplayChoices([], 'fruit', storage)).toEqual([]);
    expect(storage.data).toEqual({});
  });

  test('keeps the order per field', () => {
    const storage = fakeStorage({
      randomizedChoices_fruit: JSON.stringify(['c', 'b', 'a']),
    });

    getRandomizedDisplayChoices(choices, 'groente', storage);

    expect(storage.data.randomizedChoices_fruit).toBe(
      JSON.stringify(['c', 'b', 'a'])
    );
    expect(storage.data.randomizedChoices_groente).toBeDefined();
  });
});
