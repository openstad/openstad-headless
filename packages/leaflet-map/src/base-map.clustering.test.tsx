// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { BaseMap } from './base-map';

vi.mock('@openstad-headless/data-store/src', () => {
  const stable = { data: [] as any[] };
  return {
    default: class {
      useDatalayer() {
        return (globalThis as any).__dataLayerResult || stable;
      }
      useMarkers() {
        return { data: (globalThis as any).__markerSets || [] };
      }
      useAreas() {
        return stable;
      }
    },
  };
});
vi.mock('@openstad-headless/document-map/src/gesture', () => ({}));

const markers = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    markerId: `m${i}`,
    lat: 52.51 + (i % 10) * 0.0005,
    lng: 6.09 + Math.floor(i / 10) * 0.0005,
  }));

let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLElement | undefined;

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 800,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 600,
  });
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  (globalThis as any).__markerSets = undefined;
  (globalThis as any).__dataLayerResult = undefined;
});

async function renderMap(props: Record<string, any>) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  let commits = 0;
  await act(async () => {
    root!.render(
      <React.Profiler id="map" onRender={() => commits++}>
        <BaseMap projectId="2" api={{ url: 'http://x' }} {...props} />
      </React.Profiler>
    );
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
  return commits;
}

describe('BaseMap with clustering and an extreme project maxZoom', () => {
  const extreme = { clustering: 'high', maxZoom: '201', minZoom: '7' };

  it.each([0, 1, 50])(
    'settles with %i markers',
    async (n) => {
      const commits = await renderMap({
        map: extreme,
        ...extreme,
        markers: markers(n),
      });
      expect(container!.querySelector('.leaflet-container')).not.toBeNull();
      expect(commits).toBeLessThan(20);
      if (n > 0) {
        expect(
          container!.querySelectorAll('.leaflet-marker-icon').length
        ).toBeGreaterThan(0);
      }
    },
    5000
  );

  it('settles with marker sets only', async () => {
    (globalThis as any).__markerSets = [{ id: 1, markers: markers(20) }];
    const commits = await renderMap({
      map: extreme,
      ...extreme,
      markers: [],
      markerSets: [{ id: 1 }],
    });
    expect(container!.querySelector('.leaflet-container')).not.toBeNull();
    expect(commits).toBeLessThan(20);
  }, 5000);

  it('still settles with clustering off', async () => {
    const commits = await renderMap({
      map: { ...extreme, clustering: 'off' },
      ...extreme,
      markers: markers(50),
    });
    expect(container!.querySelector('.leaflet-container')).not.toBeNull();
    expect(commits).toBeLessThan(20);
  }, 5000);
});

describe('BaseMap clusters all map markers together', () => {
  const spot = (prefix: string, n: number) =>
    Array.from({ length: n }, (_, i) => ({
      markerId: `${prefix}${i}`,
      lat: 52.51,
      lng: 6.09,
    }));

  async function clusterCounts(props: Record<string, any>) {
    await renderMap({
      map: { clustering: 'high' },
      center: { lat: 52.51, lng: 6.09 },
      zoom: 12,
      ...props,
    });
    return Array.from(
      container!.querySelectorAll('.osc-map-marker-cluster .sr-only')
    ).map((el) => el.textContent?.match(/\d+/)?.[0]);
  }

  it('counts submissions and marker-set markers in one cluster', async () => {
    (globalThis as any).__markerSets = [{ id: 1, markers: spot('s', 10) }];
    const counts = await clusterCounts({
      markers: spot('r', 20),
      markerSets: [{ id: 1 }],
    });
    expect(counts).toEqual(['30']);
  }, 5000);

  it('counts data-layer markers in the same cluster', async () => {
    (globalThis as any).__dataLayerResult = {
      data: [
        {
          id: 7,
          icon: [{ url: 'http://x/icon.png' }],
          layer: {
            features: Array.from({ length: 10 }, (_, i) => ({
              geometry: { type: 'Point', coordinates: [6.09, 52.51] },
              properties: { Objectnaam: `boom ${i}` },
            })),
          },
        },
      ],
    };
    const counts = await clusterCounts({
      markers: spot('r', 20),
      dataLayerSettings: { datalayer: [{ id: 7, name: 'Bomen' }] },
    });
    expect(counts).toEqual(['30']);
  }, 5000);
});
