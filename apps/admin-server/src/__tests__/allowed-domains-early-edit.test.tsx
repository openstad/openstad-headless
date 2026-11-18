// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import AllowedDomains from '@/pages/projects/[project]/settings/alloweddomains';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const project = vi.hoisted(() => ({
  data: undefined as any,
  puts: [] as any[],
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2' },
    pathname: '/projects/[project]/settings/alloweddomains',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/use-project', () => ({
  useProject: () => ({
    data: project.data,
    updateProject: async (config: unknown) => {
      project.puts.push(config);
      return { id: 2 };
    },
  }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let controller: ReturnType<typeof useSaveController>;

function Bar() {
  controller = useSaveController();
  return null;
}

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

describe('Toegestane websites', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = () =>
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <AllowedDomains />
        </SaveControllerProvider>
      )
    );

  beforeEach(() => {
    project.puts = [];
    project.data = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const urls = () =>
    Array.from(
      container.querySelectorAll('input[placeholder="voorbeeld.nl"]')
    ).map((input) => (input as HTMLInputElement).value);

  it('keeps the stored domains when one was added before they loaded', async () => {
    render();
    await settle();
    const add = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'URL toevoegen'
    ) as HTMLButtonElement;
    act(() => add.click());
    await settle();
    const input = container.querySelector(
      'input[placeholder="voorbeeld.nl"]'
    ) as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setValue.call(input, 'nieuw.nl');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await settle();

    project.data = { url: '', config: { allowedDomains: ['a.nl', 'b.nl'] } };
    render();
    await settle();

    expect(urls()).toEqual(['a.nl', 'b.nl', 'nieuw.nl']);
    expect(controller.state).toBe('dirty');
    act(() => controller.triggerSave());
    await settle();

    expect(controller.errorMessage).toBeNull();
    expect(project.puts[0]).toEqual({
      allowedDomains: ['a.nl', 'b.nl', 'nieuw.nl'],
    });
  });
});
