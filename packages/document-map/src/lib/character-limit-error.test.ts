import { describe, expect, test } from 'vitest';

import { characterLimitError } from './character-limit-error';

describe('characterLimitError', () => {
  test('explains the minimum when the text is too short', () => {
    expect(characterLimitError({ length: 3, min: 10, max: 500 })).toBe(
      'Tekst moet minimaal 10 karakters bevatten'
    );
  });

  test('explains the maximum when the text is too long', () => {
    expect(characterLimitError({ length: 501, min: 10, max: 500 })).toBe(
      'Tekst moet maximaal 500 karakters bevatten'
    );
  });

  test('uses the configured texts with their placeholders', () => {
    expect(
      characterLimitError({
        length: 2,
        min: 5,
        max: 50,
        minErrorText: 'Minstens {minCharacters} tekens graag',
        maxErrorText: 'Hooguit {maxCharacters} tekens',
      })
    ).toBe('Minstens 5 tekens graag');
    expect(
      characterLimitError({
        length: 60,
        min: 5,
        max: 50,
        minErrorText: 'Minstens {minCharacters} tekens graag',
        maxErrorText: 'Hooguit {maxCharacters} tekens',
      })
    ).toBe('Hooguit 50 tekens');
  });

  test('falls back to the default text when the configured text is empty', () => {
    expect(
      characterLimitError({ length: 1, min: 4, max: 20, minErrorText: '' })
    ).toBe('Tekst moet minimaal 4 karakters bevatten');
  });
});
