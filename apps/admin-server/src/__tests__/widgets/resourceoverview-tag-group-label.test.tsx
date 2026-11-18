// @vitest-environment jsdom
import WidgetResourceOverviewTags from '@/pages/projects/[project]/widgets/resourceoverview/[id]/tags';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '1' },
    events: { on() {}, off() {}, emit() {} },
  }),
}));

const tags = vi.hoisted(() => ({
  data: [
    { id: 1, name: 'Groen', type: 'thema', projectId: 2 },
    { id: 2, name: 'Noord', type: 'gebied', projectId: 2 },
  ],
}));

vi.mock('@/hooks/use-tags', () => ({ default: () => tags }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Groep label on the overview Tags tab', () => {
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

  function labelInput(group: string) {
    return container.querySelector(
      `input[placeholder="Groep label"][name="${group}"]`
    ) as HTMLInputElement;
  }

  it('shows the saved label and changes only that group, without touching the stored list', async () => {
    const tagGroups = [
      { type: 'thema', label: 'Kies een thema', multiple: false },
      { type: 'gebied', label: 'Kies een gebied', multiple: true },
    ];
    const onFieldChanged = vi.fn();
    act(() =>
      root.render(
        <WidgetResourceOverviewTags
          {...({ projectId: '2', tagGroups } as any)}
          updateConfig={() => {}}
          onFieldChanged={onFieldChanged}
        />
      )
    );
    await act(async () => {});

    expect(labelInput('thema').value).toBe('Kies een thema');
    expect(labelInput('gebied').value).toBe('Kies een gebied');

    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setValue.call(labelInput('thema'), 'Thema');
      labelInput('thema').dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    expect(labelInput('thema').value).toBe('Thema');
    expect(onFieldChanged).toHaveBeenCalledWith('tagGroups', [
      { type: 'thema', label: 'Thema', multiple: false },
      { type: 'gebied', label: 'Kies een gebied', multiple: true },
    ]);
    expect(tagGroups[0].label).toBe('Kies een thema');
  });
});
