// @vitest-environment jsdom
import WidgetRawGeneral from '@/pages/projects/[project]/widgets/rawresource/[id]/general';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '182' },
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/hooks/use-resources', () => ({
  default: () => ({ data: [{ id: 32, title: 'Plan 32' }] }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Raw resource relative path rule', () => {
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

  async function submit(props: Record<string, string>) {
    const updateConfig = vi.fn();
    act(() =>
      root.render(
        <WidgetRawGeneral
          {...(props as any)}
          updateConfig={updateConfig}
          onFieldChanged={() => {}}
        />
      )
    );
    await act(async () => {});
    await act(async () => {
      container
        .querySelector('form')!
        .dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    return updateConfig;
  }

  it('saves when a resource is linked and the hidden path is invalid', async () => {
    const updateConfig = await submit({
      resourceId: '32',
      rawInput: 'Titel: {{ title }}',
      resourceIdRelativePath: 'geen id',
    });

    expect(updateConfig).toHaveBeenCalledTimes(1);
  });

  it('asks for an [id] when no resource is linked and the path has none', async () => {
    const updateConfig = await submit({
      resourceId: '',
      rawInput: 'Titel: {{ title }}',
      resourceIdRelativePath: 'geen id',
    });

    expect(updateConfig).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Specificeer een [id] veld');
  });

  it('saves when no resource is linked and the path has an [id]', async () => {
    const updateConfig = await submit({
      resourceId: '',
      rawInput: 'Titel: {{ title }}',
      resourceIdRelativePath: '/plan/[id]',
    });

    expect(updateConfig).toHaveBeenCalledTimes(1);
  });
});
