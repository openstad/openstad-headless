// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useLastDefined } from './use-last-defined';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let result: unknown;

function Probe({ value, resetKey }: { value: unknown; resetKey?: unknown }) {
  result = useLastDefined(value, resetKey);
  return null;
}

describe('useLastDefined', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('is undefined until a value arrives', () => {
    act(() => root.render(<Probe value={undefined} resetKey="2" />));
    expect(result).toBeUndefined();
  });

  it('keeps the last value while the new one is undefined', () => {
    const loaded = { fromEmail: 'a@example.org' };
    act(() => root.render(<Probe value={loaded} resetKey="2" />));
    act(() => root.render(<Probe value={undefined} resetKey="2" />));
    expect(result).toBe(loaded);

    const fresh = { fromEmail: 'b@example.org' };
    act(() => root.render(<Probe value={fresh} resetKey="2" />));
    expect(result).toBe(fresh);
  });

  it('forgets the last value when the reset key changes', () => {
    act(() => root.render(<Probe value={{ a: 1 }} resetKey="2" />));
    act(() => root.render(<Probe value={undefined} resetKey="13" />));
    expect(result).toBeUndefined();
  });
});
