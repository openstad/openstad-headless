// @vitest-environment jsdom
import DocumentGeneral from '@/pages/projects/[project]/widgets/documentmap/[id]/general';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2', id: '193' },
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

describe('Document map relative path field', () => {
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

  async function render(props: Record<string, string>) {
    act(() =>
      root.render(
        <DocumentGeneral
          {...(props as any)}
          projectId="2"
          updateConfig={vi.fn()}
          onFieldChanged={() => {}}
        />
      )
    );
    await act(async () => {});
    return container.querySelector(
      'input[name="resourceIdRelativePath"]'
    ) as HTMLInputElement | null;
  }

  it('shows the stored path when no resource is linked', async () => {
    const input = await render({ resourceIdRelativePath: '/plan/[id]' });

    expect(input?.value).toBe('/plan/[id]');
  });

  it('hides the path when a resource is linked', async () => {
    const input = await render({
      resourceId: '32',
      resourceIdRelativePath: '/plan/[id]',
    });

    expect(input).toBeNull();
  });
});
