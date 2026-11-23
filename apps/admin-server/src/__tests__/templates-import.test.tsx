/** @vitest-environment jsdom */
import { REFUSED_BY_SERVER } from '@/lib/read-json';
import Templates from '@/pages/templates';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  createTemplate: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    events: { on() {}, off() {}, emit() {} },
  }),
}));
vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('react-hot-toast', () => ({ default: mocks.toast }));
vi.mock('@/hooks/use-template', () => ({
  default: () => ({
    data: [],
    createTemplate: mocks.createTemplate,
    renameTemplate: vi.fn(),
    removeTemplate: vi.fn(),
  }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const INVALID_FILE =
  'Dit bestand is geen geldig templatebestand. Kies een bestand dat je via Exporteren hebt opgeslagen.';

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });

function setName(container: HTMLElement, value: string) {
  const input = container.querySelector(
    '#import-template-name'
  ) as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function chooseFile(container: HTMLElement, content: string) {
  const input = container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  const file = new File([content], 'template.json', {
    type: 'application/json',
  });
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  act(() => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await settle();
}

async function submitImport(container: HTMLElement) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent === 'Importeren'
  ) as HTMLButtonElement;
  await act(async () => {
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  await settle();
}

describe('importing a template', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mocks.toast.success.mockReset();
    mocks.toast.error.mockReset();
    mocks.createTemplate.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<Templates />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('says the file is not a template file when it is not JSON', async () => {
    setName(container, 'test ian import');
    await chooseFile(container, 'dit is geen json');
    await submitImport(container);

    expect(mocks.createTemplate).not.toHaveBeenCalled();
    expect(mocks.toast.error).toHaveBeenCalledWith(INVALID_FILE);
  });

  it('says importing failed and why when the server refuses it', async () => {
    mocks.createTemplate.mockRejectedValue(new Error(REFUSED_BY_SERVER));
    setName(container, 'test ian import');
    await chooseFile(
      container,
      JSON.stringify({ name: 'Template project', data: { title: 'x' } })
    );
    await submitImport(container);

    expect(mocks.toast.error).toHaveBeenCalledWith(
      `Importeren is niet gelukt. ${REFUSED_BY_SERVER}`
    );
    expect(mocks.toast.error).not.toHaveBeenCalledWith(INVALID_FILE);
  });

  it('imports the data of an exported template', async () => {
    mocks.createTemplate.mockResolvedValue({ id: 3 });
    setName(container, 'test ian import');
    await chooseFile(
      container,
      JSON.stringify(
        { name: 'Template project', data: { title: 'x' } },
        null,
        2
      )
    );
    await submitImport(container);

    expect(mocks.createTemplate).toHaveBeenCalledWith('test ian import', {
      title: 'x',
    });
    expect(mocks.toast.success).toHaveBeenCalledWith('Template geïmporteerd.');
    expect(mocks.toast.error).not.toHaveBeenCalled();
  });
});

describe('useTemplates().createTemplate', () => {
  let container: HTMLDivElement;
  let root: Root;
  let createTemplate: (name: string, data: any) => Promise<any>;

  beforeEach(async () => {
    const { default: useTemplates } = await vi.importActual<
      typeof import('@/hooks/use-template')
    >('@/hooks/use-template');
    function Probe() {
      createTemplate = useTemplates().createTemplate;
      return null;
    }
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<Probe />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('says the server refused it for an empty 403', async () => {
    (globalThis as any).fetch = vi.fn(
      async () => new Response('', { status: 403 })
    );
    await expect(createTemplate('test ian', { title: 'x' })).rejects.toThrow(
      REFUSED_BY_SERVER
    );
  });

  it('passes on the message the API sends with an error', async () => {
    (globalThis as any).fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ message: 'Geen geldige template-data opgegeven' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    );
    await expect(createTemplate('test ian', { title: 'x' })).rejects.toThrow(
      'Geen geldige template-data opgegeven'
    );
  });
});
