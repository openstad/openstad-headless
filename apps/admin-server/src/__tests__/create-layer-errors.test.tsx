// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import CreateLayer from '@/pages/projects/[project]/areas/create-layer';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2' },
    pathname: '/projects/[project]/areas/create-layer',
    events: { on() {}, off() {}, emit() {} },
    push() {},
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('react-hot-toast', () => ({ default: toast }));

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

describe('Kaartlaag aanmaken: what a failed save says', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    toast.success.mockClear();
    toast.error.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.stubGlobal('fetch', async (_url: string, init?: any) => {
      if (init?.method === 'POST') {
        return {
          ok: false,
          status: 502,
          json: async () => {
            throw new SyntaxError("Unexpected token '<'");
          },
        };
      }
      return { ok: true, status: 200, json: async () => [] };
    });
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <CreateLayer />
        </SaveControllerProvider>
      )
    );
    await settle();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function type(selector: string, value: string) {
    type Field = HTMLInputElement | HTMLTextAreaElement;
    const element = container.querySelector(selector) as Field;
    const prototype =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    act(() => {
      Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(
        element,
        value
      );
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  async function save() {
    const button = Array.from(container.querySelectorAll('button')).find(
      (candidate) => candidate.textContent === 'Opslaan'
    ) as HTMLButtonElement;
    act(() => button.click());
    await settle();
  }

  it('keeps its own save button instead of joining the save bar', () => {
    expect(controller.isRegistered).toBe(false);
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.textContent === 'Opslaan'
      )
    ).toBe(true);
  });

  it('names the failed create when the server answers with an error page', async () => {
    type('input[name="name"]', 'Laag');
    type('textarea[name="layer"]', '{"type":"FeatureCollection"}');
    await settle();

    await save();

    expect(toast.error).toHaveBeenCalledWith(
      'De kaartlaag kon niet worden aangemaakt.'
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does not report success when the server answers with an error', async () => {
    vi.stubGlobal('fetch', async (_url: string, init?: any) =>
      init?.method === 'POST'
        ? {
            ok: false,
            status: 500,
            json: async () => ({
              status: 500,
              message: 'Er is iets misgegaan',
            }),
          }
        : { ok: true, status: 200, json: async () => [] }
    );
    type('input[name="name"]', 'Laag');
    type('textarea[name="layer"]', '{"type":"FeatureCollection"}');
    await settle();

    await save();

    expect(toast.error).toHaveBeenCalledWith(
      'De kaartlaag kon niet worden aangemaakt.'
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('still says the layer is not valid JSON when it is not', async () => {
    type('input[name="name"]', 'Laag');
    type('textarea[name="layer"]', '{niet goed');
    await settle();

    await save();

    expect(toast.error).toHaveBeenCalledWith(
      'Een veld bevat geen geldige JSON (bijvoorbeeld de polygoon of de kaartlaag). Controleer de invoer en probeer het opnieuw.'
    );
  });
});
