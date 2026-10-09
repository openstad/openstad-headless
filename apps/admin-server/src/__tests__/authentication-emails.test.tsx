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

  function rerender() {
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <AuthenticationPage whitelistedEmails={[]} />
        </SaveControllerProvider>
      )
    );
  }

  it('saves again before the refresh after a save has landed', async () => {
    typeInto('fromName', 'Gemeente A');
    await settle();
    await save();
    expect(project.puts).toHaveLength(2);

    // The save answers with the project without its auth settings.
    project.data = {
      config: { auth: { provider: { openstad: { authTypes: ['Url'] } } } },
    };
    rerender();
    await settle();
    typeInto('fromName', 'Gemeente B');
    await settle();
    await save();

    expect(controller.errorMessage).toBeNull();
    expect(project.puts).toHaveLength(4);
    expect(project.puts[3].auth.provider.openstad.config.fromName).toBe(
      'Gemeente B'
    );
  });

  it('still refuses to save before the settings have loaded', async () => {
    act(() => root.unmount());
    project.data = undefined;
    root = createRoot(container);
    rerender();
    await settle();
    // The sender fields only show with login links on, which is not known yet.
    typeInto('clientDisclaimerText', 'Privacy');
    await settle();
    await save();

    expect(project.puts).toHaveLength(0);
    expect(controller.errorMessage).toBe(
      'De instellingen zijn nog niet geladen.'
    );
  });

  it('keeps the stored login methods when a field was edited before they loaded', async () => {
    act(() => root.unmount());
    project.data = undefined;
    root = createRoot(container);
    rerender();
    await settle();
    typeInto('clientDisclaimerText', 'Privacy');
    await settle();

    project.data = {
      config: {
        auth: {
          provider: {
            openstad: { authTypes: ['UniqueCode', 'Url'], config: STORED },
          },
        },
      },
    };
    rerender();
    await settle();
    await save();

    expect(controller.errorMessage).toBeNull();
    const sent = project.puts[0].auth.provider.openstad;
    expect(sent.authTypes).toEqual(['UniqueCode', 'Url']);
    expect(sent.config.fromEmail).toBe('noreply@example.org');
    expect(sent.config.clientDisclaimerText).toBe('Privacy');
  });

  it('stops emptying an address right after the save that set it', async () => {
    act(() => root.unmount());
    project.data = {
      config: {
        auth: {
          provider: {
            openstad: {
              authTypes: ['Url'],
              config: { ...STORED, contactEmail: undefined },
            },
          },
        },
      },
    };
    root = createRoot(container);
    rerender();
    await settle();
    typeInto('contactEmail', 'nieuw@example.org');
    await settle();
    await save();
    expect(project.puts).toHaveLength(2);

    // The save answers with the project without its auth settings.
    project.data = {
      config: { auth: { provider: { openstad: { authTypes: ['Url'] } } } },
    };
    rerender();
    await settle();
    typeInto('contactEmail', '');
    await settle();
    await save();

    expect(project.puts).toHaveLength(2);
    expect(controller.errorMessage).toBe(
      '"E-mailadres voor contact en hulpvragen" kan niet leeg worden opgeslagen. Vul een e-mailadres in.'
    );
  });

  it('does not refuse an address that the save just before stored empty', async () => {
    const loginLinks = () =>
      Array.from(container.querySelectorAll('button[role="checkbox"]')).find(
        (box) =>
          box.closest('div')?.textContent?.includes('E-mail een inloglink')
      ) as HTMLButtonElement;
    typeInto('fromEmail', '');
    act(() => loginLinks().click());
    await settle();
    await save();
    expect(project.puts).toHaveLength(2);

    // The save answers with the project without its auth settings.
    project.data = {
      config: { auth: { provider: { openstad: { authTypes: [] } } } },
    };
    rerender();
    await settle();
    act(() => loginLinks().click());
    await settle();
    typeInto('fromName', 'Gemeente D');
    await settle();
    await save();

    expect(controller.errorMessage).toBeNull();
    expect(project.puts).toHaveLength(4);
  });
});
