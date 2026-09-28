import { describe, expect, it } from 'vitest';

import { transformAnswer } from './qa-processor.js';

describe('transformAnswer', () => {
  it('renders each swipe card as a label: answer line', () => {
    const answer = [
      { cardId: 1, answer: 'Eens', title: 'Statement one', explanation: '' },
      { cardId: 2, answer: 'Oneens', title: 'Statement two', explanation: '' },
    ];

    expect(transformAnswer(answer, 'swipe_field', undefined, 'swipe')).toBe(
      'Statement one: Eens<br/>Statement two: Oneens'
    );
  });

  it('appends the explanation to a swipe answer when present', () => {
    const answer = [
      {
        cardId: 1,
        answer: 'Eens',
        title: 'Statement one',
        explanation: 'because reasons',
      },
    ];

    expect(transformAnswer(answer, 'swipe_field', undefined, 'swipe')).toBe(
      'Statement one: Eens: because reasons'
    );
  });

  it('falls back to a 1-based "Keuze N" when a swipe card has no title', () => {
    const answer = [{ cardId: 3, answer: 'Eens', title: '', explanation: '' }];

    expect(transformAnswer(answer, 'swipe_field', undefined, 'swipe')).toBe(
      'Keuze 4: Eens'
    );
  });

  it('numbers swipe cards the same way as dilemmas', () => {
    const answer = [{ cardId: 0, answer: 'Eens', title: '', explanation: '' }];

    expect(transformAnswer(answer, 'swipe_field', undefined, 'swipe')).toBe(
      'Keuze 1: Eens'
    );
  });

  it('renders a skipped swipe card as "Overgeslagen"', () => {
    const answer = [
      { cardId: 1, answer: 'skipped', title: 'Statement one', explanation: '' },
    ];

    expect(transformAnswer(answer, 'swipe_field', undefined, 'swipe')).toBe(
      'Statement one: Overgeslagen'
    );
  });

  it('renders a skipped dilemma as "Overgeslagen" instead of an empty title', () => {
    const answer = [
      { dilemmaId: 0, answer: 'skipped', title: '', explanation: '' },
    ];

    expect(transformAnswer(answer, 'dilemma_field', undefined, 'dilemma')).toBe(
      'Keuze 1: Overgeslagen'
    );
  });

  it('renders each dilemma as a numbered "Keuze N: chosen title" line', () => {
    const answer = [
      { dilemmaId: 0, answer: 'a', title: 'Option A text', explanation: '' },
      { dilemmaId: 1, answer: 'b', title: 'Option B text', explanation: '' },
    ];

    expect(transformAnswer(answer, 'dilemma_field', undefined, 'dilemma')).toBe(
      'Keuze 1: Option A text<br/>Keuze 2: Option B text'
    );
  });

  it('appends the explanation to a dilemma answer when present', () => {
    const answer = [
      {
        dilemmaId: 0,
        answer: 'a',
        title: 'Option A text',
        explanation: 'my reasoning',
      },
    ];

    expect(transformAnswer(answer, 'dilemma_field', undefined, 'dilemma')).toBe(
      'Keuze 1: Option A text: my reasoning'
    );
  });

  it('HTML-escapes swipe/dilemma titles and explanations', () => {
    const answer = [
      {
        cardId: 1,
        answer: 'Eens',
        title: '<b>bold</b>',
        explanation: '<script>alert(1)</script>',
      },
    ];

    const result = transformAnswer(answer, 'swipe_field', undefined, 'swipe');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<b>');
  });

  it('still renders uploaded image/document arrays as links', () => {
    const answer = [{ url: 'https://a.jpg', name: 'a.jpg' }];

    expect(transformAnswer(answer, 'images')).toBe(
      '<a href="https://a.jpg" target="_blank">a.jpg</a>'
    );
  });

  it('still joins a plain array of primitives with a comma', () => {
    expect(transformAnswer(['a', 'b'], 'some_field')).toBe('a, b');
  });

  it('still renders a plain object as key: value pairs', () => {
    expect(transformAnswer({ foo: 'bar' }, 'some_field')).toBe('foo: bar');
  });

  it('still escapes and returns a plain string', () => {
    expect(transformAnswer('<b>hi</b>', 'some_field')).not.toContain('<b>');
  });
});
