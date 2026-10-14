// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import CreateProject from '@/pages/projects/create';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  const pushes: string[] = [];
  const router = {
    query: {},
    pathname: '/projects/create',
    asPath: '/projects/create',
    isReady: true,
    events,
    pushes,
    push: async (url: string) => {
      events.emit('routeChangeStart', url);
      pushes.push(url);
      events.emit('routeChangeComplete', url);
      return true;
    },
  };
  return { router };
});

vi.mock('next/router', () => ({
  default: nav.router,
  useRouter: () => nav.router,
}));
vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/hooks/use-project', () => ({
  useProject: () => ({
    createProject: async () => ({ id: 50 }),
    importProject: async () => ({ id: 51 }),
  }),
}));
vi.mock('react-hot-toast', () => ({
  default: { success() {}, error() {} },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let controller: ReturnType<typeof useSaveController>;
function Bar() {
  controller = useSaveController();
  return null;
}
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });

function setInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('creating a project', () => {
  let container: HTMLDivElement;
  let root: Root;
  let confirmSpy: any;

  beforeEach(() => {
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    nav.router.pushes.length = 0;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    confirmSpy.mockRestore();
  });

  it('creates an empty project with its own save button', async () => {
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <CreateProject />
        </SaveControllerProvider>
      )
    );
    await settle();
    const input = container.querySelector(
      'input[placeholder="Naam"]'
    ) as HTMLInputElement;
    setInput(input, 'Mijn nieuw project');
    await settle();
    const save = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Opslaan'
    ) as HTMLButtonElement;
    await act(async () => {
      save.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    await settle();

    expect(controller.isRegistered).toBe(false);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(nav.router.pushes).toEqual(['/projects/50/settings']);
  });
});
