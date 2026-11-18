// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePageKey } from './use-page-key';

const router = {
  isReady: false,
  pathname: '/projects/[project]/widgets/agenda/[id]',
  query: {} as Record<string, string>,
};
vi.mock('next/router', () => ({ useRouter: () => router }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let key = '';
function App() {
  key = usePageKey();
  return null;
}

describe('usePageKey', () => {
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

  const show = (isReady: boolean, query: Record<string, string>) => {
    router.isReady = isReady;
    router.query = query;
    act(() => root.render(<App />));
    return key;
  };

  it('keeps the first key when the query arrives after loading', () => {
    expect(show(false, {})).toBe('');
    expect(show(true, { project: '2', id: '70' })).toBe('');
  });

  it('changes the key for another record, and back for the first one', () => {
    show(true, { project: '2', id: '70' });
    expect(show(true, { project: '2', id: '71' })).not.toBe('');
    expect(show(true, { project: '2', id: '70' })).toBe('');
  });

  it('keeps the key when only a tab in the query changes', () => {
    show(true, { project: '2', id: '70' });
    expect(show(true, { project: '2', id: '70', tab: 'items' })).toBe('');
  });
});
