/** @vitest-environment jsdom */
import { NotificationForm } from '@/components/notification-form';
import { SaveControllerProvider } from '@/components/ui/save-controller';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  defaultTemplate: undefined as { subject: string; body: string } | undefined,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '103' },
    events: { on() {}, off() {}, emit() {} },
    push() {},
  }),
}));

vi.mock('swr', () => ({
  default: () => ({
    data: state.defaultTemplate,
    isLoading: !state.defaultTemplate,
  }),
}));

vi.mock('@/hooks/use-notification-template', () => ({
  default: () => ({
    data: [],
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    preview: async ({ subject, body }: { subject: string; body: string }) => ({
      subject,
      html: body,
      mjml: body,
    }),
  }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe('notification form preview', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    state.defaultTemplate = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function renderForm() {
    act(() =>
      root.render(
        <SaveControllerProvider>
          <NotificationForm type="contact message - user" />
        </SaveControllerProvider>
      )
    );
  }

  it('shows the default template once it arrives after the first render', async () => {
    renderForm();
    await flush();

    state.defaultTemplate = {
      subject: 'Onderwerp',
      body: '<mjml>test ian</mjml>',
    };
    renderForm();
    await flush();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    await flush();

    const preview = container.querySelector('iframe')?.getAttribute('srcdoc');
    expect(preview).toContain('test ian');
    expect(preview).not.toContain('Inhoud is leeg.');
  });
});
