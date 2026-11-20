/** @vitest-environment jsdom */
import WidgetResourceOverviewDisplay from '@/pages/projects/[project]/widgets/resourceoverview/[id]/display';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '1' },
    events: { on() {}, off() {}, emit() {} },
  }),
}));

const tags = vi.hoisted(() => ({ data: [] }));

vi.mock('@/hooks/use-tags', () => ({ default: () => tags }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const locationFields = [
  'Label voor het postcodeveld',
  'Hint onder het postcodeveld weergeven',
  'Tekst voor postcodeveld placeholder',
];
const locationHintText = 'Hinttekst voor het postcodeveld';
const streetFields = [
  'Label voor het straatfilter',
  'Hint onder het straatfilter weergeven',
  'Tekst voor straatfilter placeholder',
];
const streetHintText = 'Hinttekst voor het straatfilter';

describe('postcode and street filter fields on the overview Weergave tab', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function renderWith(config: Record<string, unknown>) {
    act(() =>
      root.render(
        <WidgetResourceOverviewDisplay
          {...({ projectId: '2', ...config } as any)}
          updateConfig={() => {}}
          onFieldChanged={vi.fn()}
        />
      )
    );
    await act(async () => {});
    return Array.from(container.querySelectorAll('form label')).map((label) =>
      label.textContent?.trim()
    );
  }

  it('hides the filter settings while both filters are off', async () => {
    const labels = await renderWith({
      displayLocationFilter: false,
      displayStreetFilter: false,
    });

    expect(labels).toContain('Locatie filter weergeven');
    expect(labels).toContain('Straatfilter weergeven');
    for (const field of [
      ...locationFields,
      locationHintText,
      ...streetFields,
      streetHintText,
    ]) {
      expect(labels).not.toContain(field);
    }
  });

  it('shows the filter settings, but not the hint text, when only the filters are on', async () => {
    const labels = await renderWith({
      displayLocationFilter: true,
      displayStreetFilter: true,
    });

    for (const field of [...locationFields, ...streetFields]) {
      expect(labels).toContain(field);
    }
    expect(labels).not.toContain(locationHintText);
    expect(labels).not.toContain(streetHintText);
  });

  it('shows the hint text once its hint is switched on', async () => {
    const labels = await renderWith({
      displayLocationFilter: true,
      displayLocationHint: true,
      displayStreetFilter: true,
      displayStreetFilterHint: true,
    });

    expect(labels).toContain(locationHintText);
    expect(labels).toContain(streetHintText);
  });
});
