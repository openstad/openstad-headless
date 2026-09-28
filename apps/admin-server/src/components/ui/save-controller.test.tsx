// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SaveControllerProvider,
  useRegisterSave,
  useSaveController,
} from './save-controller';

// A mitt-style emitter, like the one next/router exposes as `router.events`:
// handlers run in registration order and a throwing handler aborts the emit.
const router = vi.hoisted(() => {
  const handlers = new Map<string, Array<(...args: any[]) => void>>();
  return {
    events: {
      on(type: string, handler: (...args: any[]) => void) {
        handlers.set(type, [...(handlers.get(type) ?? []), handler]);
      },
      off(type: string, handler: (...args: any[]) => void) {
        handlers.set(
          type,
          (handlers.get(type) ?? []).filter((h) => h !== handler)
        );
      },
      emit(type: string, ...args: any[]) {
        (handlers.get(type) ?? []).slice().forEach((h) => h(...args));
      },
    },
  };
});

vi.mock('next/router', () => ({ useRouter: () => router }));

// React's `act` needs this flag to suppress its "not wrapped in act" warning.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Controller = ReturnType<typeof useSaveController>;

function Probe({
  isDirty,
  save,
  onController,
}: {
  isDirty: boolean;
  save: () => Promise<void>;
  onController: (controller: Controller) => void;
}) {
  useRegisterSave({ isDirty, save });
  onController(useSaveController());
  return null;
}

describe('SaveControllerProvider', () => {
  let container: HTMLDivElement;
  let root: Root;
  let controller: Controller;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  function mount(isDirty: boolean, save: () => Promise<void>) {
    act(() => {
      root.render(
        <SaveControllerProvider>
          <Probe
            isDirty={isDirty}
            save={save}
            onController={(c) => {
              controller = c;
            }}
          />
        </SaveControllerProvider>
      );
    });
  }

  // The unsaved-changes guard aborts a navigation by throwing from its
  // routeChangeStart handler, the same way next/router expects it to.
  function startNavigation(): 'allowed' | 'blocked' {
    try {
      act(() => router.events.emit('routeChangeStart', '/elsewhere'));
      return 'allowed';
    } catch {
      return 'blocked';
    }
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    confirmSpy.mockRestore();
  });

  describe('allowNextNavigation', () => {
    it('lets the guard block a navigation away from unsaved changes', () => {
      mount(true, vi.fn().mockResolvedValue(undefined));

      expect(startNavigation()).toBe('blocked');
      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    it('skips the unsaved-changes prompt for exactly one navigation', () => {
      mount(true, vi.fn().mockResolvedValue(undefined));

      act(() => controller.allowNextNavigation());
      expect(startNavigation()).toBe('allowed');
      expect(confirmSpy).not.toHaveBeenCalled();

      act(() => router.events.emit('routeChangeComplete', '/elsewhere'));
      expect(startNavigation()).toBe('blocked');
      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    it('clears the flag when the navigation fails', () => {
      mount(true, vi.fn().mockResolvedValue(undefined));

      act(() => controller.allowNextNavigation());
      act(() => router.events.emit('routeChangeError'));

      expect(startNavigation()).toBe('blocked');
    });
  });

  describe('triggerSave', () => {
    it('runs one save at a time when triggered twice in a row', async () => {
      let finishSave: () => void = () => {};
      const save = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finishSave = resolve;
          })
      );
      mount(true, save);

      act(() => {
        controller.triggerSave();
        controller.triggerSave();
      });
      expect(save).toHaveBeenCalledTimes(1);

      await act(async () => finishSave());

      // Still dirty after the first save, so a new trigger saves again.
      act(() => controller.triggerSave());
      expect(save).toHaveBeenCalledTimes(2);
    });

    it('does nothing when no registered form is dirty', () => {
      const save = vi.fn().mockResolvedValue(undefined);
      mount(false, save);

      act(() => controller.triggerSave());

      expect(save).not.toHaveBeenCalled();
    });
  });
});
