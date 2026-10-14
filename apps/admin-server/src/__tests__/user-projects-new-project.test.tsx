// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import UserProjects from '@/pages/users/[user]/projects';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const users = vi.hoisted(() => ({
  list: [] as any[],
  server: [] as any[],
  refreshFails: false,
  updateUser: undefined as any,
  createUser: undefined as any,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { user: 'b3BlbnN0YWQtKi0y' },
    pathname: '/users/[user]',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/hooks/use-project-list', () => ({
  default: () => ({
    data: [
      { id: 1, name: 'Bestaand project' },
      { id: 2, name: 'Nieuw project' },
    ],
  }),
}));

vi.mock('@/hooks/use-user', () => ({
  default: () => ({
    data: users.list,
    updateUser: users.updateUser,
    mutate: async () => {
      if (users.refreshFails) throw new Error('Netwerkfout');
      return users.server;
    },
  }),
}));

vi.mock('@/hooks/use-users', () => ({
  default: () => ({ createUser: users.createUser }),
}));

vi.mock('@/components/user-role-dropdown-list', () => ({
  default: ({ roleId, addProject }: any) => (
    <select
      data-role
      value={roleId || ''}
      onChange={(event) => addProject(event.target.value)}>
      <option value="">Geen rol</option>
      <option value="member">Normale gebruiker</option>
      <option value="editor">Editor</option>
    </select>
  ),
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

const EXISTING = {
  id: 31,
  projectId: 1,
  role: 'admin',
  emailNotificationConsent: false,
  idpUser: { identifier: '7', provider: 'openstad' },
};

describe('Projectsrechten: role and consent for a project the user is not in', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    users.list = [{ ...EXISTING }];
    users.server = [{ ...EXISTING }];
    users.refreshFails = false;
    users.updateUser = vi.fn(async (body: any) => body);
    users.createUser = vi.fn(async (user: any) => {
      const created = { ...user, id: 99, emailNotificationConsent: null };
      users.server = [...users.server, created];
      return created;
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <UserProjects />
        </SaveControllerProvider>
      )
    );
    await settle();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function chooseRoleAndConsent(clicks: number) {
    const selects = container.querySelectorAll('select[data-role]');
    const select = selects[1] as HTMLSelectElement;
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value'
      )!.set!.call(select, 'member');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await settle();
    const rows = container.querySelectorAll('li');
    const consent = rows[1].querySelector(
      'button[role="checkbox"]'
    ) as HTMLButtonElement;
    for (let i = 0; i < clicks; i += 1) {
      act(() => consent.click());
      await settle();
    }
  }

  async function save() {
    act(() => controller.triggerSave());
    await settle();
    await settle();
  }

  it('creates the user once and then stores the consent', async () => {
    await chooseRoleAndConsent(1);

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(users.createUser).toHaveBeenCalledTimes(1);
    expect(users.createUser.mock.calls[0][0]).toMatchObject({
      projectId: 2,
      role: 'member',
    });
    expect(users.updateUser).toHaveBeenCalledWith({
      id: 99,
      projectId: 2,
      emailNotificationConsent: true,
    });
  });

  it('stores a consent that was switched off again as false', async () => {
    await chooseRoleAndConsent(2);

    await save();

    expect(users.createUser).toHaveBeenCalledTimes(1);
    expect(users.updateUser).toHaveBeenCalledWith({
      id: 99,
      projectId: 2,
      emailNotificationConsent: false,
    });
  });

  it('stores the consent on a retry when it failed after the user was created', async () => {
    users.updateUser = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('De gebruiker kon niet worden bijgewerkt.')
      )
      .mockImplementation(async (body: any) => body);
    await chooseRoleAndConsent(1);

    await save();
    expect(controller.errorMessage).not.toBeNull();

    await save();

    expect(controller.errorMessage).toBeNull();
    expect(users.createUser).toHaveBeenCalledTimes(1);
    expect(users.updateUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 99, emailNotificationConsent: true })
    );
  });

  it('does not create the user again when the retry cannot refresh', async () => {
    users.updateUser = vi
      .fn()
      .mockRejectedValueOnce(new Error('Netwerkfout'))
      .mockImplementation(async (body: any) => body);
    await chooseRoleAndConsent(1);
    await save();
    expect(controller.errorMessage).not.toBeNull();

    users.refreshFails = true;
    await save();

    expect(users.createUser).toHaveBeenCalledTimes(1);
    expect(users.updateUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 99, emailNotificationConsent: true })
    );
    expect(controller.errorMessage).toBeNull();
  });
});
