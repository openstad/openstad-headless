// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import AuthenticationPage from '@/pages/projects/[project]/authentication/index';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const project = vi.hoisted(() => ({
  data: undefined as any,
  puts: [] as any[],
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2' },
    pathname: '/projects/[project]/authentication',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/image-uploader', () => ({ ImageUploader: () => null }));

vi.mock('@/hooks/use-project', () => ({
  useProject: () => ({
    data: project.data,
    updateProject: async (config: unknown) => {
      project.puts.push(config);
      return { id: 2 };
    },
  }),
}));

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

const STORED = {
  contactEmail: 'hulp@example.org',
  fromEmail: 'noreply@example.org',
  fromName: 'Gemeente',
};

describe('login e-mail addresses on the Authenticatie page', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    project.puts = [];
    project.data = {
      config: {
        auth: {
          provider: { openstad: { authTypes: ['Url'], config: STORED } },
        },
      },
    };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <AuthenticationPage whitelistedEmails={[]} />
        </SaveControllerProvider>
      )
    );
    await settle();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function typeInto(name: string, value: string) {
    const input = container.querySelector(
      `input[name="${name}"]`
    ) as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setValue.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  async function save() {
    act(() => controller.triggerSave());
    await settle();
  }

  it('stops a save that empties a stored address, and names the field', async () => {
    typeInto('fromEmail', '');
    await settle();
    await save();

    expect(project.puts).toHaveLength(0);
    expect(controller.errorMessage).toBe(
      '"Afzender adres van login e-mails" kan niet leeg worden opgeslagen. Vul een e-mailadres in.'
    );
  });

  it('does not stop a save on the sender address once login links are turned off', async () => {
    typeInto('fromEmail', '');
    const loginLinks = Array.from(
      container.querySelectorAll('button[role="checkbox"]')
    ).find((box) =>
      box.closest('div')?.textContent?.includes('E-mail een inloglink')
    ) as HTMLButtonElement;
    act(() => loginLinks.click());
    await settle();
    expect(container.querySelector('input[name="fromEmail"]')).toBeNull();

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(project.puts.length).toBeGreaterThan(0);
  });
});
