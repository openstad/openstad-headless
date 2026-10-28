// @vitest-environment jsdom
import MarkersEditor from '@/components/markers-editor';
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '1' },
    pathname: '/projects/[project]/areas/markers/[id]',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TileLayer: () => null,
  Marker: () => null,
  useMapEvents: () => null,
}));

vi.mock('@/components/image-uploader', () => ({ ImageUploader: () => null }));

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

describe('Markers bewerken: the name error', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <MarkersEditor
            initialName="Markers"
            initialMarkers={[]}
            project="2"
            onSave={async () => {}}
            useGlobalSave
          />
        </SaveControllerProvider>
      )
    );
    await settle();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function typeName(value: string) {
    const input = container.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )!.set!.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('clears "Naam is verplicht" once the name is filled in again', async () => {
    typeName('');
    await settle();
    act(() => controller.triggerSave());
    await settle();
    expect(controller.errorMessage).toBe('Controleer de gemarkeerde velden.');
    expect(container.textContent).toContain('Naam is verplicht');

    typeName('Nieuwe naam');
    await settle();

    expect(container.textContent).not.toContain('Naam is verplicht');
  });
});
