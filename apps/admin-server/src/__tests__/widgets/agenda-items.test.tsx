// @vitest-environment jsdom
// Lives outside src/pages/** on purpose: every file under the pages router is
// a route, and a test file there breaks `next build` ("failed to collect page
// data"), which `next dev` never surfaces.
import WidgetAgendaItems from '@/pages/projects/[project]/widgets/agenda/[id]/items';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

// React's `act` needs this flag to suppress its "not wrapped in act" warning.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('WidgetAgendaItems', () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = undefined;
    container = undefined;
  });

  function render(props: any) {
    container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      root = createRoot(container!);
      root.render(<WidgetAgendaItems {...props} />);
    });
  }

  const savedItem = {
    trigger: '1',
    title: 'Bijeenkomst',
    description: '',
    active: true,
  };

  it('opening the Items tab does not write to the widget draft', () => {
    const onFieldChanged = vi.fn();

    render({
      items: [savedItem],
      onFieldChanged,
      updateConfig: vi.fn(),
    });

    // Seeding is not an edit: a mount-time write used to push an empty list,
    // which the global save bar then persisted over the saved items.
    expect(onFieldChanged).not.toHaveBeenCalled();
  });

  it('shows the saved items instead of an empty list', () => {
    render({
      items: [savedItem],
      onFieldChanged: vi.fn(),
      updateConfig: vi.fn(),
    });

    expect(container!.textContent).toContain('Bijeenkomst');
  });
});
