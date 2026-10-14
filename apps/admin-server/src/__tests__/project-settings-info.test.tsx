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

const calendar = vi.hoisted(() => ({ next: undefined as Date | undefined }));

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
  SimpleCalendar: ({ form, fieldName }: any) => (
    <button
      type="button"
      data-calendar={fieldName}
      onClick={() =>
        form.setValue(fieldName, calendar.next, { shouldDirty: true })
      }
    />
  ),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let controller: ReturnType<typeof useSaveController>;

function Bar() {
  controller = useSaveController();
  return null;
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function storedProject(project: Record<string, unknown>, url = '') {
  return {
    id: 2,
    name: 'Plannen',
    url,
    config: {
      project: { projectHasEnded: false, ...project },
      basicAuth: { active: false },
    },
  };
}

describe('Projectinformatie on the project settings page', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    calendar.next = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    project.updateProject = vi.fn(async () => project.data);
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
          <ProjectSettings cmsUrl="" />
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

  async function pickEndDate(date: Date) {
    calendar.next = date;
    const button = container.querySelector(
      '[data-calendar="endDate"]'
    ) as HTMLButtonElement;
    act(() => button.click());
    await flush();
  }

  async function save() {
    act(() => controller.triggerSave());
    await flush();
    await flush();
  }

  const websiteSwitch = () =>
    container.querySelectorAll('[role="switch"]')[0] as HTMLElement;

  async function flipWebsite() {
    act(() => websiteSwitch().click());
    await flush();
  }

  it('saves a new name when the stored end date has passed', async () => {
    project.data = storedProject({ endDate: '2020-01-31T00:00:00.000Z' });
    await openPage();
    typeInto('name', 'Nieuwe naam');
    await flush();

    await save();

    expect(controller.errorMessage).toBeNull();
    const [config, name] = project.updateProject.mock.calls[0];
    expect(name).toBe('Nieuwe naam');
    expect(new Date(config.project.endDate).toISOString()).toBe(
      '2020-01-31T00:00:00.000Z'
    );
  });

  it('saves a new name when no end date was stored and its default has passed', async () => {
    project.data = storedProject({});
    await openPage();
    typeInto('name', 'Nieuwe naam');
    await flush();
    const later = Date.now() + 200 * 24 * 60 * 60 * 1000;
    const now = vi.spyOn(Date, 'now').mockReturnValue(later);

    await save();
    now.mockRestore();

    expect(controller.errorMessage).toBeNull();
    expect(project.updateProject).toHaveBeenCalledTimes(1);
  });

  it('refuses a newly chosen end date in the past', async () => {
    project.data = storedProject({ endDate: '2099-01-31T00:00:00.000Z' });
    await openPage();
    await pickEndDate(new Date(2021, 4, 5));

    await save();

    expect(controller.errorMessage).toBe(
      'Projectinformatie: Controleer het veld "Einddatum".'
    );
    expect(project.updateProject).not.toHaveBeenCalled();
  });

  it('still refuses today, as before', async () => {
    project.data = storedProject({ endDate: '2099-01-31T00:00:00.000Z' });
    await openPage();
    await pickEndDate(new Date(new Date().toDateString()));

    await save();

    expect(controller.errorMessage).toBe(
      'Projectinformatie: Controleer het veld "Einddatum".'
    );
  });

  it('saves a future end date', async () => {
    project.data = storedProject({ endDate: '2020-01-31T00:00:00.000Z' });
    await openPage();
    await pickEndDate(new Date(2100, 0, 1));

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(project.updateProject).toHaveBeenCalledTimes(1);
  });

  it('leaves nothing to save after switching the website on and off', async () => {
    project.data = storedProject({
      endDate: '2099-01-31T00:00:00.000Z',
      projectToggle: false,
      lastUrl: 'oud.example.nl',
    });
    await openPage();
    await flipWebsite();
    expect(
      (container.querySelector('input[name="url"]') as HTMLInputElement).value
    ).toBe('oud.example.nl');
    expect(controller.state).toBe('dirty');

    await flipWebsite();
    expect(controller.state).not.toBe('dirty');

    typeInto('name', 'Nieuwe naam');
    await flush();
    await save();
    const [config, , url] = project.updateProject.mock.calls[0];
    expect(config.project.lastUrl).toBe('oud.example.nl');
    expect(config.project.projectToggle).toBe(false);
    expect(url).toBe('');
  });

  it('leaves nothing to save after switching a new website on and off', async () => {
    project.data = storedProject({
      endDate: '2099-01-31T00:00:00.000Z',
      projectToggle: false,
    });
    await openPage();
    await flipWebsite();
    expect(controller.state).toBe('dirty');

    await flipWebsite();

    expect(controller.state).not.toBe('dirty');
  });

  it('keeps the stored URL when the website is switched off and on again', async () => {
    project.data = storedProject(
      { endDate: '2099-01-31T00:00:00.000Z', projectToggle: true },
      'plannen.example.nl'
    );
    await openPage();
    await flipWebsite();
    expect(controller.state).toBe('dirty');

    await flipWebsite();

    expect(controller.state).not.toBe('dirty');
    expect(
      (container.querySelector('input[name="url"]') as HTMLInputElement).value
    ).toBe('plannen.example.nl');
  });
});
