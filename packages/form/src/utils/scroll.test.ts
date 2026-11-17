// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';

import { findFirstErrorTarget } from './scroll';

// jsdom does no layout, so positions and layout boxes are stubbed per element.
const stub = (element: HTMLElement, top: number, hasBox = true) => {
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
  element.getClientRects = (() =>
    hasBox ? [{ top }] : []) as unknown as HTMLElement['getClientRects'];
};

const buildForm = () => {
  const form = document.createElement('form');
  form.innerHTML = `
    <div class="question" id="q-a"><input name="a" id="in-a" /></div>
    <div class="question" id="q-map"><input type="hidden" name="map" id="in-map" /></div>
    <div class="question" id="q-b"><input name="b" id="in-b" /></div>
  `;
  document.body.appendChild(form);
  const el = (id: string) => form.querySelector(`#${id}`) as HTMLElement;
  return { form, el };
};

describe('findFirstErrorTarget', () => {
  test('picks the topmost error, not the first in the given key order', () => {
    const { form, el } = buildForm();
    stub(el('q-a'), 300);
    stub(el('in-a'), 300);
    stub(el('q-map'), 150);
    stub(el('in-map'), 150, false);
    stub(el('q-b'), 50);
    stub(el('in-b'), 50);

    const target = findFirstErrorTarget(form, ['a', 'map', 'b']);

    expect(target?.scrollTarget.id).toBe('q-b');
    expect(target?.focusTarget.id).toBe('in-b');
  });

  test('falls back to the .question wrapper for a field without a visible input', () => {
    const { form, el } = buildForm();
    stub(el('q-a'), 300);
    stub(el('in-a'), 300);
    stub(el('q-map'), 20);
    stub(el('in-map'), 20, false);
    stub(el('q-b'), 400);
    stub(el('in-b'), 400);

    const target = findFirstErrorTarget(form, ['a', 'map', 'b']);

    expect(target?.scrollTarget.id).toBe('q-map');
    expect(target?.focusTarget.id).toBe('q-map');
  });

  test('uses the outermost .question wrapper when a field nests its own', () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <div class="question" id="q-outer">
        <div class="question" id="q-inner"><input name="c" id="in-c" /></div>
      </div>
    `;
    document.body.appendChild(form);
    const el = (id: string) => form.querySelector(`#${id}`) as HTMLElement;
    stub(el('q-outer'), 100);
    stub(el('q-inner'), 140);
    stub(el('in-c'), 140);

    const target = findFirstErrorTarget(form, ['c']);

    expect(target?.scrollTarget.id).toBe('q-outer');
    expect(target?.focusTarget.id).toBe('in-c');
  });

  test('returns null when no error key matches a field', () => {
    const { form } = buildForm();
    expect(findFirstErrorTarget(form, ['nope'])).toBeNull();
  });
});
