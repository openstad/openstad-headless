// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import RequiredFields from '@/pages/projects/[project]/authentication/requiredfields';
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
    pathname: '/projects/[project]/authentication/requiredfields',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

const PROVIDER_CONFIG = {
  requiredFields: { title: 'Vul je gegevens in', info: 'Uitleg' },
};

describe('Verplichte velden before the settings loaded', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = () =>
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <RequiredFields />
        </SaveControllerProvider>
      )
    );

  beforeEach(() => {
    project.puts = [];
    project.data = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const firstBox = () =>
    container.querySelector(
      '[role="tabpanel"][data-state="active"] button[role="checkbox"]'
    ) as HTMLButtonElement;

  const openTab = (label: string) => {
    const trigger = Array.from(container.querySelectorAll('[role="tab"]')).find(
      (tab) => tab.textContent === label
    ) as HTMLElement;
    act(() => {
      trigger.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, button: 0 })
      );
    });
  };

  async function save() {
    act(() => controller.triggerSave());
    await settle();
  }

  it('refuses to save before the settings have loaded', async () => {
    render();
    await settle();
    act(() => firstBox().click());
    await settle();
    expect(controller.state).toBe('dirty');

    await save();

    expect(project.puts).toHaveLength(0);
    expect(controller.errorMessage).toBe(
      'De instellingen zijn nog niet geladen.'
    );
  });

  it('saves the anonymous tab when only its settings exist', async () => {
    project.data = {
      config: {
        auth: {
          provider: {
            anonymous: {
              requiredUserFields: ['postcode'],
              config: PROVIDER_CONFIG,
            },
          },
        },
      },
    };
    render();
    await settle();
    openTab('Anonieme gebruikers');
    await settle();
    act(() => firstBox().click());
    await settle();

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(project.puts.length).toBeGreaterThan(0);
    expect(project.puts[0].auth.provider.anonymous).toBeDefined();
  });

  it('saves the user tab once its settings have loaded', async () => {
    project.data = {
      config: {
        auth: {
          provider: {
            openstad: { requiredUserFields: [], config: PROVIDER_CONFIG },
          },
        },
      },
    };
    render();
    await settle();
    act(() => firstBox().click());
    await settle();

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(
      project.puts[0].auth.provider.openstad.config.requiredFields
    ).toMatchObject({ title: 'Vul je gegevens in', info: 'Uitleg' });
  });
});
