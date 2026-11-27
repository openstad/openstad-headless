// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageFocalPointDialog } from './image-focal-point-dialog';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let onSave: ReturnType<
  typeof vi.fn<(point: { x: number; y: number } | null) => void>
>;

const picker = () =>
  document.querySelector(
    '[role="slider"][aria-label="Focuspunt"]'
  ) as HTMLElement;
const field = (id: string) => document.getElementById(id) as HTMLInputElement;
const button = (label: string) =>
  Array.from(document.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === label
  ) as HTMLButtonElement;

const typeInto = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  onSave = vi.fn<(point: { x: number; y: number } | null) => void>();
  act(() => {
    root.render(
      <ImageFocalPointDialog
        imageUrl="/photo.jpg"
        initialPoint={{ x: 20, y: 30 }}
        onSave={onSave}
        onClose={() => {}}
      />
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.innerHTML = '';
});

describe('ImageFocalPointDialog', () => {
  it('starts at the saved point and shows it in the number fields', () => {
    expect(picker().getAttribute('aria-valuetext')).toBe(
      'Links 20%, boven 30%'
    );
    expect(field('focal-point-left').value).toBe('20');
    expect(field('focal-point-top').value).toBe('30');
  });

  it('moves the dot with the arrow keys, 10% with Shift', () => {
    act(() => {
      picker().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      );
    });
    act(() => {
      picker().dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          shiftKey: true,
          bubbles: true,
        })
      );
    });
    expect(picker().getAttribute('aria-valuetext')).toBe(
      'Links 21%, boven 40%'
    );
  });

  it('reports the value of the axis the last arrow key moved', () => {
    const press = (key: string) =>
      act(() => {
        picker().dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true })
        );
      });
    expect(picker().getAttribute('aria-valuenow')).toBe('20');
    press('ArrowDown');
    expect(picker().getAttribute('aria-valuenow')).toBe('31');
    press('ArrowLeft');
    expect(picker().getAttribute('aria-valuenow')).toBe('19');
  });

  it('moves the dot to where the photo is pressed and dragged', () => {
    picker().getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    act(() => {
      picker().dispatchEvent(
        new MouseEvent('pointerdown', {
          clientX: 150,
          clientY: 25,
          button: 0,
          bubbles: true,
        })
      );
    });
    expect(picker().getAttribute('aria-valuetext')).toBe(
      'Links 75%, boven 25%'
    );
    act(() => {
      picker().dispatchEvent(
        new MouseEvent('pointermove', {
          clientX: 50,
          clientY: 90,
          bubbles: true,
        })
      );
    });
    expect(picker().getAttribute('aria-valuetext')).toBe(
      'Links 25%, boven 90%'
    );
    act(() => {
      picker().dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
      picker().dispatchEvent(
        new MouseEvent('pointermove', { clientX: 0, clientY: 0, bubbles: true })
      );
    });
    expect(picker().getAttribute('aria-valuetext')).toBe(
      'Links 25%, boven 90%'
    );
  });

  it('takes typed values, clamped to 0–100, and saves them', () => {
    typeInto(field('focal-point-left'), '120');
    typeInto(field('focal-point-top'), '5');
    act(() => button('Opslaan').click());
    expect(onSave).toHaveBeenCalledWith({ x: 100, y: 5 });
  });

  it('keeps the point while a number field is empty', () => {
    typeInto(field('focal-point-left'), '');
    expect(field('focal-point-left').value).toBe('');
    act(() => button('Opslaan').click());
    expect(onSave).toHaveBeenCalledWith({ x: 20, y: 30 });
  });

  it('resets to the middle with "Herstellen naar midden"', () => {
    act(() => button('Herstellen naar midden').click());
    expect(onSave).toHaveBeenCalledWith(null);
  });
});
