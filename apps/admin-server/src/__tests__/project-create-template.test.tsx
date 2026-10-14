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
vi.mock('@/hooks/use-template', () => ({
  default: () => ({
    data: [{ id: 7, name: 'Standaard', data: { config: {} } }],
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

function setInput(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto =
    el instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(
      new Event(el instanceof HTMLSelectElement ? 'change' : 'input', {
        bubbles: true,
      })
    );
  });
}

describe('creating a project from a template', () => {
  let container: HTMLDivElement;
  let root: Root;
  let confirmSpy: any;
  let posts: number;

  beforeEach(() => {
    posts = 0;
    (globalThis as any).fetch = vi.fn(async (url: string) => {
      if (url === '/api/openstad/api/project') posts += 1;
      return { ok: true, json: async () => 99 };
    });
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

  it('goes to the new project without asking, also when the top form has a name', async () => {
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <CreateProject />
        </SaveControllerProvider>
      )
    );
    await settle();
    const inputs = Array.from(
      container.querySelectorAll('input[placeholder="Naam"]')
    ) as HTMLInputElement[];
    setInput(inputs[0], 'Mijn nieuw project');
    await settle();
    expect(controller.isRegistered).toBe(false);
    expect(controller.state).toBe('neutral');
    setInput(container.querySelector('select') as HTMLSelectElement, '7');
    setInput(inputs[1], 'Project uit template');
    await settle();
    const submit = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Aanmaken'
    ) as HTMLButtonElement;
    await act(async () => {
      submit.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    await settle();

    expect(posts).toBe(1);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(nav.router.pushes).toEqual(['/projects/99/widgets']);
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
