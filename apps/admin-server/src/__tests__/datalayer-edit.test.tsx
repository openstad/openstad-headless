// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import DatalayerEdit from '@/pages/projects/[project]/areas/layers/[id]/index';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const layer = vi.hoisted(() => ({
  data: undefined as any,
  saved: [] as any[],
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '13', id: '23' },
    pathname: '/projects/[project]/areas/layers/[id]',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/image-uploader', () => ({ ImageUploader: () => null }));

vi.mock('@/hooks/use-datalayer', () => ({
  default: () => ({
    data: layer.data,
    isLoading: false,
    updateDatalayer: async (...args: unknown[]) => {
      layer.saved.push(args);
      return { id: 23 };
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

describe('Kaartlaag aanpassen', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('saves a layer that has no icon', async () => {
    layer.saved = [];
    layer.data = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const render = () =>
      act(() =>
        root.render(
          <SaveControllerProvider>
            <Bar />
            <DatalayerEdit />
          </SaveControllerProvider>
        )
      );
    render();
    await settle();
    // The layer arrives after the page has rendered, as in the browser.
    layer.data = { id: 23, name: 'Laag', layer: { type: 'FeatureCollection' } };
    render();
    await settle();

    const input = container.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setValue.call(input, 'Laag 2');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await settle();
    act(() => controller.triggerSave());
    await settle();

    expect(controller.errorMessage).toBeNull();
    expect(layer.saved).toHaveLength(1);
    expect(layer.saved[0][0]).toBe('Laag 2');
    expect(layer.saved[0][2]).toEqual([]);
  });
});
