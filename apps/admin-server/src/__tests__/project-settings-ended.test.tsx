// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import ProjectSettings from '@/pages/projects/[project]/settings/index';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const project = vi.hoisted(() => ({
  data: undefined as any,
  updateProject: undefined as any,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { project: '2' },
    events: { on() {}, off() {}, emit() {} },
    push() {},
  }),
}));

vi.mock('@/hooks/use-project', () => ({
  useProject: () => ({
    data: project.data,
    isLoading: false,
    updateProject: project.updateProject,
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/simple-calender-popup', () => ({
  SimpleCalendar: () => null,
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let controller: ReturnType<typeof useSaveController>;
const barStates: string[] = [];

function Bar() {
  controller = useSaveController();
  barStates.push(controller.state);
  return null;
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function storedProject(endDate: string) {
  return {
    id: 2,
    name: 'Plannen',
    url: 'plannen.example.nl',
    config: {
      project: { endDate, projectToggle: true, projectHasEnded: false },
      basicAuth: { active: false },
    },
  };
}

describe('Project beëindigen on the project settings page', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    project.updateProject = vi.fn(async (config: any) => ({
      ...project.data,
      config: {
        ...project.data.config,
        project: { ...project.data.config.project, ...config.project },
      },
    }));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function openPage() {
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <ProjectSettings />
        </SaveControllerProvider>
      )
    );
    await flush();
  }

  function typeInto(field: string, value: string) {
    const input = container.querySelector(
      `input[name="${field}"]`
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

  async function switchProjectEnded() {
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(
      (element) => element.textContent?.includes('Project beëindigen')
    ) as HTMLElement;
    act(() => tab.focus());
    await flush();
    const toggle = container.querySelector('[role="switch"]') as HTMLElement;
    act(() => toggle.click());
    await flush();
  }

  it('opens an ended project without showing a change', async () => {
    project.data = {
      ...storedProject('2020-01-31T00:00:00.000Z'),
      config: {
        ...storedProject('2020-01-31T00:00:00.000Z').config,
        project: {
          endDate: '2020-01-31T00:00:00.000Z',
          projectHasEnded: true,
        },
      },
    };
    barStates.length = 0;
    await openPage();

    expect(barStates).not.toContain('dirty');
  });

  it('ends a project whose end date has passed, and sends only that', async () => {
    project.data = storedProject('2020-01-31T00:00:00.000Z');
    await openPage();
    await switchProjectEnded();
    expect(controller.state).toBe('dirty');

    act(() => controller.triggerSave());
    await flush();

    expect(controller.errorMessage).toBeNull();
    expect(project.updateProject).toHaveBeenCalledTimes(1);
    expect(project.updateProject).toHaveBeenCalledWith({
      project: { projectHasEnded: true },
    });
  });

  it('names the field and its tab when Projectinformatie is not valid', async () => {
    project.data = storedProject('2099-01-31T00:00:00.000Z');
    await openPage();
    typeInto('name', '');
    await flush();
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(
      (element) => element.textContent?.includes('Beveiligingsheaders')
    ) as HTMLElement;
    act(() => tab.focus());
    await flush();
    expect(container.querySelector('input[name="name"]')).toBeNull();

    act(() => controller.triggerSave());
    await flush();

    expect(controller.errorMessage).toBe(
      'Projectinformatie: Controleer het veld "Projectnaam".'
    );
    expect(container.querySelector('input[name="name"]')).not.toBeNull();
    expect(project.updateProject).not.toHaveBeenCalled();
  });

  it('saves a changed project name and the ended switch separately', async () => {
    project.data = storedProject('2099-01-31T00:00:00.000Z');
    await openPage();
    typeInto('name', 'Nieuwe naam');
    await flush();
    await switchProjectEnded();

    act(() => controller.triggerSave());
    await flush();

    expect(controller.errorMessage).toBeNull();
    expect(project.updateProject).toHaveBeenCalledTimes(2);
    const [first, second] = project.updateProject.mock.calls;
    expect(first[1]).toBe('Nieuwe naam');
    expect(first[0].project).not.toHaveProperty('projectHasEnded');
    expect(second).toEqual([{ project: { projectHasEnded: true } }]);
  });
});
