// @vitest-environment jsdom
import MarkersEditor from '@/components/markers-editor';
import { SaveControllerProvider } from '@/components/ui/save-controller';
import { StrictMode, act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '1' },
    pathname: '/projects/[project]/areas/markers/[id]',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/image-uploader', () => ({ ImageUploader: () => null }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

describe('Markers bewerken: the map in strict mode', () => {
  let container: HTMLDivElement;
  let root: Root;
  let uncaught: unknown[];

  beforeEach(() => {
    uncaught = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container, {
      onUncaughtError: (error) => uncaught.push(error),
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the map without a second initialisation error', async () => {
    act(() =>
      root.render(
        <StrictMode>
          <SaveControllerProvider>
            <MarkersEditor
              initialName="Markers"
              initialMarkers={[{ lat: 52.1, lng: 4.6 } as any]}
              project="2"
              onSave={async () => {}}
              useGlobalSave
            />
          </SaveControllerProvider>
        </StrictMode>
      )
    );
    await settle();

    expect(uncaught).toEqual([]);
    expect(container.querySelector('.leaflet-container')).not.toBeNull();
  });
});
