// @vitest-environment jsdom
import ResourceForm from '@/components/resource-form';
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const resource = vi.hoisted(() => ({ data: undefined as any }));
const calendar = vi.hoisted(() => ({
  next: undefined as Date | null | undefined,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '82' },
    pathname: '/projects/[project]/resources/[id]',
    events: { on() {}, off() {}, emit() {} },
    push() {},
  }),
}));

vi.mock('next/dynamic', () => ({
  default: () => (props: any) => (
    <textarea
      data-editor
      value={props.value ?? ''}
      onChange={(event) => props.onChange?.(event.target.value)}
    />
  ),
}));

vi.mock('@/components/maps/leaflet-input', () => ({ default: () => null }));
vi.mock('@/components/maps/map-error-boundary', () => ({
  MapErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock('@/components/image-gallery-style', () => ({ default: () => null }));
vi.mock('@/components/image-uploader', () => ({ ImageUploader: () => null }));
vi.mock('@/components/document-uploader', () => ({
  DocumentUploader: () => null,
}));
vi.mock('@/components/ui/code-editor', () => ({ CodeEditor: () => null }));
vi.mock('@/components/simple-calender-popup', () => ({
  SimpleCalendar: ({ form, fieldName }: any) => (
    <button
      type="button"
      data-calendar={fieldName}
      onClick={() =>
        form.setValue(fieldName, calendar.next, { shouldDirty: true })
      }
    />
  ),
}));
vi.mock('@/hooks/use-project', () => ({
  useProject: () => ({ data: { config: {} } }),
}));
vi.mock('@/hooks/use-resource', () => ({
  default: () => ({
    data: resource.data,
    error: undefined,
    mutate: async () => resource.data,
  }),
}));
vi.mock('@/hooks/use-tags', () => ({ default: () => ({ data: [] }) }));
vi.mock('@/hooks/use-statuses', () => ({ default: () => ({ data: [] }) }));
vi.mock('react-hot-toast', () => ({ default: { success() {}, error() {} } }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

let controller: ReturnType<typeof useSaveController>;

function Bar() {
  controller = useSaveController();
  return null;
}

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

const CONCEPT = {
  id: 82,
  title: 'Een concept inzending',
  summary: 'Een samenvatting die lang genoeg is',
  description: 'Beschrijving '.repeat(15),
  publishDate: null,
  images: [{ url: 'https://example.org/a.png' }],
  tags: [],
  statuses: [],
  extraData: {},
};

describe('editing a concept resource', () => {
  let container: HTMLDivElement;
  let root: Root;
  let submitted: any[];

  const render = () =>
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <ResourceForm
            useGlobalSave
            onFormSubmit={async (values: any) => {
              submitted.push(values);
            }}
          />
        </SaveControllerProvider>
      )
    );

  beforeEach(async () => {
    submitted = [];
    resource.data = { ...CONCEPT };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    render();
    await settle();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function typeTitle(value: string) {
    const input = container.querySelector(
      'input[name="title"]'
    ) as HTMLInputElement;
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )!.set!.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  async function save() {
    act(() => controller.triggerSave());
    await settle();
    await settle();
  }

  it('keeps it a concept when only the title changes', async () => {
    typeTitle('Een aangepaste titel');
    await settle();

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(submitted).toHaveLength(1);
    expect(submitted[0].publishDate ?? null).toBeNull();
  });

  it('stays a concept after unpublishing, reloading and editing again', async () => {
    resource.data = {
      ...CONCEPT,
      publishDate: '2026-01-01T09:00:00.000Z',
    };
    render();
    await settle();
    calendar.next = null;
    act(() =>
      (
        container.querySelector(
          '[data-calendar="publishDate"]'
        ) as HTMLButtonElement
      ).click()
    );
    await settle();
    await save();
    expect(submitted[0].publishDate ?? null).toBeNull();

    resource.data = { ...CONCEPT };
    render();
    await settle();
    typeTitle('Nog een andere titel');
    await settle();
    await save();

    expect(submitted).toHaveLength(2);
    expect(submitted[1].publishDate ?? null).toBeNull();
  });

  it('names the image remove button and hides its icon', () => {
    const button = container.querySelector(
      'button[aria-label="Afbeelding verwijderen"]'
    );
    expect(button).not.toBeNull();
    expect(button!.querySelector('svg')!.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  for (const publishDate of ['2026-01-01T09:00:00.000Z', null]) {
    it(`keeps the stored values when they arrive after the page opened (publish date ${publishDate})`, async () => {
      act(() => root.unmount());
      resource.data = undefined;
      root = createRoot(container);
      render();
      await settle();
      resource.data = {
        ...CONCEPT,
        budget: 5000,
        startDate: '2025-12-01T00:00:00.000Z',
        publishDate,
      };
      render();
      await settle();
      expect(controller.state).not.toBe('dirty');

      typeTitle('Een aangepaste titel');
      await settle();
      await save();

      const sent = submitted[0];
      expect(sent.budget).toBe(5000);
      expect(new Date(sent.startDate).toISOString()).toBe(
        '2025-12-01T00:00:00.000Z'
      );
      expect(
        sent.publishDate ? new Date(sent.publishDate).toISOString() : null
      ).toBe(publishDate);
    });
  }
});
