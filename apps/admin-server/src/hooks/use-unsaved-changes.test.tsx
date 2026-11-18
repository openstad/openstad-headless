// @vitest-environment jsdom
import { act, useEffect } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useUnsavedChanges from './use-unsaved-changes';

const nav = vi.hoisted(() => {
  const handlers: Record<string, Array<(...a: any[]) => void>> = {};
  const events = {
    on(e: string, h: any) {
      (handlers[e] ||= []).push(h);
    },
    off(e: string, h: any) {
      handlers[e] = (handlers[e] || []).filter((x) => x !== h);
    },
    emit(e: string, ...a: any[]) {
      (handlers[e] || []).slice().forEach((h) => h(...a));
    },
  };
  return { router: { events } };
});

vi.mock('next/router', () => ({
  default: nav.router,
  useRouter: () => nav.router,
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function EditedPage() {
  const { setSavedState, getCurrentStateRef } = useUnsavedChanges();
  getCurrentStateRef.current = () => ({ title: 'Nieuwe titel' });
  useEffect(() => {
    setSavedState({ title: 'Titel' });
  }, [setSavedState]);
  return null;
}

describe('useUnsavedChanges', () => {
  let container: HTMLDivElement;
  let root: Root;
  let confirmSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<EditedPage />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('asks before leaving a page with unsaved changes', () => {
    nav.router.events.emit('routeChangeStart', '/projects/2/resources', {
      shallow: false,
    });

    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('does not ask when the page only changes its query shallowly', () => {
    nav.router.events.emit(
      'routeChangeStart',
      '/projects/2/resources/1?tab=votes',
      { shallow: true }
    );

    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
