// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import ProjectSettingsMap from '@/pages/projects/[project]/settings/map';
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

vi.mock('../hooks/use-project', () => ({
  useProject: () => ({
    data: project.data,
    isLoading: false,
    updateProject: project.updateProject,
  }),
}));

vi.mock('@/hooks/use-areas', () => ({ default: () => ({ data: [] }) }));

vi.mock('@/components/ui/form-object-select-field', () => ({
  FormObjectSelectField: () => null,
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/select', async () => {
  const React = await import('react');
  const Choice = React.createContext<any>(null);
  return {
    Select: ({ value, onValueChange, children }: any) => (
      <Choice.Provider value={{ value, onValueChange }}>
        {children}
      </Choice.Provider>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => {
      const choice = React.useContext(Choice);
      return (
        <select
          value={choice.value ?? ''}
          onChange={(event) => choice.onValueChange(event.target.value)}>
          {children}
        </select>
      );
    },
    SelectItem: ({ value, children }: any) => (
      <option value={value}>{children}</option>
    ),
  };
});

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

describe('Marker clustering on the project map settings page', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    project.updateProject = vi.fn(async () => project.data);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function openPage(map: Record<string, unknown> = {}) {
    project.data = { id: 2, name: 'Plannen', config: { map } };
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <ProjectSettingsMap />
        </SaveControllerProvider>
      )
    );
    await flush();
  }

  function clusteringSelect() {
    return Array.from(container.querySelectorAll('select')).find((select) =>
      Array.from(select.options).some((option) => option.value === 'off')
    ) as HTMLSelectElement;
  }

  it('shows the labelled select with the four levels', async () => {
    await openPage();
    expect(container.textContent).toContain('Markers samenvoegen (clustering)');
    expect(
      Array.from(clusteringSelect().options).map((option) => option.textContent)
    ).toEqual(['Uit', 'Laag', 'Middel', 'Hoog']);
  });

  it('defaults to Uit when nothing is saved', async () => {
    await openPage();
    expect(clusteringSelect().value).toBe('off');
  });

  it('loads the saved value', async () => {
    await openPage({ clustering: 'high' });
    expect(clusteringSelect().value).toBe('high');
  });

  it('sends map.clustering on save', async () => {
    await openPage();
    const select = clusteringSelect();
    act(() => {
      select.value = 'medium';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await flush();
    act(() => controller.triggerSave());
    await flush();
    await flush();
    expect(project.updateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        map: expect.objectContaining({ clustering: 'medium' }),
      })
    );
  });
});
